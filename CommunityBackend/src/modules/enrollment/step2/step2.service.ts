import { DatabaseService } from '@/database/database.service';
import { EnrollmentStatus, Prisma } from '@/generated/prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EnrollmentStepService } from '@/modules/enrollment/common/services/enrollmentStep.service';
import { Step2 } from './interfaces/step2.interface';

@Injectable()
export class Step2Service {
    constructor(
        private readonly database: DatabaseService,
        private readonly enrollmentStepService: EnrollmentStepService,

    ) { }

    /**
     * upsert: Upserts the Step 2 data into the database for the user's enrollment.
     */
    public async upsert(userId: string, step2Input: Step2) {


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

            /**
             * Start syncing the step2 fields
             */
            await this.syncMaternalLineages(tx, enrollment.id, step2Input.maternalLineages);

            /**
             * Update the step number
             */
            await this.enrollmentStepService.markStepComplete(tx, enrollment.id, 2);

            // Return updated enrollment
            return {
                success: true,
            };
        });
    }

    /**
     * Helper methods to sync maternal lineages data 
     */
    private async syncMaternalLineages(tx: Prisma.TransactionClient, enrollmentId: string, maternalLineages: Step2['maternalLineages']) {

        // Fetch existing maternal lineage entries for the enrollment
        const existing = await tx.maternalLineage.findMany({
            where: { enrollmentId },
            select: { id: true },
        });

        // Create sets of existing and incoming IDs for easy comparison
        const existingIds = new Set(existing.map(e => e.id));
        const incomingIds = new Set(
            maternalLineages.filter(i => i.id).map(i => i.id!)
        );

        // Delete removed records
        const toDelete = [...existingIds].filter(id => !incomingIds.has(id));

        if (toDelete.length > 0) {
            await tx.maternalLineage.deleteMany({
                where: { id: { in: toDelete } },
            });
        }

        // Upsert (update or create) incoming records
        for (const item of maternalLineages) {
            const data = this.mapMaternalLineage(item);

            if (item.id) {
                // update existing
                await tx.maternalLineage.update({
                    where: { id: item.id },
                    data,
                });
            } else {
                // create new
                await tx.maternalLineage.create({
                    data: {
                        enrollmentId,
                        ...data,
                    },
                });
            }
        }

    }

    /**
     * Map input for creating the meternal lineage
     */
    private mapMaternalLineage(item: Step2['maternalLineages'][0]) {

        return {
            relation: item.relation,
            fullName: item.fullName,
            maidenName: item.maidenName,
            dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : null,
            placeOfBirth: item.placeOfBirth,
            livingStatus: item.livingStatus,
            approximateBirthYear: item.approximateBirthYear,
            regionOfOrigin: item.regionOfOrigin,
            familyOccupation: item.familyOccupation,
            additionalNotes: item.additionalNotes,
        };
    }

    /**
     * Delete a meternal lineage by using the id
     */
    public async deleteMaternalLineage(userId: string, id: string) {

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

            // Delete the maternal lineage entry
            await tx.maternalLineage.deleteMany({
                where: {
                    id,
                    enrollmentId: enrollment.id,
                },
            });

            return {
                success: true,
            };
        });
    }

    /**
     * Get formated meternal lineages
     */
    public async getMaternalLineages(userId: string) {

        // Find enrollment
        const enrollment = await this.database.enrollment.findFirst({
            where: { userId },
            include: { steps: true }
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

        // Fetch maternal lineages
        const maternalLineages = await this.database.maternalLineage.findMany({
            where: { enrollmentId: enrollment.id },
        });

        return maternalLineages.map(item => ({
            id                  : item.id,
            relation            : item.relation,
            fullName            : item.fullName,
            maidenName          : item.maidenName,
            dateOfBirth         : item.dateOfBirth,
            placeOfBirth        : item.placeOfBirth,
            livingStatus        : item.livingStatus,
            approximateBirthYear: item.approximateBirthYear,
            regionOfOrigin      : item.regionOfOrigin,
            familyOccupation    : item.familyOccupation,
            additionalNotes     : item.additionalNotes,
        }))
    }
}
