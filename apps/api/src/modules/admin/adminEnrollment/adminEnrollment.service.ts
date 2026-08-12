import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { UserService } from '@/modules/user/user.service';
import { DocumentService } from '@/modules/document/document.service';

import { IGetEnrollmentsQuery } from './interfaces/getEnrollment.interface';
import { Prisma } from '@/generated/prisma/client';
import {
    AncestryRelation,
    AncestryVerificationStatus,
    DocumentType,
    EnrollmentStatus,
    NoticeChannel,
    NoticeStatus,
} from '@/generated/prisma/enums';

/**
 * What staff chose when rejecting: the reason recorded on the decision, and
 * which of the member's registered channels they asked to be notified on.
 */
export interface RejectEnrollmentOptions {
    reason?: string;
    channels?: NoticeChannel[];
    decidedById?: string;
}

@Injectable()
export class AdminEnrollmentService {

    constructor(
        private readonly database: DatabaseService,
        private readonly userService: UserService,
        private readonly documentService: DocumentService,
    ) { }

    /**
     * Get paginated enrollments
     */
    async getEnrollments(query: IGetEnrollmentsQuery) {
        const {
            page = 1,
            limit = 10,
            status,
            search,
        } = query;

        const skip = (page - 1) * limit;

        // Build where condition
        const where: Prisma.EnrollmentWhereInput = {
            ...(status && { status }),

            ...(search && {
                OR: [
                    {
                        firstName: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        lastName: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },

                    {
                        user: {
                            email: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            }),
        };

        // Get enrollments + total count
        const [enrollments, count] = await Promise.all([

            this.database.enrollment.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },

                select: {
                    id: true,
                    status: true,

                    firstName: true,
                    lastName: true,

                    approvalDate: true,

                    user: {
                        select: {
                            id: true,
                            publicId: true,
                            name: true,
                            email: true,

                            documents: {
                                where: {
                                    type: DocumentType.PROFILE_PICTURE,
                                },

                                take: 1,
                                select: {
                                    id: true,
                                    fileKey: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.database.enrollment.count({
                where,
            }),
        ]);

        // Format response
        const formattedEnrollments = await Promise.all(
            enrollments.map(async (enrollment) => {

                // Get profile picture URL (if exists)
                const profilePicture =
                    enrollment.user.documents.length > 0
                        ? await this.documentService.getPublicUrl(
                            enrollment.user.documents[0].fileKey,
                        )
                        : null;

                return {
                    id: enrollment.id,
                    status: enrollment.status,

                    firstName: enrollment.firstName,
                    lastName: enrollment.lastName,

                    user: {
                        id: enrollment.user.id,
                        publicId: enrollment.user.publicId,
                        name: enrollment.user.name,
                        email: enrollment.user.email,

                        profilePicture,
                    },
                };
            }),
        );

        return {
            data: formattedEnrollments,
            count: count,
        };
    }

    /**
     * Get enrollment status counts
     */
    async getStatusCounts() {

        const [
            totalDraft,
            totalSubmitted,
            totalApproved,
            totalRejected,
        ] = await Promise.all([

            this.database.enrollment.count({
                where: {
                    status: EnrollmentStatus.DRAFT,
                },
            }),

            this.database.enrollment.count({
                where: {
                    status: EnrollmentStatus.SUBMITTED,
                },
            }),

            this.database.enrollment.count({
                where: {
                    status: EnrollmentStatus.APPROVED,
                },
            }),

            this.database.enrollment.count({
                where: {
                    status: EnrollmentStatus.REJECTED,
                },
            }),
        ]);

        return {
            DRAFT: totalDraft,
            SUBMITTED: totalSubmitted,
            APPROVED: totalApproved,
            REJECTED: totalRejected,
        };
    }

    /**
     * Get the consent acceptance summary for an enrollment
     */
    public async getConsents(enrollmentId: string) {

        const enrollment = await this.database.enrollment.findUnique({
            where: {
                id: enrollmentId,
            },

            include: {
                consent: {
                    include: {
                        consent: true,
                    },
                },
            },
        });

        if (!enrollment) {
            throw new NotFoundException(
                'Enrollment not found',
            );
        }

        return {
            consentAccepted: enrollment.consentAccepted,

            consents: enrollment.consent.map((c) => ({
                id: c.consent.id,
                key: c.consent.key,
                version: c.consent.version,
                title: c.consent.title,
                required: c.consent.required,
                accepted: c.accepted,
                acceptedAt: c.acceptedAt,
            })),
        };
    }

    /**
     * Set the admin-attested verification status of an ancestry entry
     */
    public async verifyAncestry(
        enrollmentId: string,
        relation: AncestryRelation,
        status: AncestryVerificationStatus,
        adminUserId: string,
    ) {

        const ancestry = await this.database.ancestry.findUnique({
            where: {
                enrollmentId_relation: {
                    enrollmentId,
                    relation,
                },
            },
        });

        if (!ancestry) {
            throw new NotFoundException(
                'Ancestry entry not found',
            );
        }

        const isVerified = status !== AncestryVerificationStatus.UNVERIFIED;

        return this.database.ancestry.update({
            where: {
                enrollmentId_relation: {
                    enrollmentId,
                    relation,
                },
            },

            data: {
                verificationStatus: status,
                verifiedAt: isVerified ? new Date() : null,
                verifiedByUserId: isVerified ? adminUserId : null,
            },
        });
    }

    /**
     * Approve enrollment
     */
    public async approveEnrollment(
        enrollmentId: string,
    ) {

        // Find enrollment
        const enrollment = await this.database.enrollment.findUnique({
            where: {
                id: enrollmentId,
            },

            include: {
                documents: true,
                steps: true,
            },
        });

        if (!enrollment) {
            throw new BadRequestException(
                'Enrollment not found',
            );
        }

        /**
         * Prevent approving already approved
         */
        if (
            enrollment.status === EnrollmentStatus.APPROVED
        ) {
            throw new BadRequestException(
                'Enrollment already approved',
            );
        }

        /**
         * Check all steps completed
         */
        const allStepsCompleted = enrollment.steps.every(
            (step) => step.isCompleted,
        );

        if (!allStepsCompleted) {
            throw new BadRequestException(
                'All enrollment steps are not completed',
            );
        }

        /**
         * Check required documents verified
         */
        const requiredDocuments = enrollment.documents.filter(
            (doc) => doc.type === DocumentType.USER_PHOTO,
        );

        const allDocumentsVerified = requiredDocuments.every(
            (doc) => doc.verifiedByAdmin,
        );

        if (!allDocumentsVerified) {
            throw new BadRequestException(
                'All required documents must be verified',
            );
        }

        /**
         * Update enrollment
         */
        await this.database.enrollment.update({
            where: {
                id: enrollmentId,
            },

            data: {
                status: EnrollmentStatus.APPROVED,
                approvalDate: new Date(),
            },
        });

        return {
            success: true,
            message: 'Enrollment approved successfully',
        };
    }

    /**
     * Reject enrollment
     */
    public async rejectEnrollment(
        enrollmentId: string,
        options: RejectEnrollmentOptions = {},
    ) {

        // Find enrollment
        const enrollment = await this.database.enrollment.findUnique({
            where: {
                id: enrollmentId,
            },

            include: {
                user: {
                    select: {
                        email: true,
                    },
                },

                contact: {
                    select: {
                        email: true,
                        phoneNumber: true,
                        allowSMS: true,
                    },
                },
            },
        });

        if (!enrollment) {
            throw new BadRequestException(
                'Enrollment not found',
            );
        }

        /**
         * Prevent rejecting approved enrollment
         */
        if (
            enrollment.status === EnrollmentStatus.APPROVED
        ) {
            throw new BadRequestException(
                'Approved enrollment cannot be rejected',
            );
        }

        /**
         * The decision and the notices it should produce are written together:
         * a rejection recorded without its notices would leave no trace that
         * anyone was meant to be told.
         */
        const notices = this.resolveDecisionNotices(
            enrollment,
            options.channels ?? [],
        );

        await this.database.$transaction(async (tx) => {

            await tx.enrollment.update({
                where: {
                    id: enrollmentId,
                },

                data: {
                    status:
                        EnrollmentStatus.REJECTED,

                    approvalDate: null,

                    decisionReason: options.reason?.trim() || null,
                    decidedAt     : new Date(),
                    decidedById   : options.decidedById ?? null,
                },
            });

            if (notices.length > 0) {
                await tx.enrollmentNotice.createMany({
                    data: notices.map((notice) => ({
                        enrollmentId,
                        ...notice,
                    })),
                });
            }
        });

        return {
            success: true,
            message: 'Enrollment rejected successfully',

            /**
             * Queued, NOT sent. Nothing in this API delivers mail or SMS yet;
             * the caller must not describe these as delivered.
             */
            notices: notices.map((notice) => ({
                channel: notice.channel,
                status : notice.status,
            })),
        };
    }

    /**
     * The communication channels this member actually registered.
     *
     * The reject dialog offers only these — an interface that lets staff pick
     * "text them" for a member with no phone on file promises something the
     * system cannot do.
     */
    public async getNotificationChannels(enrollmentId: string) {

        const enrollment = await this.database.enrollment.findUnique({
            where: {
                id: enrollmentId,
            },

            select: {
                user: {
                    select: {
                        email: true,
                    },
                },

                contact: {
                    select: {
                        email: true,
                        phoneNumber: true,
                        phoneType: true,
                        allowSMS: true,
                    },
                },
            },
        });

        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        const channels: {
            channel: NoticeChannel;
            destination: string;
            available: boolean;
            note?: string;
        }[] = [];

        if (enrollment.user?.email) {
            channels.push({
                channel    : NoticeChannel.ACCOUNT_EMAIL,
                destination: enrollment.user.email,
                available  : true,
            });
        }

        /**
         * Only worth offering when it differs from the account email —
         * otherwise staff are choosing between two names for one inbox.
         */
        if (
            enrollment.contact?.email
            && enrollment.contact.email !== enrollment.user?.email
        ) {
            channels.push({
                channel    : NoticeChannel.CONTACT_EMAIL,
                destination: enrollment.contact.email,
                available  : true,
            });
        }

        if (enrollment.contact?.phoneNumber) {
            channels.push({
                channel    : NoticeChannel.SMS,
                destination: enrollment.contact.phoneNumber,
                available  : enrollment.contact.allowSMS,

                note: enrollment.contact.allowSMS
                    ? undefined
                    : 'This member did not consent to SMS',
            });
        }

        return { channels };
    }

    /**
     * Turn the channels staff asked for into notice rows.
     *
     * A channel with no destination on file is skipped entirely — there is
     * nothing to queue. SMS is different: if the member never set `allowSMS`
     * we record a SUPPRESSED row rather than skipping, so the reason they were
     * not texted is auditable instead of invisible.
     */
    private resolveDecisionNotices(
        enrollment: {
            user?: { email: string | null } | null;
            contact?: {
                email: string | null;
                phoneNumber: string | null;
                allowSMS: boolean;
            } | null;
        },
        channels: NoticeChannel[],
    ) {

        const requested = new Set(channels);
        const rows: {
            channel: NoticeChannel;
            destination: string;
            status: NoticeStatus;
        }[] = [];

        if (requested.has(NoticeChannel.ACCOUNT_EMAIL) && enrollment.user?.email) {
            rows.push({
                channel    : NoticeChannel.ACCOUNT_EMAIL,
                destination: enrollment.user.email,
                status     : NoticeStatus.PENDING,
            });
        }

        if (requested.has(NoticeChannel.CONTACT_EMAIL) && enrollment.contact?.email) {
            rows.push({
                channel    : NoticeChannel.CONTACT_EMAIL,
                destination: enrollment.contact.email,
                status     : NoticeStatus.PENDING,
            });
        }

        if (requested.has(NoticeChannel.SMS) && enrollment.contact?.phoneNumber) {
            rows.push({
                channel    : NoticeChannel.SMS,
                destination: enrollment.contact.phoneNumber,

                status: enrollment.contact.allowSMS
                    ? NoticeStatus.PENDING
                    : NoticeStatus.SUPPRESSED,
            });
        }

        return rows;
    }

}
