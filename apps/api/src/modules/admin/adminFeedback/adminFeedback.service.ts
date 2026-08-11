import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { S3Service } from '@/common/s3/s3.service';

import { IGetFeedbackQuery } from './interfaces/getFeedback.interface';
import { Prisma } from '@/generated/prisma/client';
import { FeedbackStatus } from '@/generated/prisma/enums';

/**
 * How much of the free text the list endpoint sends. Staff scan the queue on
 * the preview and open the ones worth reading in full, so shipping four
 * thousand characters per row would be dead weight.
 */
export const FEEDBACK_PREVIEW_LENGTH = 160;

@Injectable()
export class AdminFeedbackService {

    constructor(
        private readonly database: DatabaseService,
        private readonly s3Service: S3Service,
    ) { }

    /**
     * Get paginated feedback submissions, newest first.
     *
     * Rows filed by signed-out visitors come back with `submitter: null` and
     * `isAnonymous: true` so the admin table can say "Anonymous" out loud
     * instead of rendering an empty cell that reads like a data bug.
     */
    public async getFeedback(query: IGetFeedbackQuery) {
        const {
            page = 1,
            limit = 10,
            status,
        } = query;

        const skip = (page - 1) * limit;

        const where: Prisma.FeedbackWhereInput = {
            ...(status && { status }),
        };

        const [feedback, count] = await Promise.all([

            this.database.feedback.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },

                select: {
                    id: true,
                    status: true,

                    message: true,
                    pageUrl: true,
                    locale: true,

                    attachmentKey: true,

                    createdAt: true,
                    updatedAt: true,

                    user: {
                        select: {
                            id: true,
                            publicId: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),

            this.database.feedback.count({
                where,
            }),
        ]);

        return {
            data: feedback.map((row) => ({
                id: row.id,
                status: row.status,

                messagePreview: this.buildPreview(row.message),

                pageUrl: row.pageUrl,
                locale: row.locale,

                hasAttachment: Boolean(row.attachmentKey),

                createdAt: row.createdAt,
                updatedAt: row.updatedAt,

                isAnonymous: !row.user,
                submitter: row.user ?? null,
            })),

            count,
        };
    }

    /**
     * Get how many submissions sit in each triage lane, so the admin surface
     * can show the size of the queue before staff filter it down.
     */
    public async getStatusCounts() {

        const grouped = await this.database.feedback.groupBy({
            by: ['status'],

            _count: {
                _all: true,
            },
        });

        // Start from every lane at zero — an empty lane must still be listed,
        // otherwise the UI silently drops the filter for it.
        const counts: Record<FeedbackStatus, number> = {
            [FeedbackStatus.NEW]: 0,
            [FeedbackStatus.IN_REVIEW]: 0,
            [FeedbackStatus.RESOLVED]: 0,
            [FeedbackStatus.DECLINED]: 0,
        };

        for (const row of grouped) {
            counts[row.status] = row._count._all;
        }

        return counts;
    }

    /**
     * Get a single submission in full, including a short-lived signed URL for
     * its attachment. The storage key never leaves the API.
     */
    public async getFeedbackDetail(feedbackId: string) {

        const feedback = await this.database.feedback.findUnique({
            where: {
                id: feedbackId,
            },

            select: {
                id: true,
                status: true,

                message: true,
                pageUrl: true,
                locale: true,
                userAgent: true,

                attachmentKey: true,
                attachmentName: true,
                attachmentMimeType: true,
                attachmentSize: true,

                createdAt: true,
                updatedAt: true,

                user: {
                    select: {
                        id: true,
                        publicId: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!feedback) {
            throw new NotFoundException(
                'Feedback not found',
            );
        }

        const attachment = feedback.attachmentKey
            ? {
                name: feedback.attachmentName,
                mimeType: feedback.attachmentMimeType,
                size: feedback.attachmentSize,
                url: await this.s3Service.gets3SignedUrl(feedback.attachmentKey),
            }
            : null;

        return {
            id: feedback.id,
            status: feedback.status,

            message: feedback.message,

            pageUrl: feedback.pageUrl,
            locale: feedback.locale,
            userAgent: feedback.userAgent,

            attachment,

            createdAt: feedback.createdAt,
            updatedAt: feedback.updatedAt,

            isAnonymous: !feedback.user,
            submitter: feedback.user ?? null,
        };
    }

    /**
     * Move a submission to another triage lane.
     *
     * Any lane can reach any other on purpose: a "resolved" report that turns
     * out to still be broken has to be able to go back to IN_REVIEW without
     * staff re-filing it.
     */
    public async updateStatus(
        feedbackId: string,
        status: FeedbackStatus,
    ) {

        const feedback = await this.database.feedback.findUnique({
            where: {
                id: feedbackId,
            },

            select: {
                id: true,
            },
        });

        if (!feedback) {
            throw new NotFoundException(
                'Feedback not found',
            );
        }

        const updated = await this.database.feedback.update({
            where: {
                id: feedbackId,
            },

            data: {
                status,
            },

            select: {
                id: true,
                status: true,
                updatedAt: true,
            },
        });

        return {
            success: true,
            message: 'Feedback status updated successfully',
            feedback: updated,
        };
    }

    /**
     * Trim the free text down to a scannable preview, marking it when there
     * is more to read.
     */
    private buildPreview(message: string): string {
        const collapsed = message.replace(/\s+/g, ' ').trim();

        if (collapsed.length <= FEEDBACK_PREVIEW_LENGTH) {
            return collapsed;
        }

        return `${collapsed.slice(0, FEEDBACK_PREVIEW_LENGTH).trimEnd()}…`;
    }
}
