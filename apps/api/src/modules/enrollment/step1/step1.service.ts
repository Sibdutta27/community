import { EnrollmentStatus } from '@/generated/prisma/enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { EnrollmentStepService } from '@/modules/enrollment/common/services/enrollmentStep.service';
import { mapGender, mapIdentity, mapMaritalStatus, mapSex } from './step1.utils';
import { Step1 } from './interface/step1.interface';

@Injectable()
export class Step1Service {

    constructor(
        private readonly database: DatabaseService,
        private readonly enrollmentStepService: EnrollmentStepService,
    ) { }

    /**
     * upsert: Upserts the Step 1 (Demographics) data into the database for the
     * user's enrollment. Persists ONLY the demographic columns on the Enrollment
     * row — contact / address / emergency-contact were removed from the flow.
     */
    public async upsert(userId: string, step1Input: Step1) {

        return await this.database.$transaction(async (tx) => {

            // Find enrollment
            const enrollment = await tx.enrollment.findFirst({
                where: { userId },
            });

            // Validate enrollment exists
            if (!enrollment) {
                throw new BadRequestException('Enrollment not started');
            }

            // Validate enrollment is in DRAFT status
            if (enrollment.status !== EnrollmentStatus.DRAFT) {
                throw new BadRequestException('Enrollment is not in draft status');
            }

            // Persist the demographic fields
            await tx.enrollment.update({
                where: { id: enrollment.id },
                data: {
                    firstName          : step1Input.firstName,
                    lastName           : step1Input.lastName,

                    dateOfBirth        : step1Input.dateOfBirth,
                    cityOfBirth        : step1Input.cityOfBirth,
                    municipalityOfBirth: step1Input.municipalityOfBirth,
                    countryOfBirth     : step1Input.countryOfBirth,

                    sex                : mapSex(step1Input.sex),
                    gender             : mapGender(step1Input.gender),

                    maritalStatus      : mapMaritalStatus(step1Input.maritalStatus),
                    occupation         : step1Input.occupation,

                    identity           : mapIdentity(step1Input.identity),
                    yucayeke           : step1Input.yucayeke,
                    yucayekeUnknown    : step1Input.yucayekeUnknown,

                    hasChildren        : step1Input.hasChildren,
                    hasMinorChildren   : step1Input.hasMinorChildren,
                },
            });

            // Update the step number
            await this.enrollmentStepService.markStepComplete(tx, enrollment.id, 1);

            return {
                success: true,
            };
        });
    }

    /**
     * Get all step 1 (Demographics) data for the user's enrollment.
     */
    public async getStep1(userId: string) {

        // Get the enrollment
        const enrollment = await this.database.enrollment.findFirst({
            where: { userId },
            include: {
                steps: true,
            },
        });

        if (!enrollment) {
            throw new BadRequestException('Enrollment not found');
        }

        if ( enrollment.steps.length === 0 ) {
            throw new BadRequestException('Enrollment steps not found');
        }

        if ( ! enrollment.steps.find(step => step.stepNumber == 1 )?.isCompleted ) {
            throw new BadRequestException('Step 1 not completed yet');
        }

        return {
            firstName          : enrollment.firstName,
            lastName           : enrollment.lastName,

            dateOfBirth        : enrollment.dateOfBirth,
            cityOfBirth        : enrollment.cityOfBirth,
            municipalityOfBirth: enrollment.municipalityOfBirth,
            countryOfBirth     : enrollment.countryOfBirth,

            sex                : enrollment.sex,
            gender             : enrollment.gender,

            maritalStatus      : enrollment.maritalStatus,
            occupation         : enrollment.occupation,

            identity           : enrollment.identity,
            yucayeke           : enrollment.yucayeke,
            yucayekeUnknown    : enrollment.yucayekeUnknown,

            hasChildren        : enrollment.hasChildren,
            hasMinorChildren   : enrollment.hasMinorChildren,
        };
    }
}
