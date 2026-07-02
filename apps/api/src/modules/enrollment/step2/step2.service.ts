import { DatabaseService } from '@/database/database.service';
import { EnrollmentStatus } from '@/generated/prisma/client';
import { AncestryRelation } from '@/generated/prisma/enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EnrollmentStepService } from '@/modules/enrollment/common/services/enrollmentStep.service';
import { mapAncestryOut, upsertAncestry } from '@/modules/enrollment/common/utils/ancestry.util';
import { Step2 } from './interfaces/step2.interface';

@Injectable()
export class Step2Service {
    constructor(
        private readonly database: DatabaseService,
        private readonly enrollmentStepService: EnrollmentStepService,
    ) { }

    /**
     * upsert: Persists the Step 2 (Maternal Kinship) data as three Ancestry rows
     * (MOTHER, MATERNAL_GRANDMOTHER, MATERNAL_GRANDFATHER).
     */
    public async upsert(userId: string, step2Input: Step2) {

        return await this.database.$transaction(async (tx) => {

            const enrollment = await tx.enrollment.findFirst({
                where: { userId },
            });

            if (!enrollment) {
                throw new BadRequestException('Enrollment not started');
            }

            if (enrollment.status !== EnrollmentStatus.DRAFT) {
                throw new BadRequestException('Enrollment is not in draft status');
            }

            await upsertAncestry(tx, enrollment.id, AncestryRelation.MOTHER, step2Input.mother);
            await upsertAncestry(tx, enrollment.id, AncestryRelation.MATERNAL_GRANDMOTHER, step2Input.maternalGrandmother);
            await upsertAncestry(tx, enrollment.id, AncestryRelation.MATERNAL_GRANDFATHER, step2Input.maternalGrandfather);

            await this.enrollmentStepService.markStepComplete(tx, enrollment.id, 2);

            return {
                success: true,
            };
        });
    }

    /**
     * getMaternalKinship: prefill — returns the three maternal Ancestry rows.
     */
    public async getMaternalKinship(userId: string) {

        const enrollment = await this.database.enrollment.findFirst({
            where: { userId },
            include: { steps: true },
        });

        if (!enrollment) {
            throw new BadRequestException('Enrollment not found');
        }

        if (enrollment.steps.length === 0) {
            throw new BadRequestException('Enrollment steps not found');
        }

        if (!enrollment.steps.find(step => step.stepNumber == 2)?.isCompleted) {
            throw new BadRequestException('Step 2 not completed yet');
        }

        const rows = await this.database.ancestry.findMany({
            where: {
                enrollmentId: enrollment.id,
                relation: {
                    in: [
                        AncestryRelation.MOTHER,
                        AncestryRelation.MATERNAL_GRANDMOTHER,
                        AncestryRelation.MATERNAL_GRANDFATHER,
                    ],
                },
            },
        });

        const byRelation = (relation: AncestryRelation) =>
            mapAncestryOut(rows.find(r => r.relation === relation));

        return {
            mother             : byRelation(AncestryRelation.MOTHER),
            maternalGrandmother: byRelation(AncestryRelation.MATERNAL_GRANDMOTHER),
            maternalGrandfather: byRelation(AncestryRelation.MATERNAL_GRANDFATHER),
        };
    }
}
