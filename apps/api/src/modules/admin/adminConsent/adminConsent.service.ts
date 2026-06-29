import { Prisma } from '@/generated/prisma/client';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { GetConsentsQuery } from './interfaces/getConsent.interface';
import { CreateConsentInterface } from './interfaces/createConsent.interface';
import { EditConsentInterface } from './interfaces/editConsent.interface';


@Injectable()
export class AdminConsentService {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    /**
     * Get all consents
     */
    async getConsents(
        query: GetConsentsQuery,
    ) {

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
        const where:
            Prisma.ConsentWhereInput = {

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
                        title: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },

                    {
                        content: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ],
            }),
        };

        /**
         * Get consents + count
         */
        const [consents, count]
            = await Promise.all([

                this.database.consent.findMany({
                    where,

                    skip,
                    take: limit,

                    orderBy: {
                        createdAt: 'desc',
                    },
                }),

                this.database.consent.count({
                    where,
                }),
            ]);

        return {
            data: consents,
            count,
        };
    }

    /**
 * Get single consent
 */
    async getConsent(
        consentId: string,
    ) {

        const consent = await this.database.consent.findUnique({
            where: {
                id: consentId,
            },
        });

        if (!consent) {
            throw new NotFoundException(
                'Consent not found',
            );
        }

        return consent;
    }

    /**
     * Create consent
     */
    async createConsent(
        dto: CreateConsentInterface,
    ) {

        /**
         * Check existing consent
         */
        const existingConsent = await this.database.consent.findFirst({
            where: {
                key: dto.key,
                version: dto.version,
            },
        });

        if (existingConsent) {

            throw new ConflictException(
                'Consent with this key and version already exists',
            );
        }

        /**
         * Create consent
         */
        await this.database.consent.create({
            data: {
                key: dto.key,
                version: dto.version,

                title: dto.title,
                content: dto.content,

                required: dto.required ?? true,
                active: dto.active ?? true,
            },
        });

        return {
            success: true,
            message: 'Consent created successfully',
        };
    }

    /**
     * Edit consent
     */
    async editConsent(
        consentId: string,
        dto: EditConsentInterface,
    ) {

        /**
         * Check consent exists
         */
        const existingConsent = await this.database.consent.findUnique({
            where: {
                id: consentId,
            },
        });

        if (!existingConsent) {

            throw new NotFoundException(
                'Consent not found',
            );
        }

        /**
         * Update consent
         */
        const consent = await this.database.consent.update({
            where: {
                id: consentId,
            },

            data: {
                ...(dto.title !== undefined && {
                    title: dto.title,
                }),

                ...(dto.content !== undefined && {
                    content: dto.content,
                }),

                ...(dto.required !== undefined && {
                    required: dto.required,
                }),

                ...(dto.active !== undefined && {
                    active: dto.active,
                }),
            },
        });

        return {
            success: true,
            message: 'Consent updated successfully',
        };
    }
}
