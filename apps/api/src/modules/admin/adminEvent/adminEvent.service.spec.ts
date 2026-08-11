import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
    AdminEventService,
    EVENT_CALENDAR_MAX,
    EVENT_REGISTRANT_CSV_HEADERS,
} from './adminEvent.service';
import { CSV_BOM } from '@/common/utils/csv.util';

const EVENT = {
    id: 'event-1',
    title: 'Areyto Gathering',
    startDateTime: new Date('2026-09-12T18:00:00Z'),
    maxCapacity: 80,
};

function buildRegistration(overrides: Record<string, unknown> = {}) {
    return {
        id: 'reg-1',
        createdAt: new Date('2026-08-01T10:00:00Z'),

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
    event?: Record<string, unknown> | null;
    registrations?: Record<string, unknown>[];
    count?: number;
    calendarEvents?: Record<string, unknown>[];
} = {}) {
    const database = {
        event: {
            findUnique: jest.fn().mockResolvedValue(
                options.event === undefined ? EVENT : options.event,
            ),
            findMany: jest.fn().mockResolvedValue(
                options.calendarEvents ?? [],
            ),
        },

        eventRegistration: {
            findMany: jest.fn().mockResolvedValue(
                options.registrations ?? [buildRegistration()],
            ),
            count: jest.fn().mockResolvedValue(options.count ?? 1),
        },
    };

    const service = new AdminEventService(database as never);

    return { service, database };
}

describe('AdminEventService.getEventRegistrations', () => {

    it('pages from one with the shared skip/take contract', async () => {
        const { service, database } = buildService();

        await service.getEventRegistrations('event-1', {
            page: 3,
            limit: 25,
        });

        expect(database.eventRegistration.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: 50,
                take: 25,
                orderBy: { createdAt: 'desc' },
            }),
        );
    });

    it('defaults to the first page of ten', async () => {
        const { service, database } = buildService();

        await service.getEventRegistrations('event-1', {});

        expect(database.eventRegistration.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ skip: 0, take: 10 }),
        );
    });

    it('returns the member, when they signed up, and the total', async () => {
        const { service } = buildService({ count: 42 });

        const result = await service.getEventRegistrations('event-1', {});

        expect(result.count).toBe(42);

        expect(result.event).toEqual({
            id: 'event-1',
            title: 'Areyto Gathering',
            startDateTime: EVENT.startDateTime,
            maxCapacity: 80,
        });

        expect(result.data).toEqual([
            {
                id: 'reg-1',
                registeredAt: new Date('2026-08-01T10:00:00Z'),
                member: {
                    id: 'user-1',
                    publicId: '1042',
                    name: 'Anani Guarocuya',
                    email: 'anani@example.com',
                },
            },
        ]);
    });

    it('scopes an unfiltered read to the event alone', async () => {
        const { service, database } = buildService();

        await service.getEventRegistrations('event-1', {});

        expect(database.eventRegistration.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { eventId: 'event-1' } }),
        );

        expect(database.eventRegistration.count).toHaveBeenCalledWith({
            where: { eventId: 'event-1' },
        });
    });

    it('searches the member name, email and member ID', async () => {
        const { service, database } = buildService();

        await service.getEventRegistrations('event-1', { search: 'anani' });

        const { where } = database.eventRegistration.findMany.mock.calls[0][0];

        expect(where.eventId).toBe('event-1');

        expect(where.user.OR).toEqual([
            { name: { contains: 'anani', mode: 'insensitive' } },
            { email: { contains: 'anani', mode: 'insensitive' } },
            { publicId: { contains: 'anani', mode: 'insensitive' } },
        ]);
    });

    it('counts the same filtered set it lists', async () => {
        const { service, database } = buildService();

        await service.getEventRegistrations('event-1', { search: 'anani' });

        expect(database.eventRegistration.count.mock.calls[0][0].where)
            .toEqual(
                database.eventRegistration.findMany.mock.calls[0][0].where,
            );
    });

    it('404s on an unknown event instead of an empty roster', async () => {
        const { service } = buildService({ event: null });

        await expect(
            service.getEventRegistrations('nope', {}),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});

describe('AdminEventService.exportEventRegistrations', () => {

    it('writes the header row staff expect', async () => {
        const { service } = buildService({ registrations: [] });

        const { csv } = await service.exportEventRegistrations('event-1');

        expect(csv).toBe(
            `${CSV_BOM}${EVENT_REGISTRANT_CSV_HEADERS
                .map((header) => `"${header}"`)
                .join(',')}\r\n`,
        );
    });

    it('exports one row per registrant, oldest first', async () => {
        const { service, database } = buildService({
            registrations: [
                {
                    createdAt: new Date('2026-08-01T10:00:00Z'),
                    user: {
                        publicId: '1042',
                        name: 'Anani Guarocuya',
                        email: 'anani@example.com',
                    },
                },
            ],
        });

        const { csv } = await service.exportEventRegistrations('event-1');

        expect(database.eventRegistration.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
        );

        expect(csv).toContain(
            '"1042","Anani Guarocuya","anani@example.com","2026-08-01T10:00:00.000Z"',
        );
    });

    it('is not paginated — the export is the whole list', async () => {
        const { service, database } = buildService({ registrations: [] });

        await service.exportEventRegistrations('event-1');

        const args = database.eventRegistration.findMany.mock.calls[0][0];

        expect(args.take).toBeUndefined();
        expect(args.skip).toBeUndefined();
    });

    it('names the file after the event', async () => {
        const { service } = buildService({ registrations: [] });

        const { filename } = await service.exportEventRegistrations('event-1');

        expect(filename).toBe('areyto-gathering-registrations.csv');
    });

    it('404s on an unknown event', async () => {
        const { service } = buildService({ event: null });

        await expect(
            service.exportEventRegistrations('nope'),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});

describe('AdminEventService.getEventCalendar', () => {

    it('asks for the events that start inside the visible window', async () => {
        const { service, database } = buildService();

        await service.getEventCalendar({
            from: '2026-08-31T00:00:00.000Z',
            to: '2026-10-05T00:00:00.000Z',
        });

        expect(database.event.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    startDateTime: {
                        gte: new Date('2026-08-31T00:00:00.000Z'),
                        lt: new Date('2026-10-05T00:00:00.000Z'),
                    },
                },

                take: EVENT_CALENDAR_MAX,
                orderBy: { startDateTime: 'asc' },
            }),
        );
    });

    it('narrows to a category when one is chosen', async () => {
        const { service, database } = buildService();

        await service.getEventCalendar({
            from: '2026-08-31T00:00:00.000Z',
            to: '2026-10-05T00:00:00.000Z',
            categoryId: 'cat-1',
        });

        expect(database.event.findMany.mock.calls[0][0].where.categoryId)
            .toBe('cat-1');
    });

    it('returns the window unpaginated, with its own size as the count', async () => {
        const { service } = buildService({
            calendarEvents: [{ id: 'e1' }, { id: 'e2' }],
        });

        const result = await service.getEventCalendar({
            from: '2026-08-31T00:00:00.000Z',
            to: '2026-10-05T00:00:00.000Z',
        });

        expect(result.count).toBe(2);
        expect(result.data).toHaveLength(2);
    });

    it('rejects an unparseable window', async () => {
        const { service } = buildService();

        await expect(
            service.getEventCalendar({ from: 'not-a-date', to: 'nope' }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a window that ends before it starts', async () => {
        const { service } = buildService();

        await expect(
            service.getEventCalendar({
                from: '2026-10-05T00:00:00.000Z',
                to: '2026-08-31T00:00:00.000Z',
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
