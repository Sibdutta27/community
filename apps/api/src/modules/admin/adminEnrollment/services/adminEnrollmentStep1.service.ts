import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class AdminEnrollmentStep1Service {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    /**
     * Get all step 1 (Demographics) data for the enrollment.
     */
    public async getStep1(enrollmentId: string) {

        // Get the enrollment
        const enrollment = await this.database.enrollment.findFirst({
            where: { id: enrollmentId },
            include: {
                steps: true,
            },
        });

        if (!enrollment) {
            throw new BadRequestException('Enrollment not found');
        }

        if (enrollment.steps.length === 0) {
            throw new BadRequestException('Enrollment steps not found');
        }

        if (!enrollment.steps.find(step => step.stepNumber == 1)?.isCompleted) {
            throw new BadRequestException('Step 1 not completed yet');
        }

        return {
            demographics: {
                firstName          : enrollment.firstName,
                lastName           : enrollment.lastName,

                dateOfBirth        : enrollment.dateOfBirth,
                cityOfBirth        : enrollment.cityOfBirth,
                municipalityOfBirth: enrollment.municipalityOfBirth,
                countryOfBirth     : enrollment.countryOfBirth,

                sex                : enrollment.sex,
                gender             : enrollment.gender,
                genderSelfDescribe : enrollment.genderSelfDescribe,

                maritalStatus      : enrollment.maritalStatus,
                occupation         : enrollment.occupation,
            },

            yucayekeInfo: {
                identity        : enrollment.identity,
                yucayeke        : enrollment.yucayeke,
                yucayekeUnknown : enrollment.yucayekeUnknown,
                hasChildren     : enrollment.hasChildren,
                hasMinorChildren: enrollment.hasMinorChildren,
            },

            signature: {
                signatureName: enrollment.signatureName,
                signatureDate: enrollment.signatureDate,
                agreedToTerms: enrollment.agreedToTerms,
            },
        };
    }
}
