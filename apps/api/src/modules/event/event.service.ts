import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class EventService {
    constructor(private readonly database: DatabaseService) { }

    /**
     * Get all event categories
     */
    async getAllCategories() {
        const categories = await this.database.eventCategory.findMany();

        return categories.map(categorie => ({
            id         : categorie.id,
            key        : categorie.key,
            name       : categorie.name,
            description: categorie.description,
            icon       : categorie.icon,
        }));
    }

    /**
     * Get all avilable event
     */
    async getAllAvailableEvent(categoryKey?: string, date?: string) {
        
        let where: any = {};

        // Category filter
        if (categoryKey) {
            where.category = {
                key: categoryKey,
            };
        }

        // Date filter (if provided)
        if (date) {
            const inputDate = new Date(date);

            if (isNaN(inputDate.getTime())) {
                throw new BadRequestException('Invalid date format');
            }

            const startOfDay = new Date(inputDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(inputDate);
            endOfDay.setHours(23, 59, 59, 999);

            where.OR = [
                {
                    startDateTime: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                {
                    endDateTime: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                {
                    AND: [
                        { startDateTime: { lte: startOfDay } },
                        { endDateTime: { gte: endOfDay } },
                    ],
                },
            ];
        } else {
            // Default: upcoming events
            const now = new Date();

            where.startDateTime = {
                gte: now,
            };
        }

        const events = await this.database.event.findMany({
            where,
            include: {
                category: true,
                _count: {
                    select: {
                        registrations: true,
                    },
                },
            },
            orderBy: {
                startDateTime: 'asc',
            },
        });

        // Clean response
        return events.map(e => ({
            ...e,
            registrationCount: e._count.registrations,
        }));
    }

    /**
     * Get previous event
     */
    async getPreviousEvents(categoryKey?: string) {
        const now = new Date();

        // 30 days ago from now
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 30);

        const events = await this.database.event.findMany({
            where: {
                startDateTime: {
                    gte: pastDate, // within last 30 days
                    lt: now,       // already happened
                },
                ...(categoryKey && {
                    category: {
                        key: categoryKey,
                    },
                }),
            },

            include: {
                category: true,
                _count: {
                    select: {
                        registrations: true,
                    },
                },
            },

            orderBy: {
                startDateTime: 'desc', // latest past event first
            },
        });

        return events.map(e => ({
            ...e,
            registrationCount: e._count.registrations,
        }));
    }

    /**
     * Register a user to a particular service
     */
    async registerUserToEvent( eventId: string, userId: string) {
        // Check event exists
        const event = await this.database.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // Prevent duplicate registration
        const existing = await this.database.eventRegistration.findFirst({
            where: {
                eventId,
                userId,
            },
        });

        if (existing) {
            throw new BadRequestException('User already registered for this event');
        }

        // 3. Create registration
        await this.database.eventRegistration.create({
            data: {
                eventId,
                userId,
            },
        });

        return { success: true, message: 'Event registered successfully' }
    }

     /**
     * Get all register events for a user
     */
    async registerEventsListForUser(userId: string) {
        const registrations = await this.database.eventRegistration.findMany({
            where: {
                userId,
            },
            include: {
                event: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return registrations;
    }
}
