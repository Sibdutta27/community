import { S3Service } from '@/common/s3/s3.service';
import { DatabaseService } from '@/database/database.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
    FEEDBACK_ATTACHMENT_FOLDER,
    FEEDBACK_ATTACHMENT_MAX_SIZE,
    FEEDBACK_ATTACHMENT_MIME_TYPES,
    FEEDBACK_MESSAGE_MAX_LENGTH,
} from './config';

export type CreateFeedbackInput = Readonly<{
    message: string;
    pageUrl: string;
    locale: string;
    userAgent?: string | null;
}>;

@Injectable()
export class FeedbackService {
    private readonly logger = new Logger(FeedbackService.name);

    constructor(
        private readonly database: DatabaseService,
        private readonly s3Service: S3Service,
    ) { }

    /**
     * Record a member's feedback / work order.
     *
     * `userId` is null for signed-out visitors — the widget is reachable from
     * the public pages, and a tester who cannot sign in is exactly the person
     * with something to report.
     *
     * An optional attachment is validated against the feedback policy, stored
     * in the private bucket, and removed again if the row fails to save so no
     * orphan objects are left behind.
     */
    public async createFeedback(
        userId: string | null,
        input: CreateFeedbackInput,
        file?: Express.Multer.File,
    ) {

        const message = input.message?.trim() ?? '';

        if (!message) {
            throw new BadRequestException('A feedback message is required');
        }

        if (message.length > FEEDBACK_MESSAGE_MAX_LENGTH) {
            throw new BadRequestException(
                `The feedback message exceeds the ${FEEDBACK_MESSAGE_MAX_LENGTH} character limit`,
            );
        }

        // Validate before touching storage — a rejected file never gets uploaded.
        const attachment = file ? await this.storeAttachment(file) : null;

        try {
            const feedback = await this.database.$transaction(async (tx) => {
                return await tx.feedback.create({
                    data: {
                        userId,
                        message,
                        pageUrl  : input.pageUrl,
                        locale   : input.locale,
                        userAgent: input.userAgent ?? null,

                        attachmentKey     : attachment?.key ?? null,
                        attachmentName    : attachment?.fileName ?? null,
                        attachmentMimeType: attachment?.mimeType ?? null,
                        attachmentSize    : attachment?.fileSize ?? null,
                    },
                });
            });

            return {
                message : 'Feedback submitted successfully',
                feedback: {
                    id           : feedback.id,
                    createdAt    : feedback.createdAt,
                    hasAttachment: Boolean(feedback.attachmentKey),
                },
            };
        } catch (error) {
            await this.safeDeleteFile(attachment?.key);
            throw error;
        }
    }

    /**
     * Validate the attachment against the feedback policy and put it in the
     * private bucket under a collision-proof key.
     */
    private async storeAttachment(file: Express.Multer.File) {
        this.validateAttachment(file);

        const uploaded = await this.s3Service.uploadFile(
            file,
            FEEDBACK_ATTACHMENT_FOLDER,
            this.buildAttachmentUname(file.originalname),
        );

        return {
            key     : uploaded.key,
            fileName: file.originalname,
            mimeType: uploaded.type,
            fileSize: uploaded.size,
        };
    }

    /**
     * Mime allow-list + size cap for a feedback attachment. Mirrors the
     * per-slot policy approach used by the document module.
     */
    private validateAttachment(file: Express.Multer.File) {
        if (!FEEDBACK_ATTACHMENT_MIME_TYPES.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid attachment type: ${file.mimetype}. Allowed: ${FEEDBACK_ATTACHMENT_MIME_TYPES.join(', ')}`,
            );
        }

        if (typeof file.size !== 'number' || file.size <= 0) {
            throw new BadRequestException('The attached file is empty');
        }

        if (file.size > FEEDBACK_ATTACHMENT_MAX_SIZE) {
            const maxMb = Math.round(FEEDBACK_ATTACHMENT_MAX_SIZE / (1024 * 1024));
            throw new BadRequestException(
                `The attachment exceeds the ${maxMb} MB limit`,
            );
        }
    }

    /**
     * Build a unique, filesystem-safe object name for the attachment so two
     * testers sending "screenshot.png" never collide.
     */
    private buildAttachmentUname(originalName?: string): string {
        const safeFileName =
            (originalName ?? '')
                .trim()
                .replace(/[^A-Za-z0-9._-]+/g, '_')
                .replace(/^_+|_+$/g, '')
                .slice(0, 100) || 'attachment';

        return `${randomUUID()}-${safeFileName}`;
    }

    /**
     * Delete a file safely from s3.
     */
    private async safeDeleteFile(fileKey?: string | null) {
        if (!fileKey) return;

        try {
            await this.s3Service.deleteFile(fileKey);
        } catch {
            this.logger.warn(`Failed to delete S3 file: ${fileKey}`);
        }
    }
}
