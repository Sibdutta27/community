import { DatabaseService } from '@/database/database.service';
import { EnrollmentStatus, Prisma } from '@/generated/prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EnrollmentStepService } from '@/modules/enrollment/common/services/enrollmentStep.service';
// import { Step2 } from './interfaces/step2.interface';

@Injectable()
export class Step3Service {
    constructor(
        private readonly database: DatabaseService,
        private readonly enrollmentStepService: EnrollmentStepService,

    ) { }

    /**
     * get the cultural connection list to show
     */
    public async getCulturalConnectionList() {

        const culturalConnections = await this.database.culturalConnection.findMany({
            where: {
                active: true
            }
        });

        return culturalConnections.map(connection => ({
            key: connection.key,
            description: connection.description,
        }));
    }

    /**
     * upsert: Upserts the Step 3 data into the database for the user's enrollment.
     */
    public async upsert(userId: string, step3Input: { culturalConnectionKeys: string[] }) {


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
             * Start syncing the step3 fields
             */
            await this.syncCulturalConnections(tx, enrollment.id, step3Input.culturalConnectionKeys);

            /**
             * Update the step number
             */
            await this.enrollmentStepService.markStepComplete(tx, enrollment.id, 3);

            // Return updated enrollment
            return {
                success: true,
            };
        });
    }

    /**
     * Helper methods to sync cultural connections data 
     */
    private async syncCulturalConnections(tx: Prisma.TransactionClient, enrollmentId: string, keys: string[]) {

        // Normalize keys to lowercase and remove duplicates
        const normalizedKeys = [...new Set(keys.map(k => k.toLowerCase()))];


        // Fetch valid cultural connections
        const connections = await tx.culturalConnection.findMany({
            where: {
                key: { in: normalizedKeys },
                active: true,
            },
            select: { id: true, key: true },
        });

        // Validate keys
        const foundKeys = connections.map(c => c.key);
        const missingKeys = normalizedKeys.filter(k => !foundKeys.includes(k));

        if (missingKeys.length > 0) {
            throw new BadRequestException(
                `Invalid cultural connection keys: ${missingKeys.join(', ')}`,
            );
        }

        const newIds = connections.map(c => c.id);

        // Get existing mappings
        const existingMappings =
            await tx.enrollmentCulturalConnection.findMany({
                where: { enrollmentId },
                select: { culturalConnectionId: true },
            });

        const existingIds = existingMappings.map(e => e.culturalConnectionId);


        // Compute diff
        const toAdd = newIds.filter(id => !existingIds.includes(id));
        const toRemove = existingIds.filter(id => !newIds.includes(id));

        // Remove the diff
        if (toRemove.length > 0) {
            await tx.enrollmentCulturalConnection.deleteMany({
                where: {
                    enrollmentId,
                    culturalConnectionId: { in: toRemove },
                },
            });
        }

        // Add the diff
        if (toAdd.length > 0) {
            const createData = toAdd.map(culturalConnectionId => ({
                enrollmentId,
                culturalConnectionId,
            }));
            await tx.enrollmentCulturalConnection.createMany({
                data: createData,
            });
        }

        return {
            added: toAdd.length,
            removed: toRemove.length,
            total: newIds.length,
        }

    }

    /**
     * Get all selected cultural connections
     */
    public async getSelectedCulturalConnections(
        userId: string
    ): Promise<{ culturalConnectionKeys: string[] }> {

        const enrollment = await this.database.enrollment.findFirst({
            where: { userId },
            select: {
                id                 : true,
                steps              : true,
                culturalConnections: {
                    select: {
                        CulturalConnection: {
                            select: {
                                key: true,
                            },
                        },
                    },
                },
            },
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

        return {
            culturalConnectionKeys: enrollment.culturalConnections.map(
                item => item.CulturalConnection.key
            ),
        };
    }
}
