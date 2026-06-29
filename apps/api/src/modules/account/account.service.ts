import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { DocumentType } from '@/generated/prisma/enums';
import { profile } from 'console';

@Injectable()
export class AccountService {

    constructor(
        private readonly userService      : UserService,
        private readonly enrollmentService: EnrollmentService
    ) { }

    /**
     * Get the account info for the user
     */
    public async getInfo(userId: string) {

        // Get the user info
        const user = await this.getUserInfo(userId);

        if ( !user ) {
            throw new Error('User not found');
        }

        // Get the enrollment info
        const enrollment = await this.getEnrollmentInfo(userId);

        // Get the enrollment step
        const enrollmentStep = enrollment?.steps;

        // Get the enrollment status
        const enrollmentStatus = enrollment?.status;

        return {
            user,
            enrollment,
            enrollmentStep,
            enrollmentStatus,
            hasEnrollment: !! enrollment,
        }
    }

    /**
     * Helper function for get user info
     */
    public async getUserInfo(userId: string) {

        // Get the user info
        const user = await this.userService.findById(userId);

        if ( !user ) {
            return null;
        }

        return {
            id            : user.id,
            publicId      : user.publicId,
            name          : user.name,
            email         : user.email,
            role          : user.role,
            lastActive    : user.lastActiveAt,
            profilePicture: await this.userService.getUserProfilePicture(user.id),
        }
    }

    /**
     * Helper function for get enrollment info
     */
    public async getEnrollmentInfo(userId: string) {
        const enrollment =  await this.enrollmentService.getExtendedEnrollmentByUserId(userId);

        if ( !enrollment ) {
            return null;
        }

        return {
            id            : enrollment?.id,
            steps         : enrollment?.steps,
            status        : enrollment?.status,
            personalInfo  : enrollment?.personalInfo,
        }
    }

    /**
     * Get the community meta for the site
     */
    public async getCommunityMeta() {
        // Get the total number of users
        const totalUsersCount = Number( await this.userService.totalUserCount() );

        // Get the total number of enrolled user
        const totalEnrolledUsersCount = Number( await this.userService.totalEnrolledUserCount() );

        // Get the total number of super active user
        const activeUserCounts = Number( await this.userService.recentActiveUserCount() );

        // Get the letest 10 resent user
        const recentUsers = await this.userService.getLastActiveUsers(10);

        return {
            totalUsersCount,
            totalEnrolledUsersCount,
            activeUserCounts,
            recentUsers,
        }
    }
}
