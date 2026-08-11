import { Prisma } from '@/generated/prisma/client';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { GetServiceCategoriesQueryInterface } from './interfaces/getServiceCategory.interface';
import { CreateServiceCategoryInterface } from './interfaces/createServiceCategory.interface';
import { EditServiceCategoryInterface } from './interfaces/editServiceCategory.interface';
import { GetServicesQueryInterface } from './interfaces/getServices.interface';
import { CreateServiceInterface } from './interfaces/createService.interface';
import { EditServiceInterface } from './interfaces/editService.interface';
import { GetServiceRegistrationsInterface } from './interfaces/getServiceRegistrations.interface';
import { csvFilenameSlug, toCsv } from '@/common/utils/csv.util';

/**
 * Columns of the registrant CSV, in the order staff read them. Programs carry
 * a per-registration status (the member module writes `REGISTERED`), so it is
 * exported alongside the roster.
 */
export const SERVICE_REGISTRANT_CSV_HEADERS = [
    'Member ID',
    'Name',
    'Email',
    'Registered At',
    'Status',
];


@Injectable()
export class AdminServiceService {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    /**
     * Get all service categories
     */
    async getServiceCategories(
        query: GetServiceCategoriesQueryInterface,
    ) {

        const {
            search,
        } = query;

        const skip = query.page && query.limit
            ? (query.page - 1) * query.limit
            : undefined;

        const take = query.limit || undefined;

        /**
         * Where condition
         */
        const where: Prisma.ServiceCategoryWhereInput = {

            ...(search && {
                OR: [
                    {
                        key: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },

                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ],
            }),
        };

        /**
         * Fetch categories + count
         */
        const [
            categories,
            count,
        ] = await Promise.all([

            this.database.serviceCategory.findMany({
                where,

                skip,
                take,

                orderBy: {
                    createdAt: 'desc',
                },

                select: {
                    id: true,
                    key: true,
                    name: true,
                    icon: true,

                    _count: {
                        select: {
                            services: true,
                        },
                    },

                    createdAt: true,
                },
            }),

            this.database.serviceCategory.count({
                where,
            }),
        ]);

        return {
            data: categories,
            count,
        };
    }

    /**
     * Create service category
     */
    async createServiceCategory(
        dto: CreateServiceCategoryInterface,
    ) {

        /**
         * Check existing key
         */
        const existingCategory =
            await this.database.serviceCategory.findUnique({
                where: {
                    key: dto.key,
                },
            });

        if (existingCategory) {
            throw new ConflictException(
                'Service category key already exists',
            );
        }

        /**
         * Create category
         */
        await this.database.serviceCategory.create({
            data: {
                key: dto.key,
                name: dto.name,
                icon: dto.icon,
            },
        });

        return {
            success: true,
            message: 'Service category created successfully',
        };
    }

    /**
     * Get single service category
     */
    async getServiceCategory(id: string) {

        const category =
            await this.database.serviceCategory.findUnique({
                where: { id },

                select: {
                    id: true,
                    key: true,
                    name: true,
                    icon: true,

                    _count: {
                        select: {
                            services: true,
                        },
                    },

                    createdAt: true,
                },
            });

        if (!category) {
            throw new NotFoundException(
                'Service category not found',
            );
        }

        return category;
    }

    /**
     * Edit service category
     */
    async editServiceCategory(
        id: string,
        dto: EditServiceCategoryInterface,
    ) {

        /**
         * Check category
         */
        const existingCategory =
            await this.database.serviceCategory.findUnique({
                where: { id },
            });

        if (!existingCategory) {
            throw new NotFoundException(
                'Service category not found',
            );
        }

        /**
         * Update category
         */
        await this.database.serviceCategory.update({
            where: { id },

            data: {
                ...(dto.name !== undefined && {
                    name: dto.name,
                }),

                ...(dto.icon !== undefined && {
                    icon: dto.icon,
                }),
            },
        });

        return {
            success: true,
            message: 'Service category updated successfully',
        };
    }

    /**
     * Get all services
     */
    async getServices(
        query: GetServicesQueryInterface,
    ) {

        const {
            page = 1,
            limit = 10,
            search,
            status,
            categoryId,
        } = query;

        const skip = (page - 1) * limit;

        /**
         * Where condition
         */
        const where: Prisma.ServiceWhereInput = {

            ...(status && {
                status,
            }),

            ...(categoryId && {
                categoryId,
            }),

            ...(search && {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },

                    {
                        description: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },

                    {
                        location: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ],
            }),
        };

        /**
         * Fetch services + count
         */
        const [
            services,
            count,
        ] = await Promise.all([

            this.database.service.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },

                select: {
                    id: true,

                    name: true,
                    description: true,
                    icon: true,

                    isFeatured: true,
                    status: true,

                    location: true,
                    phone: true,
                    email: true,

                    actionType: true,
                    actionLabel: true,
                    actionUrl: true,
                    actionRoute: true,

                    highlights: true,

                    createdAt: true,

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

            this.database.service.count({
                where,
            }),
        ]);

        return {
            data: services,
            count,
        };
    }

    /**
     * Create service
     */
    async createService(
        dto: CreateServiceInterface,
    ) {

        /**
         * Check category
         */
        const category =
            await this.database.serviceCategory.findUnique({
                where: {
                    id: dto.categoryId,
                },
            });

        if (!category) {
            throw new NotFoundException(
                'Service category not found',
            );
        }

        /**
         * Create service
         */
        const service = await this.database.service.create({
            data: {
                name: dto.name,
                description: dto.description,
                icon: dto.icon,

                categoryId: dto.categoryId,

                isFeatured: dto.isFeatured ?? false,

                status: dto.status ?? 'ACTIVE',

                location: dto.location,
                phone: dto.phone,
                email: dto.email,

                actionType: dto.actionType ?? 'EXTERNAL',
                actionLabel: dto.actionLabel,
                actionUrl: dto.actionUrl,
                actionRoute: dto.actionRoute,

                highlights: dto.highlights || [],
            },

            select: {
                id: true,
                name: true,
            },
        });

        return {
            success: true,
            message: 'Service created successfully',
        };
    }

    /**
     * Get single service
     */
    async getService(id: string) {

        const service =
            await this.database.service.findUnique({
                where: { id },

                select: {
                    id: true,

                    name: true,
                    description: true,
                    icon: true,

                    isFeatured: true,
                    status: true,

                    location: true,
                    phone: true,
                    email: true,

                    actionType: true,
                    actionLabel: true,
                    actionUrl: true,
                    actionRoute: true,

                    highlights: true,

                    createdAt: true,
                    updatedAt: true,

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

        if (!service) {
            throw new NotFoundException(
                'Service not found',
            );
        }

        return service;
    }

    /**
     * Edit service
     */
    async editService(
        id: string,
        dto: EditServiceInterface,
    ) {

        /**
         * Check service
         */
        const existingService =
            await this.database.service.findUnique({
                where: { id },
            });

        if (!existingService) {
            throw new NotFoundException(
                'Service not found',
            );
        }

        /**
         * Check category if provided
         */
        if (dto.categoryId) {

            const category =
                await this.database.serviceCategory.findUnique({
                    where: {
                        id: dto.categoryId,
                    },
                });

            if (!category) {
                throw new NotFoundException(
                    'Service category not found',
                );
            }
        }

        /**
         * Update service
         */
        await this.database.service.update({
            where: { id },

            data: {

                ...(dto.name !== undefined && {
                    name: dto.name,
                }),

                ...(dto.description !== undefined && {
                    description: dto.description,
                }),

                ...(dto.icon !== undefined && {
                    icon: dto.icon,
                }),

                ...(dto.categoryId !== undefined && {
                    categoryId: dto.categoryId,
                }),

                ...(dto.isFeatured !== undefined && {
                    isFeatured: dto.isFeatured,
                }),

                ...(dto.status !== undefined && {
                    status: dto.status,
                }),

                ...(dto.location !== undefined && {
                    location: dto.location,
                }),

                ...(dto.phone !== undefined && {
                    phone: dto.phone,
                }),

                ...(dto.email !== undefined && {
                    email: dto.email,
                }),

                ...(dto.actionType !== undefined && {
                    actionType: dto.actionType,
                }),

                ...(dto.actionLabel !== undefined && {
                    actionLabel: dto.actionLabel,
                }),

                ...(dto.actionUrl !== undefined && {
                    actionUrl: dto.actionUrl,
                }),

                ...(dto.actionRoute !== undefined && {
                    actionRoute: dto.actionRoute,
                }),

                ...(dto.highlights !== undefined && {
                    highlights: dto.highlights,
                }),
            },
        });

        return {
            success: true,
            message: 'Service updated successfully',
        };
    }

    /**
     * Get who registered for a program — paginated, newest sign-up first.
     *
     * `ServiceRegistration` has no `createdAt`; its `date` column is what the
     * member module stamps at sign-up, so that is the registered-at we report.
     */
    async getServiceRegistrations(
        serviceId: string,
        query: GetServiceRegistrationsInterface,
    ) {

        const service = await this.requireService(serviceId);

        const page = query.page || 1;
        const limit = query.limit || 10;

        const skip = (page - 1) * limit;

        const where = this.buildRegistrationWhere(
            serviceId,
            query.search,
        );

        const [registrations, count] = await Promise.all([

            this.database.serviceRegistration.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    date: 'desc',
                },

                select: {
                    id: true,
                    date: true,
                    status: true,

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

            this.database.serviceRegistration.count({
                where,
            }),
        ]);

        return {
            service: {
                id: service.id,
                name: service.name,
                status: service.status,
            },

            data: registrations.map((row) => ({
                id: row.id,
                registeredAt: row.date,
                status: row.status,

                member: row.user,
            })),

            count,
        };
    }

    /**
     * Export the whole registrant roster as CSV — unpaginated, because the
     * point of the export is to hand staff the complete list.
     */
    async exportServiceRegistrations(
        serviceId: string,
    ) {

        const service = await this.requireService(serviceId);

        const registrations =
            await this.database.serviceRegistration.findMany({
                where: {
                    serviceId,
                },

                orderBy: {
                    date: 'asc',
                },

                select: {
                    date: true,
                    status: true,

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
            SERVICE_REGISTRANT_CSV_HEADERS,

            registrations.map((row) => [
                row.user?.publicId ?? '',
                row.user?.name ?? '',
                row.user?.email ?? '',
                row.date,
                row.status,
            ]),
        );

        return {
            filename: `${csvFilenameSlug(service.name)}-registrations.csv`,
            csv,
        };
    }

    /**
     * Load a program or say so — a bad id has to be a 404 rather than an empty
     * roster that reads like "nobody signed up".
     */
    private async requireService(serviceId: string) {

        const service = await this.database.service.findUnique({
            where: {
                id: serviceId,
            },

            select: {
                id: true,
                name: true,
                status: true,
            },
        });

        if (!service) {
            throw new NotFoundException(
                'Service not found',
            );
        }

        return service;
    }

    /**
     * Registrant search — over the member's name, email and member ID, which
     * are the three things staff have in hand at the front desk.
     */
    private buildRegistrationWhere(
        serviceId: string,
        search?: string,
    ): Prisma.ServiceRegistrationWhereInput {

        if (!search) {
            return { serviceId };
        }

        return {
            serviceId,

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
