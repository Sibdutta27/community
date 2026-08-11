import { ValidationPipe } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/createFeedback.dto';
import { FeedbackController } from './feedback.controller';
import { FEEDBACK_MESSAGE_MAX_LENGTH } from './config';

const body: CreateFeedbackDto = {
    message: 'The yucayeke map is blank on my phone.',
    pageUrl: 'https://app.example/yucayeke',
    locale : 'es',
};

function buildController() {
    const feedbackService = {
        createFeedback: jest.fn().mockResolvedValue({
            message : 'Feedback submitted successfully',
            feedback: { id: 'feedback-1', createdAt: new Date(), hasAttachment: false },
        }),
    };

    const controller = new FeedbackController(feedbackService as never);

    return { controller, feedbackService };
}

describe('FeedbackController.submitFeedback', () => {
    it('credits the submission to the signed-in member', async () => {
        const { controller, feedbackService } = buildController();

        await controller.submitFeedback('user-1', body);

        expect(feedbackService.createFeedback).toHaveBeenCalledWith(
            'user-1',
            body,
            undefined,
        );
    });

    it('passes a null user id through for a signed-out visitor', async () => {
        const { controller, feedbackService } = buildController();

        await controller.submitFeedback(undefined, body);

        expect(feedbackService.createFeedback).toHaveBeenCalledWith(
            null,
            body,
            undefined,
        );
    });

    it('forwards the optional attachment', async () => {
        const { controller, feedbackService } = buildController();
        const attachment = { originalname: 'shot.png' } as Express.Multer.File;

        await controller.submitFeedback('user-1', body, attachment);

        expect(feedbackService.createFeedback).toHaveBeenCalledWith(
            'user-1',
            body,
            attachment,
        );
    });
});

describe('CreateFeedbackDto validation', () => {
    // Mirrors the global pipe registered in main.ts.
    const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    });

    const metadata = {
        type: 'body' as const,
        metatype: CreateFeedbackDto,
    };

    it('accepts a minimal submission and trims the free text', async () => {
        const result = (await pipe.transform(
            { message: '  it broke  ', pageUrl: ' /dashboard ', locale: 'en' },
            metadata,
        )) as CreateFeedbackDto;

        expect(result.message).toBe('it broke');
        expect(result.pageUrl).toBe('/dashboard');
        expect(result.userAgent).toBeUndefined();
    });

    it.each([
        ['a blank message', { message: '   ', pageUrl: '/x', locale: 'en' }],
        ['a missing page url', { message: 'hi', locale: 'en' }],
        ['a missing locale', { message: 'hi', pageUrl: '/x' }],
        [
            'an over-long message',
            {
                message: 'x'.repeat(FEEDBACK_MESSAGE_MAX_LENGTH + 1),
                pageUrl: '/x',
                locale : 'en',
            },
        ],
        [
            'an unexpected field',
            { message: 'hi', pageUrl: '/x', locale: 'en', userId: 'spoofed' },
        ],
    ])('rejects %s', async (_label, payload) => {
        await expect(pipe.transform(payload, metadata)).rejects.toBeDefined();
    });
});
