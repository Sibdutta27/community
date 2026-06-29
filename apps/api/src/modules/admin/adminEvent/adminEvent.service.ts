import { Prisma } from '@/generated/prisma/client';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { GetEventCategoriesInterface } from './interfaces/getEventCategories.interface';
import { CreateEventCategoryInterface } from './interfaces/createEventCategory.interface';
import { UpdateEventCategoryInterface } from './interfaces/updateEventCategory.interface';
import { GetEventsInterface } from './interfaces/getEvents.interface';
import { CreateEventInterface } from './interfaces/createEvent.interface';
import { UpdateEventInterface } from './interfaces/updateEvent.interface';


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
}
