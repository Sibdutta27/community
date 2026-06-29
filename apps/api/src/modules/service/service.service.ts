import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { ServiceStatus } from '@/generated/prisma/enums';

@Injectable()
export class ServiceService {
    constructor(private readonly database: DatabaseService) { }

    /**
     * Get all service categories
     */
    async getAllCategories() {
        const categories = await this.database.serviceCategory.findMany({
            orderBy: {
                createdAt: 'asc',
            },
        });

        return categories.map(categorie => ({
            id         : categorie.id,
            key        : categorie.key,
            name       : categorie.name,
            icon       : categorie.icon,
        }));
    }
    
    /**
     * Get all service exclude closed one
     */
    async getAllAvailableServices( categoryKey?: string ) {
        const services = await this.database.service.findMany({
            where: {
                status: {
                    not: ServiceStatus.CLOSED, // exclude CLOSED
                },
                ...(categoryKey && {
                    category: {
                        key: categoryKey,
                    },
                }),
            },
            include: {
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return services;
    }

    /**
     * Register a user to a particular service
     */
    async registerUserToService(serviceId: string, userId: string) {

        // Check service exists
        const service = await this.database.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            throw new NotFoundException('Service not found');
        }

        // Check the service status is active
        if (service.status !== ServiceStatus.ACTIVE) {
            throw new BadRequestException(
                'Service is not active for registration',
            );
        }

        // Prevent duplicate registration
        const existing = await this.database.serviceRegistration.findFirst({
            where: {
                serviceId,
                userId,
            },
        });

        if (existing) {
            throw new BadRequestException('User already registered for this service');
        }

        // 3. Create registration
        await this.database.serviceRegistration.create({
            data: {
                serviceId,
                userId,
                date  : new Date(),
                status: 'REGISTERED',
            },
        });

        return { success: true, message: 'Registered to service successfully' };
    }

    /**
     * Get all register services for a user
     */
    async registerServicesListForUser(userId: string) {
        const registrations = await this.database.serviceRegistration.findMany({
            where: {
                userId,
            },
            include: {
                service: {
                    include: {
                        category: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        return registrations;
    }
}