import { BadRequestException } from '@nestjs/common';
import { FEEDBACK_ATTACHMENT_MAX_SIZE, FEEDBACK_MESSAGE_MAX_LENGTH } from './config';
import { FeedbackService } from './feedback.service';

const MB = 1024 * 1024;

const submission = {
    message: 'The Enroll button does nothing on this page.',
    pageUrl: 'https://app.example/dashboard',
    locale : 'en',
    userAgent: 'Mozilla/5.0 (Test)',
};

function buildFile(
    overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
    return {
        originalname: 'screenshot.png',
        mimetype    : 'image/png',
        size        : 2 * MB,
        buffer      : Buffer.alloc(0),
        ...overrides,
    } as Express.Multer.File;
}

function buildService() {
    const feedbackDelegate = {
        create: jest.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
            id       : 'feedback-1',
            createdAt: new Date('2026-08-11T00:00:00.000Z'),
            ...data,
        })),
    };

    const tx = { feedback: feedbackDelegate };

    const database = {
        feedback: feedbackDelegate,
        $transaction: jest.fn(async (cb: (t: unknown) => unknown) => cb(tx)),
    };

    const s3Service = {
        uploadFile: jest.fn().mockImplementation(
            async (file: Express.Multer.File, folder: string, uname: string) => ({
                bucket: 'test-bucket',
                key   : `${folder}/${uname}`,
                url   : `https://storage.example/${folder}/${uname}`,
                size  : file.size,
                type  : file.mimetype,
            }),
        ),
        deleteFile: jest.fn().mockResolvedValue(undefined),
    };

    const service = new FeedbackService(database as never, s3Service as never);

    return { service, database, feedbackDelegate, s3Service };
}

describe('FeedbackService.createFeedback — persistence', () => {
    it('records a signed-in submission with the captured page context', async () => {
        const { service, feedbackDelegate } = buildService();

        const result = await service.createFeedback('user-1', submission);

        expect(feedbackDelegate.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId   : 'user-1',
                message  : submission.message,
                pageUrl  : submission.pageUrl,
                locale   : 'en',
                userAgent: submission.userAgent,
                attachmentKey: null,
            }),
        });

        expect(result.feedback.id).toBe('feedback-1');
        expect(result.feedback.hasAttachment).toBe(false);
    });

    it('accepts a signed-out submission with a null user', async () => {
        const { service, feedbackDelegate } = buildService();

        await service.createFeedback(null, { ...submission, userAgent: undefined });

        expect(feedbackDelegate.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ userId: null, userAgent: null }),
        });
    });

    it('trims the message before saving it', async () => {
        const { service, feedbackDelegate } = buildService();

        await service.createFeedback(null, {
            ...submission,
            message: '   the map is blank   ',
        });

        expect(feedbackDelegate.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ message: 'the map is blank' }),
        });
    });
});

describe('FeedbackService.createFeedback — validation', () => {
    it.each(['', '    '])('rejects a blank message (%p)', async (message) => {
        const { service, s3Service, feedbackDelegate } = buildService();

        await expect(
            service.createFeedback(null, { ...submission, message }),
        ).rejects.toThrow(BadRequestException);

        expect(s3Service.uploadFile).not.toHaveBeenCalled();
        expect(feedbackDelegate.create).not.toHaveBeenCalled();
    });

    it('rejects a message past the length cap', async () => {
        const { service } = buildService();

        await expect(
            service.createFeedback(null, {
                ...submission,
                message: 'x'.repeat(FEEDBACK_MESSAGE_MAX_LENGTH + 1),
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('rejects an attachment with a disallowed mime type without uploading it', async () => {
        const { service, s3Service, feedbackDelegate } = buildService();

        await expect(
            service.createFeedback(
                null,
                submission,
                buildFile({ mimetype: 'application/x-msdownload' }),
            ),
        ).rejects.toThrow(BadRequestException);

        expect(s3Service.uploadFile).not.toHaveBeenCalled();
        expect(feedbackDelegate.create).not.toHaveBeenCalled();
    });

    it('rejects an attachment over the size cap', async () => {
        const { service, s3Service } = buildService();

        await expect(
            service.createFeedback(
                null,
                submission,
                buildFile({ size: FEEDBACK_ATTACHMENT_MAX_SIZE + 1 }),
            ),
        ).rejects.toThrow(BadRequestException);

        expect(s3Service.uploadFile).not.toHaveBeenCalled();
    });

    it('rejects an empty attachment', async () => {
        const { service } = buildService();

        await expect(
            service.createFeedback(null, submission, buildFile({ size: 0 })),
        ).rejects.toThrow(BadRequestException);
    });
});

describe('FeedbackService.createFeedback — attachment', () => {
    it('stores the attachment under the feedback folder and records its metadata', async () => {
        const { service, feedbackDelegate, s3Service } = buildService();

        const result = await service.createFeedback(
            'user-1',
            submission,
            buildFile({ originalname: 'My Screen (1).png' }),
        );

        const [, folder, uname] = s3Service.uploadFile.mock.calls[0];
        expect(folder).toBe('feedback');
        expect(uname).toMatch(/^[0-9a-f-]{36}-My_Screen_1_\.png$/);

        expect(feedbackDelegate.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                attachmentKey     : `feedback/${uname}`,
                attachmentName    : 'My Screen (1).png',
                attachmentMimeType: 'image/png',
                attachmentSize    : 2 * MB,
            }),
        });

        expect(result.feedback.hasAttachment).toBe(true);
    });

    it('deletes the stored attachment when the row fails to save', async () => {
        const { service, feedbackDelegate, s3Service } = buildService();
        feedbackDelegate.create.mockRejectedValueOnce(new Error('db down'));

        await expect(
            service.createFeedback('user-1', submission, buildFile()),
        ).rejects.toThrow('db down');

        expect(s3Service.deleteFile).toHaveBeenCalledTimes(1);
        expect(s3Service.deleteFile).toHaveBeenCalledWith(
            expect.stringMatching(/^feedback\//),
        );
    });

    it('swallows a failed orphan cleanup and still surfaces the original error', async () => {
        const { service, feedbackDelegate, s3Service } = buildService();
        feedbackDelegate.create.mockRejectedValueOnce(new Error('db down'));
        s3Service.deleteFile.mockRejectedValueOnce(new Error('storage down'));

        await expect(
            service.createFeedback('user-1', submission, buildFile()),
        ).rejects.toThrow('db down');
    });
});
