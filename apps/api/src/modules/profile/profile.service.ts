import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { DatabaseService } from '@/database/database.service';

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

        return {
            user,
            enrollment,
            enrollmentStep,
            enrollmentStatus,
            hasEnrollment: !!enrollment,
            // Regional-member lookup previously keyed off the (now removed)
            // address model; kept as an empty list until it is re-scoped.
            regionalMembers: [],
        };
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
}
