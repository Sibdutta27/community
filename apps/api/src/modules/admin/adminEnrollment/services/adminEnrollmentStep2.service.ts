import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { AncestryRelation } from '@/generated/prisma/enums';
import { mapAncestryOut } from '@/modules/enrollment/common/utils/ancestry.util';

@Injectable()
export class AdminEnrollmentStep2Service {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    /**
     * Get the maternal kinship (Step 2) — mother + maternal grandparents.
     */
    public async getStep2(enrollmentId: string) {

        const enrollment = await this.database.enrollment.findFirst({
            where: { id: enrollmentId },
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
