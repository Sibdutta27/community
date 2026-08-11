import { DatabaseService } from '@/database/database.service';
import { Document, EnrollmentStatus, Prisma } from '@/generated/prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EnrollmentStepService } from '@/modules/enrollment/common/services/enrollmentStep.service';
import { isArray } from 'class-validator';
import { getMissingIdentityDocumentError, REQUIRED_DOCUMENT_TYPES } from './step4.utils';

@Injectable()
export class Step4Service {
    constructor(
        private readonly database: DatabaseService,
        private readonly enrollmentStepService: EnrollmentStepService,

    ) { }

    /**
     * complete: Complete the Step 4 user's enrollment.
     */
    public async complete(userId: string): Promise<{ success: boolean, error ?: string }> {


        return await this.database.$transaction(async (tx) => {

            // Find enrollment
            const enrollment = await tx.enrollment.findFirst({
                where: { userId },
                include: { documents: true }
            });

            // Validate enrollment exists
            if (!enrollment) {
                throw new BadRequestException('Enrollment not started');
            }

            // Validate enrollment is in DRAFT status
            if (enrollment.status !== EnrollmentStatus.DRAFT) {
                throw new BadRequestException('Enrollment is not in draft status');
            }

            // Validate all documents
            const validationResult = await this.validateDocuments(enrollment.documents);

            if ( ! validationResult.success ) {
                return validationResult;
            }

            /**
             * Update the step number
             */
            await this.enrollmentStepService.markStepComplete(tx, enrollment.id, 4);

            // Return updated enrollment
            return {
                success: true,
            };
        });
    }

    /**
     * Validate all required documents
     */
    public async validateDocuments(documents: Document[]) {
        if (!documents) {
            return {
                success: false,
                error: 'missing_required_documents'
            }
        }

        if (!isArray(documents) || documents.length === 0) {
            return {
                success: false,
                error: 'missing_required_documents'
            }
        }

        const hasAllRequiredDocs = REQUIRED_DOCUMENT_TYPES.every(requiredType =>
            documents.some(doc => doc.type === requiredType)
        );

        if (!hasAllRequiredDocs) {
            return {
                success: false,
                error: 'missing_required_documents'
            };
        }

        // Proof of identity: a state ID is mandatory, plus at least 2 distinct
        // types of the three (state ID / birth certificate / social security).
        const missingIdentityDocumentError = getMissingIdentityDocumentError(documents);

        if (missingIdentityDocumentError) {
            return {
                success: false,
                error: missingIdentityDocumentError
            };
        }

        return {
            success: true
        };
    }
}
