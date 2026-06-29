// user.service.ts

import { formatPublicId } from "@/common/utils/formater.util";
import { DatabaseService } from "@/database/database.service";
import { Role } from "@/generated/prisma/enums";
import { Injectable } from "@nestjs/common";
import { DocumentService } from "../document/document.service";
import { DocumentType } from '@/generated/prisma/enums';

@Injectable()
export class UserService {
    constructor(private database: DatabaseService, private documentService: DocumentService) { }

    /**
     * Create a google auth user
     * @param uuid 
     * @param email 
     * @param name 
     * @returns 
     */
    async createUser({ name, email, password, role = Role.USER }: { name: string, email: string, password: string, role?: Role }) {

        return this.database.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password,
                    role: role,
                    lastActiveAt: new Date(),
                },
            });

            const prefix = "TNB"
            const publicId = formatPublicId(prefix, user.serial);

            return tx.user.update({
                where: { id: user.id },
                data: { publicId },
            });
        });
    }

    /**
     * Get a user by id
     * @param id 
     * @returns 
     */
    async findById(id: string, profilePictureRequired = false) {
        let user = await this.database.user.findUnique({
            where: { id },
        });

        if ( ! user ) return user;

        if (profilePictureRequired) {
            const profilePicture = await this.getUserProfilePicture(user.id);
            return {
                ...user,
                profilePicture,
            }
        }

        return user;
    }

    /**
     * Get a user by email
     * @param email 
     * @returns 
     */
    async findByEmail(email: string, profilePictureRequired = false) {
        let user = await this.database.user.findUnique({
            where: { email },
        });

        if ( ! user ) return user;

        if (profilePictureRequired) {
            const profilePicture = await this.getUserProfilePicture(user.id);
            return {
                ...user,
                profilePicture,
            }
        }

        return user;
    }

    /**
     * Get the profile picture of a user
     */
    async getUserProfilePicture(userId: string) {
        const profilePicture = await this.database.document.findFirst({
            where: {
                userId,
                type: DocumentType.PROFILE_PICTURE,
            },
        });

        if (!profilePicture) {
            return null;
        }

        return await this.documentService.getPublicUrl(profilePicture.fileKey);
    }

    /**
     * Update user's last active time
     */
    async updateLastActive(userId: string) {

        const now = new Date();

        try {
            return this.database.user.update({
                where: { id: userId },
                data: {
                    lastActiveAt: now,
                },
            });
        } catch (error) {
            throw new Error('Unable to update user last activity');
        }
    }

    /**
     * Get total number of user count
     */
    async totalUserCount() {
        return await this.database.user.count();
    }

    /**
     * Get the total number of enrolled user count
     */
    async totalEnrolledUserCount() {
        const totalEnrolledUsers = await this.database.user.count({
            where: {
                enrollment: {
                    isNot: null,
                },
            },
        });

        return totalEnrolledUsers;
    }

    /**
     * Get the resent active usesr count
     */
    async recentActiveUserCount() {
        const ONE_MONTH_AGO = new Date();
        ONE_MONTH_AGO.setDate(ONE_MONTH_AGO.getDate() - 30);

        const superActiveUsers = await this.database.user.count({
            where: {
                lastActiveAt: {
                    gte: ONE_MONTH_AGO,
                },
            },
        });

        return superActiveUsers;
    }

    /**
     * Get last 10 active user
     */
    async getLastActiveUsers(count = 10) {
        const recentUsers = await this.database.user.findMany({
            orderBy: {
                lastActiveAt: 'desc',
            },
            take: count,
        });

        return await Promise.all(recentUsers.map( async user => {
            return {
                name          : user.name,
                profilePicture: await this.getUserProfilePicture(user.id),
                publicId      : user.publicId,
                lastActiveAt  : user.lastActiveAt,
            }
        }));
    }
}