import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { AddressType } from '@/generated/prisma/enums';
import { DatabaseService } from '@/database/database.service';
import { profile } from 'console';

@Injectable()
export class ProfileService {

    constructor(
        private readonly userService: UserService,
        private readonly enrollmentService: EnrollmentService,
        private readonly databaseServices: DatabaseService
    ) { }

    public async getProfile(userId: string) {

        // Get the user info
        const user = await this.getUserInfo(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Get the enrollment info
        const enrollment = await this.getEnrollmentInfo(userId);

        // Get the enrollment step
        const enrollmentStep = enrollment?.steps;

        // Get the enrollment status
        const enrollmentStatus = enrollment?.status;

        // Get the zip code for regional members
        const zipCode = enrollment?.addresses?.find(address => address.type === AddressType.CURRENT)?.zipCode;

        // Get the regional members
        if ( !enrollment || !zipCode ) {
            return {
                user,
                enrollment,
                enrollmentStep,
                enrollmentStatus,
                hasEnrollment: !!enrollment,
                regionalMembers: [],
            }
        }

        // Get the regional members
        const regionalMembers = await this.getRegionalMembers(enrollment.id, zipCode);

        return {
            user,
            enrollment,
            enrollmentStep,
            enrollmentStatus,
            hasEnrollment: !!enrollment,
            regionalMembers,
        }
    }

    /**
     * Helper function for get user info
     */
    public async getUserInfo(userId: string) {

        // Get the user info
        const user = await this.userService.findById(userId);

        if (!user) {
            return null;
        }

        return {
            id            : user.id,
            publicId      : user.publicId,
            name          : user.name,
            email         : user.email,
            role          : user.role,
            profilePicture: await this.userService.getUserProfilePicture(user.id),
        }
    }

    /**
     * Helper function for get enrollment info
     */
    public async getEnrollmentInfo(userId: string) {
        return await this.enrollmentService.getExtendedEnrollmentByUserId(userId);
    }

    /**
     * Helper function for get regional members
     */
    public async getRegionalMembers(enrollmentId: string, zipCode: string) {

        const members = await this.databaseServices.enrollment.findMany({
            where: {
                id: { not: enrollmentId }, // exclude current user
                addresses: {
                    some: {
                        zipCode: zipCode,
                        type   : AddressType.CURRENT,
                    },
                },
            },
            select: {
                id           : true,
                firstName    : true,
                lastName     : true,
                preferredName: true,
                addresses    : {
                    where: {
                        type: AddressType.CURRENT,
                    },
                    select: {
                        city   : true,
                        state  : true,
                        zipCode: true,
                    },
                },
                user: {
                    select: {
                        id   : true,
                    },
                },
            },
        });

        return await Promise.all(members.map(async (member) => ({
            id            : member.id,
            name          : member.preferredName || `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim(),
            location      : member.addresses[0] || null,
            profilePicture: member.user.id ? await this.userService.getUserProfilePicture(member.user.id) : null,
        })));
    }
}
