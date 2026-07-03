import { DatabaseService } from '@/database/database.service';
import { EnrollmentStatus } from '@/generated/prisma/client';
import { AncestryRelation } from '@/generated/prisma/enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EnrollmentStepService } from '@/modules/enrollment/common/services/enrollmentStep.service';
import { mapAncestryOut, upsertAncestry } from '@/modules/enrollment/common/utils/ancestry.util';
import { Step2, Step2SaveDraft } from './interfaces/step2.interface';

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
     * saveDraft: Persists a PARTIAL Step 2 (Maternal Kinship) draft — only
     * the ancestors present in the payload are upserted and the step is NOT
     * marked complete ("Save & finish later").
     */
    public async saveDraft(userId: string, draftInput: Step2SaveDraft) {

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

            if (draftInput.mother !== undefined) {
                await upsertAncestry(tx, enrollment.id, AncestryRelation.MOTHER, draftInput.mother);
            }
            if (draftInput.maternalGrandmother !== undefined) {
                await upsertAncestry(tx, enrollment.id, AncestryRelation.MATERNAL_GRANDMOTHER, draftInput.maternalGrandmother);
            }
            if (draftInput.maternalGrandfather !== undefined) {
                await upsertAncestry(tx, enrollment.id, AncestryRelation.MATERNAL_GRANDFATHER, draftInput.maternalGrandfather);
            }

            // NOTE: markStepComplete is intentionally NOT called — a draft
            // save must never advance the enrollment.steps completion map.
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
