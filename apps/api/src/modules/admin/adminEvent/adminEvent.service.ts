import { Prisma } from '@/generated/prisma/client';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { GetEventCategoriesInterface } from './interfaces/getEventCategories.interface';
import { CreateEventCategoryInterface } from './interfaces/createEventCategory.interface';
import { UpdateEventCategoryInterface } from './interfaces/updateEventCategory.interface';
import { GetEventsInterface } from './interfaces/getEvents.interface';
import { CreateEventInterface } from './interfaces/createEvent.interface';
import { UpdateEventInterface } from './interfaces/updateEvent.interface';
import { GetEventRegistrationsInterface } from './interfaces/getEventRegistrations.interface';
import { GetEventCalendarInterface } from './interfaces/getEventCalendar.interface';
import { csvFilenameSlug, toCsv } from '@/common/utils/csv.util';

/**
 * A month grid drawn as whole weeks spans at most six weeks, and no single
 * screen can usefully render more events than this. The cap keeps one runaway
 * month from returning the whole table.
 */
export const EVENT_CALENDAR_MAX = 500;

/**
 * Columns of the registrant CSV, in the order staff read them.
 */
export const EVENT_REGISTRANT_CSV_HEADERS = [
    'Member ID',
    'Name',
    'Email',
    'Registered At',
];


@Injectable()
export class AdminEventService {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    /**
     * Get all event categories
     */
    async getEventCategories(
        query: GetEventCategoriesInterface,
    ) {

        const skip = query.page && query.limit
            ? (query.page - 1) * query.limit
            : undefined;

        const take = query.limit || undefined;

        /**
         * Search filter
         */
        const where = query.search
            ? {
                OR: [
                    {
                        key: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },

                    {
                        name: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }
            : {};

        /**
         * Fetch categories
         */
        const [
            categories,
            count,
        ] = await Promise.all([

            this.database.eventCategory.findMany({
                where,

                skip,
                take,

                orderBy: {
                    name: 'asc',
                },

                select: {
                    id: true,
                    key: true,
                    name: true,
                    icon: true,

                    _count: {
                        select: {
                            events: true,
                        },
                    },
                },
            }),

            this.database.eventCategory.count({
                where,
            }),
        ]);

        return {
            data: categories,
            count
        };
    }

    /**
     * Create event category
     */
    async createEventCategory(
        dto: CreateEventCategoryInterface,
    ) {

        /**
         * Check existing key
         */
        const existingCategory =
            await this.database.eventCategory.findUnique({
                where: {
                    key: dto.key,
                },
            });

        if (existingCategory) {
            throw new ConflictException(
                'Event category key already exists',
            );
        }

        /**
         * Create category
         */
        const category =
            await this.database.eventCategory.create({
                data: {
                    key: dto.key,
                    name: dto.name,
                    description: dto.description,
                    icon: dto.icon,
                },
            });

        return {
            success: true,
            message: 'Event category created successfully',
        };
    }

    /**
     * Get single event category
     */
    async getEventCategory(
        id: string,
    ) {

        const category =
            await this.database.eventCategory.findUnique({
                where: {
                    id,
                },

                include: {
                    _count: {
                        select: {
                            events: true,
                        },
                    },
                },
            });

        if (!category) {
            throw new NotFoundException(
                'Event category not found',
            );
        }

        return category;
    }

    /**
     * Update event category
     */
    async updateEventCategory(
        id: string,
        dto: UpdateEventCategoryInterface,
    ) {

        /**
         * Check existing category
         */
        const existingCategory =
            await this.database.eventCategory.findUnique({
                where: {
                    id,
                },
            });

        if (!existingCategory) {
            throw new NotFoundException(
                'Event category not found',
            );
        }

        /**
         * Check duplicate key
         */
        if (dto.key) {

            const duplicateKey =
                await this.database.eventCategory.findFirst({
                    where: {
                        key: dto.key,

                        NOT: {
                            id,
                        },
                    },
                });

            if (duplicateKey) {
                throw new ConflictException(
                    'Event category key already exists',
                );
            }
        }

        /**
         * Update category
         */
        const updatedCategory =
            await this.database.eventCategory.update({
                where: {
                    id,
                },

                data: {
                    key: dto.key,
                    name: dto.name,
                    description: dto.description,
                    icon: dto.icon,
                },
            });

        return {
            success: true,
            message: 'Event category updated successfully',
        };
    }

    /**
     * Get all events
     */
    async getEvents(
        query: GetEventsInterface,
    ) {

        const {
            search,
            categoryId,
        } = query;

        const page  = query.page || 1;
        const limit = query.limit || 10;

        const skip = (page - 1) * limit;

        /**
         * Where condition
         */
        const where: Prisma.EventWhereInput = {

            ...(categoryId && {
                categoryId,
            }),

            ...(search && {
                OR: [
                    {
                        title: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },

                    {
                        description: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },

                    {
                        category: {
                            name: {
                                contains: query.search,
                                mode: 'insensitive' as const,
                            },
                        },
                    },
                ],
            }),
        };

        /**
         * Fetch events
         */
        const [
            events,
            count,
        ] = await Promise.all([

            this.database.event.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    startDateTime: 'desc',
                },

                include: {
                    category: {
                        select: {
                            id: true,
                            key: true,
                            name: true,
                            icon: true,
                        },
                    },

                    _count: {
                        select: {
                            registrations: true,
                        },
                    },
                },
            }),

            this.database.event.count({
                where,
            }),
        ]);

        return {
            data: events,
            count
        };
    }

    /**
     * Create event
     */
    async createEvent(
        dto: CreateEventInterface,
    ) {

        /**
         * Check category
         */
        const category =
            await this.database.eventCategory.findUnique({
                where: {
                    id: dto.categoryId,
                },
            });

        if (!category) {
            throw new NotFoundException(
                'Event category not found',
            );
        }

        /**
         * Validate date
         */
        if (
            dto.endDateTime
            && new Date(dto.endDateTime)
            < new Date(dto.startDateTime)
        ) {
            throw new BadRequestException(
                'End date must be after start date',
            );
        }

        /**
         * Create event
         */
        const event =
            await this.database.event.create({
                data: {
                    title: dto.title,
                    description: dto.description,

                    categoryId: dto.categoryId,

                    startDateTime: new Date(dto.startDateTime),

                    endDateTime: dto.endDateTime
                        ? new Date(dto.endDateTime)
                        : null,

                    locationType: dto.locationType,

                    location: dto.location,

                    meetingUrl: dto.meetingUrl,

                    maxCapacity: dto.maxCapacity,

                    isFeatured: dto.isFeatured ?? false,

                    externalUrl: dto.externalUrl,
                },

                include: {
                    category: true,
                },
            });

        return {
            success: true,
            message: 'Event created successfully',
        };
    }

    /**
     * Get single event
     */
    async getEvent(
        id: string,
    ) {

        const event =
            await this.database.event.findUnique({
                where: {
                    id,
                },

                include: {
                    category: {
                        select: {
                            id: true,
                            key: true,
                            name: true,
                            icon: true,
                        },
                    },

                    _count: {
                        select: {
                            registrations: true,
                        },
                    },
                },
            });

        if (!event) {
            throw new NotFoundException(
                'Event not found',
            );
        }

        return event;
    }

    /**
     * Update event
     */
    async updateEvent(
        id: string,
        dto: UpdateEventInterface,
    ) {

        /**
         * Check existing event
         */
        const existingEvent =
            await this.database.event.findUnique({
                where: {
                    id,
                },
            });

        if (!existingEvent) {
            throw new NotFoundException(
                'Event not found',
            );
        }

        /**
         * Check category if updating
         */
        if (dto.categoryId) {

            const category =
                await this.database.eventCategory.findUnique({
                    where: {
                        id: dto.categoryId,
                    },
                });

            if (!category) {
                throw new NotFoundException(
                    'Event category not found',
                );
            }
        }

        /**
         * Validate dates
         */
        const startDate =
            dto.startDateTime
                ? new Date(dto.startDateTime)
                : existingEvent.startDateTime;

        const endDate =
            dto.endDateTime
                ? new Date(dto.endDateTime)
                : existingEvent.endDateTime;

        if (
            endDate
            && endDate < startDate
        ) {
            throw new BadRequestException(
                'End date must be after start date',
            );
        }

        /**
         * Update event
         */
        const updatedEvent =
            await this.database.event.update({
                where: {
                    id,
                },

                data: {
                    title: dto.title,
                    description: dto.description,

                    categoryId: dto.categoryId,

                    startDateTime: dto.startDateTime
                        ? new Date(dto.startDateTime)
                        : undefined,

                    endDateTime: dto.endDateTime
                        ? new Date(dto.endDateTime)
                        : undefined,

                    locationType: dto.locationType,

                    location: dto.location,

                    meetingUrl: dto.meetingUrl,

                    maxCapacity: dto.maxCapacity,

                    isFeatured: dto.isFeatured,

                    externalUrl: dto.externalUrl,
                },

                include: {
                    category: true,
                },
            });

        return {
            success: true,
            message: 'Event updated successfully',
        };
    }

    /**
     * Get every event that starts inside a window, for the month calendar.
     *
     * Deliberately unpaginated: a calendar cell has to show all of that day's
     * events or it lies about the day. The window is the caller's visible grid
     * (a month padded out to whole weeks), and `EVENT_CALENDAR_MAX` is the
     * backstop.
     */
    async getEventCalendar(
        query: GetEventCalendarInterface,
    ) {

        const from = new Date(query.from);
        const to = new Date(query.to);

        if (
            Number.isNaN(from.getTime())
            || Number.isNaN(to.getTime())
        ) {
            throw new BadRequestException(
                'Invalid calendar window',
            );
        }

        if (to < from) {
            throw new BadRequestException(
                'Calendar window must end after it starts',
            );
        }

        const where: Prisma.EventWhereInput = {
            startDateTime: {
                gte: from,
                lt: to,
            },

            ...(query.categoryId && {
                categoryId: query.categoryId,
            }),
        };

        const events = await this.database.event.findMany({
            where,

            take: EVENT_CALENDAR_MAX,

            orderBy: {
                startDateTime: 'asc',
            },

            select: {
                id: true,
                title: true,

                startDateTime: true,
                endDateTime: true,

                locationType: true,
                location: true,

                maxCapacity: true,
                isFeatured: true,

                category: {
                    select: {
                        id: true,
                        key: true,
                        name: true,
                    },
                },

                _count: {
                    select: {
                        registrations: true,
                    },
                },
            },
        });

        return {
            data: events,
            count: events.length,
        };
    }

    /**
     * Get who registered for an event — paginated, newest sign-up first.
     */
    async getEventRegistrations(
        eventId: string,
        query: GetEventRegistrationsInterface,
    ) {

        const event = await this.requireEvent(eventId);

        const page = query.page || 1;
        const limit = query.limit || 10;

        const skip = (page - 1) * limit;

        const where = this.buildRegistrationWhere(
            eventId,
            query.search,
        );

        const [registrations, count] = await Promise.all([

            this.database.eventRegistration.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },

                select: {
                    id: true,
                    createdAt: true,

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

            this.database.eventRegistration.count({
                where,
            }),
        ]);

        return {
            event: {
                id: event.id,
                title: event.title,
                startDateTime: event.startDateTime,
                maxCapacity: event.maxCapacity,
            },

            data: registrations.map((row) => ({
                id: row.id,
                registeredAt: row.createdAt,

                member: row.user,
            })),

            count,
        };
    }

    /**
     * Export the whole registrant roster as CSV.
     *
     * Unpaginated on purpose — the point of the export is to hand staff the
     * complete list, so paging it would defeat it.
     */
    async exportEventRegistrations(
        eventId: string,
    ) {

        const event = await this.requireEvent(eventId);

        const registrations =
            await this.database.eventRegistration.findMany({
                where: {
                    eventId,
                },

                orderBy: {
                    createdAt: 'asc',
                },

                select: {
                    createdAt: true,

                    user: {
                        select: {
                            publicId: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

        const csv = toCsv(
            EVENT_REGISTRANT_CSV_HEADERS,

            registrations.map((row) => [
                row.user?.publicId ?? '',
                row.user?.name ?? '',
                row.user?.email ?? '',
                row.createdAt,
            ]),
        );

        return {
            filename: `${csvFilenameSlug(event.title)}-registrations.csv`,
            csv,
        };
    }

    /**
     * Load an event or say so — shared by both registrant reads so a bad id
     * is a 404 rather than an empty roster that looks like "nobody signed up".
     */
    private async requireEvent(eventId: string) {

        const event = await this.database.event.findUnique({
            where: {
                id: eventId,
            },

            select: {
                id: true,
                title: true,
                startDateTime: true,
                maxCapacity: true,
            },
        });

        if (!event) {
            throw new NotFoundException(
                'Event not found',
            );
        }

        return event;
    }

    /**
     * Registrant search — over the member's name, email and member ID, which
     * are the three things staff have in hand when somebody asks "am I on the
     * list?".
     */
    private buildRegistrationWhere(
        eventId: string,
        search?: string,
    ): Prisma.EventRegistrationWhereInput {

        if (!search) {
            return { eventId };
        }

        return {
            eventId,

            user: {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },

                    {
                        email: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },

                    {
                        publicId: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
        };
    }
}
