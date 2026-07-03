import { DatabaseService } from '@/database/database.service';
import { EnrollmentStatus } from '@/generated/prisma/client';
import { AncestryRelation } from '@/generated/prisma/enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EnrollmentStepService } from '@/modules/enrollment/common/services/enrollmentStep.service';
import { mapAncestryOut, upsertAncestry } from '@/modules/enrollment/common/utils/ancestry.util';
import { Step3, Step3SaveDraft } from './interfaces/step3.interface';

@Injectable()
export class Step3Service {
    constructor(
        private readonly database: DatabaseService,
        private readonly enrollmentStepService: EnrollmentStepService,
    ) { }

    /**
     * upsert: Persists the Step 3 (Paternal Kinship) data as three Ancestry rows
     * (FATHER, PATERNAL_GRANDMOTHER, PATERNAL_GRANDFATHER).
     */
    public async upsert(userId: string, step3Input: Step3) {

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

            await upsertAncestry(tx, enrollment.id, AncestryRelation.FATHER, step3Input.father);
            await upsertAncestry(tx, enrollment.id, AncestryRelation.PATERNAL_GRANDMOTHER, step3Input.paternalGrandmother);
            await upsertAncestry(tx, enrollment.id, AncestryRelation.PATERNAL_GRANDFATHER, step3Input.paternalGrandfather);

            await this.enrollmentStepService.markStepComplete(tx, enrollment.id, 3);

            return {
                success: true,
            };
        });
    }

    /**
     * saveDraft: Persists a PARTIAL Step 3 (Paternal Kinship) draft — only
     * the ancestors present in the payload are upserted and the step is NOT
     * marked complete ("Save & finish later").
     */
    public async saveDraft(userId: string, draftInput: Step3SaveDraft) {

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

            if (draftInput.father !== undefined) {
                await upsertAncestry(tx, enrollment.id, AncestryRelation.FATHER, draftInput.father);
            }
            if (draftInput.paternalGrandmother !== undefined) {
                await upsertAncestry(tx, enrollment.id, AncestryRelation.PATERNAL_GRANDMOTHER, draftInput.paternalGrandmother);
            }
            if (draftInput.paternalGrandfather !== undefined) {
                await upsertAncestry(tx, enrollment.id, AncestryRelation.PATERNAL_GRANDFATHER, draftInput.paternalGrandfather);
            }

            // NOTE: markStepComplete is intentionally NOT called — a draft
            // save must never advance the enrollment.steps completion map.
            return {
                success: true,
            };
        });
    }

    /**
     * getPaternalKinship: prefill — returns the three paternal Ancestry rows.
     */
    public async getPaternalKinship(userId: string) {

        const enrollment = await this.database.enrollment.findFirst({
            where: { userId },
        });

        if (!enrollment) {
            throw new BadRequestException('Enrollment not found');
        }

        // NOTE: intentionally NOT gated on step completion — partial drafts
        // ("Save & finish later") must prefill when the member returns. The
        // completion map (enrollment.steps) is read independently elsewhere.
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
