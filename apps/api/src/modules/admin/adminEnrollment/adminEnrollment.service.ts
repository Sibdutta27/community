import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { UserService } from '@/modules/user/user.service';
import { DocumentService } from '@/modules/document/document.service';

import { IGetEnrollmentsQuery } from './interfaces/getEnrollment.interface';
import { Prisma } from '@/generated/prisma/client';
import { DocumentType, EnrollmentStatus } from '@/generated/prisma/enums';

@Injectable()
export class AdminEnrollmentService {

    constructor(
        private readonly database: DatabaseService,
        private readonly userService: UserService,
        private readonly documentService: DocumentService,
    ) { }

    /**
     * Get paginated enrollments
     */
    async getEnrollments(query: IGetEnrollmentsQuery) {
        const {
            page = 1,
            limit = 10,
            status,
            search,
        } = query;

        const skip = (page - 1) * limit;

        // Build where condition
        const where: Prisma.EnrollmentWhereInput = {
            ...(status && { status }),

            ...(search && {
                OR: [
                    {
                        firstName: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        lastName: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },

                    {
                        user: {
                            email: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            }),
        };

        // Get enrollments + total count
        const [enrollments, count] = await Promise.all([

            this.database.enrollment.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },

                select: {
                    id: true,
                    status: true,

                    firstName: true,
                    lastName: true,

                    approvalDate: true,

                    user: {
                        select: {
                            id: true,
                            publicId: true,
                            name: true,
                            email: true,

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
                    },
                },
            }),
            this.database.enrollment.count({
                where,
            }),
        ]);

        // Format response
        const formattedEnrollments = await Promise.all(
            enrollments.map(async (enrollment) => {

                // Get profile picture URL (if exists)
                const profilePicture =
                    enrollment.user.documents.length > 0
                        ? await this.documentService.getPublicUrl(
                            enrollment.user.documents[0].fileKey,
                        )
                        : null;

                return {
                    id: enrollment.id,
                    status: enrollment.status,

                    firstName: enrollment.firstName,
                    lastName: enrollment.lastName,

                    user: {
                        id: enrollment.user.id,
                        publicId: enrollment.user.publicId,
                        name: enrollment.user.name,
                        email: enrollment.user.email,

                        profilePicture,
                    },
                };
            }),
        );

        return {
            data: formattedEnrollments,
            count: count,
        };
    }

    /**
     * Get enrollment status counts
     */
    async getStatusCounts() {

        const [
            totalDraft,
            totalSubmitted,
            totalApproved,
            totalRejected,
        ] = await Promise.all([

            this.database.enrollment.count({
                where: {
                    status: EnrollmentStatus.DRAFT,
                },
            }),

            this.database.enrollment.count({
                where: {
                    status: EnrollmentStatus.SUBMITTED,
                },
            }),

            this.database.enrollment.count({
                where: {
                    status: EnrollmentStatus.APPROVED,
                },
            }),

            this.database.enrollment.count({
                where: {
                    status: EnrollmentStatus.REJECTED,
                },
            }),
        ]);

        return {
            DRAFT: totalDraft,
            SUBMITTED: totalSubmitted,
            APPROVED: totalApproved,
            REJECTED: totalRejected,
        };
    }

    /**
     * Approve enrollment
     */
    public async approveEnrollment(
        enrollmentId: string,
    ) {

        // Find enrollment
        const enrollment = await this.database.enrollment.findUnique({
            where: {
                id: enrollmentId,
            },

            include: {
                documents: true,
                steps: true,
            },
        });

        if (!enrollment) {
            throw new BadRequestException(
                'Enrollment not found',
            );
        }

        /**
         * Prevent approving already approved
         */
        if (
            enrollment.status === EnrollmentStatus.APPROVED
        ) {
            throw new BadRequestException(
                'Enrollment already approved',
            );
        }

        /**
         * Check all steps completed
         */
        const allStepsCompleted = enrollment.steps.every(
            (step) => step.isCompleted,
        );

        if (!allStepsCompleted) {
            throw new BadRequestException(
                'All enrollment steps are not completed',
            );
        }

        /**
         * Check required documents verified
         */
        const requiredDocuments = enrollment.documents.filter(
            (doc) => doc.type === DocumentType.USER_PHOTO,
        );

        const allDocumentsVerified = requiredDocuments.every(
            (doc) => doc.verifiedByAdmin,
        );

        if (!allDocumentsVerified) {
            throw new BadRequestException(
                'All required documents must be verified',
            );
        }

        /**
         * Update enrollment
         */
        await this.database.enrollment.update({
            where: {
                id: enrollmentId,
            },

            data: {
                status: EnrollmentStatus.APPROVED,
                approvalDate: new Date(),
            },
        });

        return {
            success: true,
            message: 'Enrollment approved successfully',
        };
    }

    /**
     * Reject enrollment
     */
    public async rejectEnrollment(
        enrollmentId: string,
    ) {

        // Find enrollment
        const enrollment = await this.database.enrollment.findUnique({
            where: {
                id: enrollmentId,
            },
        });

        if (!enrollment) {
            throw new BadRequestException(
                'Enrollment not found',
            );
        }

        /**
         * Prevent rejecting approved enrollment
         */
        if (
            enrollment.status === EnrollmentStatus.APPROVED
        ) {
            throw new BadRequestException(
                'Approved enrollment cannot be rejected',
            );
        }

        /**
         * Update enrollment
         */
        await this.database.enrollment.update({
            where: {
                id: enrollmentId,
            },

            data: {
                status:
                    EnrollmentStatus.REJECTED,

                approvalDate: null,
            },
        });

        return {
            success: true,
            message: 'Enrollment rejected successfully',
        };
    }

}
