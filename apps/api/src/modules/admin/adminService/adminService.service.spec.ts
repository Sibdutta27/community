import { NotFoundException } from '@nestjs/common';
import {
    AdminServiceService,
    SERVICE_REGISTRANT_CSV_HEADERS,
} from './adminService.service';
import { CSV_BOM } from '@/common/utils/csv.util';

const SERVICE = {
    id: 'service-1',
    name: 'Housing Assistance',
    status: 'ACTIVE',
};

function buildRegistration(overrides: Record<string, unknown> = {}) {
    return {
        id: 'reg-1',
        date: new Date('2026-08-01T10:00:00Z'),
        status: 'REGISTERED',

        user: {
            id: 'user-1',
            publicId: '1042',
            name: 'Anani Guarocuya',
            email: 'anani@example.com',
        },

        ...overrides,
    };
}

function buildService(options: {
    program?: Record<string, unknown> | null;
    registrations?: Record<string, unknown>[];
    count?: number;
} = {}) {
    const database = {
        service: {
            findUnique: jest.fn().mockResolvedValue(
                options.program === undefined ? SERVICE : options.program,
            ),
        },

        serviceRegistration: {
            findMany: jest.fn().mockResolvedValue(
                options.registrations ?? [buildRegistration()],
            ),
            count: jest.fn().mockResolvedValue(options.count ?? 1),
        },
    };

    const service = new AdminServiceService(database as never);

    return { service, database };
}

describe('AdminServiceService.getServiceRegistrations', () => {

    it('pages from one with the shared skip/take contract', async () => {
        const { service, database } = buildService();

        await service.getServiceRegistrations('service-1', {
            page: 3,
            limit: 25,
        });

        expect(database.serviceRegistration.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: 50,
                take: 25,
                orderBy: { date: 'desc' },
            }),
        );
    });

    it('defaults to the first page of ten', async () => {
        const { service, database } = buildService();

        await service.getServiceRegistrations('service-1', {});

        expect(database.serviceRegistration.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ skip: 0, take: 10 }),
        );
    });

    it('reports the sign-up date as registeredAt, with the member', async () => {
        const { service } = buildService({ count: 7 });

        const result = await service.getServiceRegistrations('service-1', {});

        expect(result.count).toBe(7);

        expect(result.service).toEqual({
            id: 'service-1',
            name: 'Housing Assistance',
            status: 'ACTIVE',
        });

        expect(result.data).toEqual([
            {
                id: 'reg-1',
                registeredAt: new Date('2026-08-01T10:00:00Z'),
                status: 'REGISTERED',
                member: {
                    id: 'user-1',
                    publicId: '1042',
                    name: 'Anani Guarocuya',
                    email: 'anani@example.com',
                },
            },
        ]);
    });

    it('scopes an unfiltered read to the program alone', async () => {
        const { service, database } = buildService();

        await service.getServiceRegistrations('service-1', {});

        expect(database.serviceRegistration.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { serviceId: 'service-1' } }),
        );
    });

    it('searches the member name, email and member ID', async () => {
        const { service, database } = buildService();

        await service.getServiceRegistrations('service-1', {
            search: 'anani',
        });

        const { where } =
            database.serviceRegistration.findMany.mock.calls[0][0];

        expect(where.serviceId).toBe('service-1');

        expect(where.user.OR).toEqual([
            { name: { contains: 'anani', mode: 'insensitive' } },
            { email: { contains: 'anani', mode: 'insensitive' } },
            { publicId: { contains: 'anani', mode: 'insensitive' } },
        ]);
    });

    it('counts the same filtered set it lists', async () => {
        const { service, database } = buildService();

        await service.getServiceRegistrations('service-1', {
            search: 'anani',
        });

        expect(database.serviceRegistration.count.mock.calls[0][0].where)
            .toEqual(
                database.serviceRegistration.findMany.mock.calls[0][0].where,
            );
    });

    it('404s on an unknown program instead of an empty roster', async () => {
        const { service } = buildService({ program: null });

        await expect(
            service.getServiceRegistrations('nope', {}),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});

describe('AdminServiceService.exportServiceRegistrations', () => {

    it('writes the header row staff expect, status included', async () => {
        const { service } = buildService({ registrations: [] });

        const { csv } = await service.exportServiceRegistrations('service-1');

        expect(SERVICE_REGISTRANT_CSV_HEADERS).toContain('Status');

        expect(csv).toBe(
            `${CSV_BOM}${SERVICE_REGISTRANT_CSV_HEADERS
                .map((header) => `"${header}"`)
                .join(',')}\r\n`,
        );
    });

    it('exports one row per registrant, oldest first', async () => {
        const { service, database } = buildService({
            registrations: [
                {
                    date: new Date('2026-08-01T10:00:00Z'),
                    status: 'REGISTERED',
                    user: {
                        publicId: '1042',
                        name: 'Anani Guarocuya',
                        email: 'anani@example.com',
                    },
                },
            ],
        });

        const { csv } = await service.exportServiceRegistrations('service-1');

        expect(database.serviceRegistration.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ orderBy: { date: 'asc' } }),
        );

        expect(csv).toContain(
            '"1042","Anani Guarocuya","anani@example.com","2026-08-01T10:00:00.000Z","REGISTERED"',
        );
    });

    it('is not paginated — the export is the whole list', async () => {
        const { service, database } = buildService({ registrations: [] });

        await service.exportServiceRegistrations('service-1');

        const args = database.serviceRegistration.findMany.mock.calls[0][0];

        expect(args.take).toBeUndefined();
        expect(args.skip).toBeUndefined();
    });

    it('names the file after the program', async () => {
        const { service } = buildService({ registrations: [] });

        const { filename } =
            await service.exportServiceRegistrations('service-1');

        expect(filename).toBe('housing-assistance-registrations.csv');
    });

    it('404s on an unknown program', async () => {
        const { service } = buildService({ program: null });

        await expect(
            service.exportServiceRegistrations('nope'),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});
