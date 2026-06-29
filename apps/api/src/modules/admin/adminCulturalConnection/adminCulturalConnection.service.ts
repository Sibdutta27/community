import { Prisma } from '@/generated/prisma/client';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { DocumentService } from '@/modules/document/document.service';
import { GetCulturalConnectionsQueryInterface } from './interfaces/getCulturalConnection.interface';
import { EditCulturalConnectionsQueryInterface } from './interfaces/editCulturalConnection.interface';
import { CreateCulturalConnectionsQueryInterface } from './interfaces/createCulturalConnecton.interface';


@Injectable()
export class AdminCulturalConnectionService {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    /**
     * Get paginated cultural connection
     */
    async getCulturalConnections(query: GetCulturalConnectionsQueryInterface) {

        const {
            page = 1,
            limit = 10,
            search,
            active,
        } = query;

        const skip = (page - 1) * limit;

        /**
         * Build where condition
         */
        const where: Prisma.CulturalConnectionWhereInput = {

            ...(typeof active === 'boolean' && {
                active,
            }),

            ...(search && {
                OR: [
                    {
                        key: {
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
                ],
            }),
        };

        /**
         * Get data + count
         */
        const [connections, count] = await Promise.all([

            this.database.culturalConnection.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },
            }),

            this.database.culturalConnection.count({
                where,
            }),
        ]);

        return {
            data: connections,
            count,
        };
    }

    /**
     * Get single cultural connection
     */
    async getCulturalConnection(id: string) {

        const connection = await this.database.culturalConnection.findUnique({
            where: {
                id,
            },
        });

        if (!connection) {
            throw new BadRequestException(
                'Cultural connection not found',
            );
        }

        return connection;
    }

    /**
     * Create cultural connection
     */
    async createCulturalConnection(
        dto: CreateCulturalConnectionsQueryInterface,
    ) {

        /**
         * Check existing key
         */
        const existingConnection = await this.database.culturalConnection.findUnique({
                where: {
                    key: dto.key,
                },
            });

        if (existingConnection) {
            throw new ConflictException(
                'Cultural connection key already exists',
            );
        }

        /**
         * Create connection
         */
        const connection = await this.database.culturalConnection.create({
                data: {
                    key        : dto.key,
                    description: dto.description,
                    active     : dto.active ?? true,
                },
            });

        return {
            message: 'Cultural connection created successfully',
            success: true
        };
    }

    /**
     * Edit cultural connection
     */
    async editCulturalConnection(
        id: string,
        data: EditCulturalConnectionsQueryInterface,
    ) {

        const connection = await this.database.culturalConnection.findUnique({
            where: {
                id,
            },
        });

        if (!connection) {
            throw new BadRequestException(
                'Cultural connection not found',
            );
        }

        const updatedConnection = await this.database.culturalConnection.update({
            where: {
                id,
            },

            data: {
                ...(data.description !== undefined && {
                    description: data.description,
                }),

                ...(data.active !== undefined && {
                    active: data.active,
                }),
            },
        });

        return {
            message: 'Cultural connection updated successfully',
            success: true,
        };
    }
}
