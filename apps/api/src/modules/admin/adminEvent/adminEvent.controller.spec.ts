import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { AdminEventController } from './adminEvent.controller';
import { GetEventRegistrationsDto } from './dto/getEventRegistrations.dto';
import { GetEventCalendarDto } from './dto/getEventCalendar.dto';

function buildController() {
    const adminEventService = {
        getEventRegistrations: jest.fn().mockResolvedValue({
            data: [],
            count: 0,
        }),

        exportEventRegistrations: jest.fn().mockResolvedValue({
            filename: 'areyto-gathering-registrations.csv',
            csv: 'csv-body',
        }),

        getEventCalendar: jest.fn().mockResolvedValue({
            data: [],
            count: 0,
        }),
    };

    const controller = new AdminEventController(adminEventService as never);

    return { controller, adminEventService };
}

function buildResponse() {
    return {
        setHeader: jest.fn(),
    } as never;
}

describe('AdminEventController registrant routing', () => {

    it('passes the page, limit and search through to the service', async () => {
        const { controller, adminEventService } = buildController();

        await controller.getEventRegistrations('event-1', {
            page: 2,
            limit: 25,
            search: 'anani',
        });

        expect(adminEventService.getEventRegistrations)
            .toHaveBeenCalledWith('event-1', {
                page: 2,
                limit: 25,
                search: 'anani',
            });
    });

    it('falls back to the first page of ten', async () => {
        const { controller, adminEventService } = buildController();

        await controller.getEventRegistrations('event-1', {});

        expect(adminEventService.getEventRegistrations)
            .toHaveBeenCalledWith('event-1', {
                page: 1,
                limit: 10,
                search: undefined,
            });
    });

    it('sends the CSV back as a download', async () => {
        const { controller, adminEventService } = buildController();

        const res = buildResponse();

        const body = await controller.exportEventRegistrations('event-1', res);

        expect(adminEventService.exportEventRegistrations)
            .toHaveBeenCalledWith('event-1');

        expect(body).toBe('csv-body');

        expect((res as unknown as { setHeader: jest.Mock }).setHeader)
            .toHaveBeenCalledWith(
                'Content-Disposition',
                'attachment; filename="areyto-gathering-registrations.csv"',
            );
    });

    it('serves the CSV as text/csv', () => {
        const headers = Reflect.getMetadata(
            '__headers__',
            AdminEventController.prototype.exportEventRegistrations,
        );

        expect(headers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'Content-Type',
                    value: 'text/csv; charset=utf-8',
                }),
            ]),
        );
    });

    it('hands the calendar window to the service', async () => {
        const { controller, adminEventService } = buildController();

        await controller.getEventCalendar({
            from: '2026-08-31T00:00:00.000Z',
            to: '2026-10-05T00:00:00.000Z',
            categoryId: 'cat-1',
        });

        expect(adminEventService.getEventCalendar).toHaveBeenCalledWith({
            from: '2026-08-31T00:00:00.000Z',
            to: '2026-10-05T00:00:00.000Z',
            categoryId: 'cat-1',
        });
    });
});

describe('GetEventRegistrationsDto validation', () => {

    const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    });

    const metadata = {
        type: 'query' as const,
        metatype: GetEventRegistrationsDto,
    };

    it('coerces the numeric query string', async () => {
        const value = await pipe.transform(
            { page: '2', limit: '25' },
            metadata,
        );

        expect(value).toEqual({ page: 2, limit: 25 });
    });

    it('treats a blank search box as no filter', async () => {
        const value = await pipe.transform({ search: '' }, metadata);

        expect(value.search).toBeUndefined();
    });

    it('rejects a page before the first one', async () => {
        await expect(
            pipe.transform({ page: '0' }, metadata),
        ).rejects.toBeDefined();
    });

    it('caps how much one request may pull', async () => {
        await expect(
            pipe.transform({ limit: '5000' }, metadata),
        ).rejects.toBeDefined();
    });
});

describe('GetEventCalendarDto validation', () => {

    const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    });

    const metadata = {
        type: 'query' as const,
        metatype: GetEventCalendarDto,
    };

    it('accepts an ISO window', async () => {
        const value = await pipe.transform(
            {
                from: '2026-08-31T00:00:00.000Z',
                to: '2026-10-05T00:00:00.000Z',
            },
            metadata,
        );

        expect(value.from).toBe('2026-08-31T00:00:00.000Z');
    });

    it('requires the window', async () => {
        await expect(pipe.transform({}, metadata)).rejects.toBeDefined();
    });

    it('rejects a window that is not a date', async () => {
        await expect(
            pipe.transform({ from: 'august', to: 'october' }, metadata),
        ).rejects.toBeDefined();
    });
});

describe('AdminEventController access control', () => {

    it('is behind both the bearer-token and the admin-role guard', () => {
        const guards = Reflect.getMetadata('__guards__', AdminEventController);

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
        ['a moderator', { id: 'u1', role: 'MODERATOR' }],
        ['an unauthenticated request', undefined],
    ])('turns away %s from the registrant roster', async (_label, user) => {
        const guard = new AdminAuthGuard();

        await expect(guard.canActivate(contextFor(user))).resolves.toBe(false);
    });
});
