import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/auth.guard';
import { AdminAuthGuard } from '../guard/adminAuth.guard';
import { AdminServiceController } from './adminService.controller';
import { GetServiceRegistrationsDto } from './dto/getServiceRegistrations.dto';

function buildController() {
    const adminServiceService = {
        getServiceRegistrations: jest.fn().mockResolvedValue({
            data: [],
            count: 0,
        }),

        exportServiceRegistrations: jest.fn().mockResolvedValue({
            filename: 'housing-assistance-registrations.csv',
            csv: 'csv-body',
        }),
    };

    const controller = new AdminServiceController(
        adminServiceService as never,
    );

    return { controller, adminServiceService };
}

function buildResponse() {
    return {
        setHeader: jest.fn(),
    } as never;
}

describe('AdminServiceController registrant routing', () => {

    it('passes the page, limit and search through to the service', async () => {
        const { controller, adminServiceService } = buildController();

        await controller.getServiceRegistrations('service-1', {
            page: 2,
            limit: 25,
            search: 'anani',
        });

        expect(adminServiceService.getServiceRegistrations)
            .toHaveBeenCalledWith('service-1', {
                page: 2,
                limit: 25,
                search: 'anani',
            });
    });

    it('falls back to the first page of ten', async () => {
        const { controller, adminServiceService } = buildController();

        await controller.getServiceRegistrations('service-1', {});

        expect(adminServiceService.getServiceRegistrations)
            .toHaveBeenCalledWith('service-1', {
                page: 1,
                limit: 10,
                search: undefined,
            });
    });

    it('sends the CSV back as a download', async () => {
        const { controller, adminServiceService } = buildController();

        const res = buildResponse();

        const body = await controller.exportServiceRegistrations(
            'service-1',
            res,
        );

        expect(adminServiceService.exportServiceRegistrations)
            .toHaveBeenCalledWith('service-1');

        expect(body).toBe('csv-body');

        expect((res as unknown as { setHeader: jest.Mock }).setHeader)
            .toHaveBeenCalledWith(
                'Content-Disposition',
                'attachment; filename="housing-assistance-registrations.csv"',
            );
    });

    it('serves the CSV as text/csv', () => {
        const headers = Reflect.getMetadata(
            '__headers__',
            AdminServiceController.prototype.exportServiceRegistrations,
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
});

describe('GetServiceRegistrationsDto validation', () => {

    const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    });

    const metadata = {
        type: 'query' as const,
        metatype: GetServiceRegistrationsDto,
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

describe('AdminServiceController access control', () => {

    it('is behind both the bearer-token and the admin-role guard', () => {
        const guards = Reflect.getMetadata(
            '__guards__',
            AdminServiceController,
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

    it.each([
        ['a plain member', { id: 'u1', role: 'USER' }],
        ['a moderator', { id: 'u1', role: 'MODERATOR' }],
        ['an unauthenticated request', undefined],
    ])('turns away %s from the registrant roster', async (_label, user) => {
        const guard = new AdminAuthGuard();

        await expect(guard.canActivate(contextFor(user))).resolves.toBe(false);
    });
});
