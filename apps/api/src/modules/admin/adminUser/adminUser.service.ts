import { DocumentType, Prisma, Role } from '@/generated/prisma/client';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { UserService } from '@/modules/user/user.service';
import { hashPassword } from '@/common/utils/password.util';
import { DocumentService } from '@/modules/document/document.service';
import { GetUsersQuery } from './interfaces/adminUser.interface';
import { IUpdateUser } from './interfaces/updateUser.interface';

@Injectable()
export class AdminUserService {

    constructor(
        private readonly database: DatabaseService,
        private readonly userService: UserService,
        private readonly documentService: DocumentService,
    ) { }

    /**
     * Get single user
     */
    async getUser(id: string) {

        const user = await this.userService.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            id      : user.id,
            publicId: user.publicId,
            name    : user.name,
            email   : user.email,
            role    : user.role,
        };
    }

    /**
     * Get a user's consent record.
     *
     * Consent acceptances hang off the Enrollment, not the User, so a member
     * who has never started one has no consents rather than an error — the
     * caller renders that as an empty state, which is a real answer.
     */
    async getUserConsents(id: string) {

        const user = await this.database.user.findUnique({
            where: {
                id,
            },

            include: {
                enrollment: {
                    include: {
                        consent: {
                            include: {
                                consent: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.enrollment) {
            return {
                hasEnrollment  : false,
                consentAccepted: false,
                consents       : [],
            };
        }

        return {
            hasEnrollment  : true,
            enrollmentId   : user.enrollment.id,
            consentAccepted: user.enrollment.consentAccepted,

            consents: user.enrollment.consent.map((c) => ({
                id        : c.consent.id,
                key       : c.consent.key,
                version   : c.consent.version,
                title     : c.consent.title,
                required  : c.consent.required,
                accepted  : c.accepted,
                acceptedAt: c.acceptedAt,
            })),
        };
    }

    /**
     * Update user
     */
    async updateUser(
        id  : string,
        body: IUpdateUser,
    ) {

        /**
         * Check user exists
         */
        const existingUser = await this.database.user.findUnique({
            where: {
                id,
            },
        });

        if (!existingUser) {
            throw new NotFoundException(
                'User not found',
            );
        }

        /**
         * Build update data
         */
        const updateData: any = {};

        if (body.name !== undefined) {
            updateData.name = body.name;
        }

        if (body.role !== undefined) {
            updateData.role = body.role;
        }

        /**
         * Update password only if provided
         */
        if (
            body.password &&
            body.password.trim()
        ) {

            const hashedPassword = await hashPassword(body.password);
            updateData.password  = hashedPassword;
        }

        /**
         * Update user
         */
        await this.database.user.update({
                where: {
                    id,
                },

                data: updateData,
            });

        return {
            success: true
        };
    }

    /**
     * Register a new user
     */
    async registerUser(
        {
            name,
            email,
            password,
            role,
        }: {
            name: string,
            email: string,
            password: string
            role: Role,
        }
    ) {

        // Validate the fields
        if (!name) {
            throw new BadRequestException('Name is required');
        }

        if (!email) {
            throw new BadRequestException('Email is required');
        }

        if (!password) {
            throw new BadRequestException('Password is required');
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Get the user by email
        let existingUser = await this.userService.findByEmail(normalizedEmail);

        // Check for existing user
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create a new user
        await this.userService.createUser({
            name: name,
            email: email,
            password: hashedPassword,
            role: role,
        })

        return {
            success: true
        };
    }

    /**
     * Get paginated users
     */
    async getUsers(query: GetUsersQuery) {
        const {
            page = 1,
            limit = 10,
            role,
            search,
        } = query;

        const skip = (page - 1) * limit;

        // Build where condition
        const where: Prisma.UserWhereInput = {
            ...(role && { role }),

            ...(search && {
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
                ],
            }),
        };

        // Get users + total count together
        const [users, count] = await Promise.all([
            this.database.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },

                select: {
                    id: true,
                    publicId: true,
                    name: true,
                    email: true,
                    role: true,

                    lastActiveAt: true,

                    enrollment: {
                        select: {
                            id: true,
                        },
                    },
                    documents: {
                        where: {
                            type: DocumentType.PROFILE_PICTURE,
                        },

                        take: 1,

                        select: {
                            id: true,
                            fileKey: true,
                        },
                    },
                },
            }),

            this.database.user.count({
                where,
            }),
        ]);

        // Format response
        const formattedUsers = await Promise.all(users.map(async (user) => ({
            id: user.id,
            publicId: user.publicId,

            name: user.name,
            email: user.email,
            role: user.role,

            lastActiveAt: user.lastActiveAt,
            hasEnrollment: !!user.enrollment,

            profilePicture:
                user.documents.length > 0
                    ? await this.documentService.getPublicUrl(user.documents[0].fileKey)
                    : null,
        })));

        return {
            data: formattedUsers,
            count: count,
        };
    }

    /**
     * Get user role counts
     */
    async getRoleCounts() {

        const [
            totalUsers,
            totalAdmins,
            totalModerators,
        ] = await Promise.all([
            this.database.user.count({
                where: {
                    role: Role.USER,
                },
            }),

            this.database.user.count({
                where: {
                    role: Role.ADMIN,
                },
            }),

            this.database.user.count({
                where: {
                    role: Role.MODERATOR,
                },
            }),
        ]);

        return {
            USER: totalUsers,
            ADMIN: totalAdmins,
            MODERATOR: totalModerators,
        };
    }

    /**
     * Change roles of multiple users
     */
    async changeRoles(
        users: string[],
        role: Role,
    ) {

        const result = await this.database.user.updateMany({
            where: {
                id: {
                    in: users,
                },
            },

            data: {
                role,
            },
        });

        return {
            success: true,
            updatedCount: result.count,
        };
    }

}
