import { ValidationPipe } from '@nestjs/common';
import { FeedbackStatus } from '@/generated/prisma/enums';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { AdminFeedbackController } from './adminFeedback.controller';
import { GetFeedbackDto } from './dto/getFeedback.dto';
import { UpdateFeedbackStatusDto } from './dto/updateFeedbackStatus.dto';

function buildController() {
    const adminFeedbackService = {
        getFeedback: jest.fn().mockResolvedValue({ data: [], count: 0 }),
        getStatusCounts: jest.fn().mockResolvedValue({
            NEW: 0,
            IN_REVIEW: 0,
            RESOLVED: 0,
            DECLINED: 0,
        }),
        getFeedbackDetail: jest.fn().mockResolvedValue({ id: 'feedback-1' }),
        updateStatus: jest.fn().mockResolvedValue({ success: true }),
    };

    const controller = new AdminFeedbackController(
        adminFeedbackService as never,
    );

    return { controller, adminFeedbackService };
}

describe('AdminFeedbackController routing', () => {

    it('passes the page, limit and lane through to the service', async () => {
        const { controller, adminFeedbackService } = buildController();

        await controller.getFeedback({
            page: 2,
            limit: 25,
            status: FeedbackStatus.NEW,
        });

        expect(adminFeedbackService.getFeedback).toHaveBeenCalledWith({
            page: 2,
            limit: 25,
            status: FeedbackStatus.NEW,
        });
    });

    it('falls back to the first page of ten', async () => {
        const { controller, adminFeedbackService } = buildController();

        await controller.getFeedback({});

        expect(adminFeedbackService.getFeedback).toHaveBeenCalledWith({
            page: 1,
            limit: 10,
            status: undefined,
        });
    });

    it('reads a single submission by id', async () => {
        const { controller, adminFeedbackService } = buildController();

        await controller.getFeedbackDetail('feedback-1');

        expect(adminFeedbackService.getFeedbackDetail).toHaveBeenCalledWith(
            'feedback-1',
        );
    });

    it('moves a submission to the requested lane', async () => {
        const { controller, adminFeedbackService } = buildController();

        await controller.updateStatus('feedback-1', {
            status: FeedbackStatus.RESOLVED,
        });

        expect(adminFeedbackService.updateStatus).toHaveBeenCalledWith(
            'feedback-1',
            FeedbackStatus.RESOLVED,
        );
    });
});

describe('AdminFeedbackController access control', () => {

    it('is behind both the bearer-token and the admin-role guard', () => {
        const guards = Reflect.getMetadata(
            '__guards__',
            AdminFeedbackController,
        );

        expect(guards).toEqual(
            expect.arrayContaining([JwtAuthGuard, AdminAuthGuard]),
        );
    });

    function contextFor(user: unknown) {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
        } as never;
    }

    it('admits an admin', async () => {
        const guard = new AdminAuthGuard();

        await expect(
            guard.canActivate(contextFor({ id: 'u1', role: 'ADMIN' })),
        ).resolves.toBe(true);
    });

    it.each([
        ['a plain member', { id: 'u1', role: 'USER' }],
        ['an unauthenticated request', undefined],
        ['a request with a role-less user', { id: 'u1' }],
    ])('turns away %s', async (_label, user) => {
        const guard = new AdminAuthGuard();

        await expect(guard.canActivate(contextFor(user))).resolves.toBe(false);
    });
});

describe('admin feedback DTO validation', () => {
    // Mirrors the global pipe registered in main.ts.
    const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    });

    const queryMetadata = {
        type: 'query' as const,
        metatype: GetFeedbackDto,
    };

    const bodyMetadata = {
        type: 'body' as const,
        metatype: UpdateFeedbackStatusDto,
    };

    it('coerces the numeric query params off the query string', async () => {
        const result = (await pipe.transform(
            { page: '3', limit: '50' },
            queryMetadata,
        )) as GetFeedbackDto;

        expect(result.page).toBe(3);
        expect(result.limit).toBe(50);
    });

    it('reads the select\'s empty option as "no lane filter"', async () => {
        const result = (await pipe.transform(
            { status: '' },
            queryMetadata,
        )) as GetFeedbackDto;

        expect(result.status).toBeUndefined();
    });

    it.each([
        ['an unknown lane', { status: 'URGENT' }],
        ['a zero page', { page: '0' }],
        ['an oversized page', { limit: '5000' }],
        ['an unexpected field', { sort: 'oldest' }],
    ])('rejects %s in the query', async (_label, payload) => {
        await expect(
            pipe.transform(payload, queryMetadata),
        ).rejects.toBeDefined();
    });

    it('accepts every declared lane on the status body', async () => {
        for (const status of Object.values(FeedbackStatus)) {
            const result = (await pipe.transform(
                { status },
                bodyMetadata,
            )) as UpdateFeedbackStatusDto;

            expect(result.status).toBe(status);
        }
    });

    it.each([
        ['an unknown lane', { status: 'CLOSED' }],
        ['a missing status', {}],
        ['an unexpected field', { status: 'NEW', note: 'hi' }],
    ])('rejects %s on the status body', async (_label, payload) => {
        await expect(
            pipe.transform(payload, bodyMetadata),
        ).rejects.toBeDefined();
    });
});
