import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { AncestryRelation } from '@/generated/prisma/enums';
import { mapAncestryOut } from '@/modules/enrollment/common/utils/ancestry.util';

@Injectable()
export class AdminEnrollmentStep3Service {

    constructor(
        private readonly database: DatabaseService,
    ) { }

    /**
     * Get the paternal kinship (Step 3) — father + paternal grandparents.
     */
    public async getStep3(enrollmentId: string) {

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

        if (!enrollment.steps.find(step => step.stepNumber == 3)?.isCompleted) {
            throw new BadRequestException('Step 3 not completed yet');
        }

        const rows = await this.database.ancestry.findMany({
            where: {
                enrollmentId: enrollment.id,
                relation: {
                    in: [
                        AncestryRelation.FATHER,
                        AncestryRelation.PATERNAL_GRANDMOTHER,
                        AncestryRelation.PATERNAL_GRANDFATHER,
                    ],
                },
            },
        });

        const byRelation = (relation: AncestryRelation) =>
            mapAncestryOut(rows.find(r => r.relation === relation));

        return {
            father             : byRelation(AncestryRelation.FATHER),
            paternalGrandmother: byRelation(AncestryRelation.PATERNAL_GRANDMOTHER),
            paternalGrandfather: byRelation(AncestryRelation.PATERNAL_GRANDFATHER),
        };
    }
}
