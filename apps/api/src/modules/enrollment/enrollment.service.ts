import { DatabaseService } from '@/database/database.service';
import { Ancestry, Consent, Contact, Enrollment, EnrollmentStep, User } from '@/generated/prisma/client';
import { EnrollmentStatus } from '@/generated/prisma/enums';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { mapAncestryOut } from './common/utils/ancestry.util';
import { getMissingIdentityDocumentError, REQUIRED_DOCUMENT_TYPES } from './step4/step4.utils';
import { DocumentService } from '../document/document.service';

// The backend tracks enrollment steps 1-4 (created in startEnrollment); the
// confirmation "step 5" is the completeEnrollment call itself.
const REQUIRED_ENROLLMENT_STEP_NUMBERS = [1, 2, 3, 4] as const;

@Injectable()
export class EnrollmentService {
    constructor(
        private readonly database       : DatabaseService,
        private readonly documentService: DocumentService,
    ) { }

    /**
     * startEnrollment: Creates a new enrollment for the user if one doesn't exist,
     * or returns the existing one if it's in DRAFT status.
     * If an enrollment already exists and is not in DRAFT status, it throws an error.
     */
    public async startEnrollment(userId: string) {

        // Check if user is already enrolled
        const existingEnrollment = await this.database.enrollment.findFirst({
            where: { userId },
            include: { steps: true },
        });

        // Return existing enrollment if it exists and is in DRAFT status, otherwise throw error
        if (existingEnrollment) {

            if (existingEnrollment.status === EnrollmentStatus.DRAFT ) {
                return this.minimalEnrollmentData(existingEnrollment);
            }

            // Update the existing enrollment to DRAFT status if it's not already in DRAFT status
            await this.database.enrollment.update({
                where: { id: existingEnrollment.id },
                data : { status: EnrollmentStatus.DRAFT },
            });

            return this.minimalEnrollmentData(existingEnrollment);
        }

        // Create new empty enrollment
        const enrollment = await this.database.enrollment.create({
            data: {
                userId,
                status: EnrollmentStatus.DRAFT,
                steps: {
                    create: [
                        { stepNumber: 1 },
                        { stepNumber: 2 },
                        { stepNumber: 3 },
                        { stepNumber: 4 },
                    ],
                },
            },
            include: {
                steps: true,
            },
        });

        return this.minimalEnrollmentData(enrollment)
    }

    /**
     * Helper method to return only the necessary enrollment data for the frontend, including step completion status 
     */
    private minimalEnrollmentData(enrollment: Enrollment & { steps: EnrollmentStep[] }) {
        return {
            enrollment: {
                id: enrollment.id,
                userId: enrollment.userId,
                status: enrollment.status,
                createdAt: enrollment.createdAt,
                updatedAt: enrollment.updatedAt,
            },
            steps: enrollment.steps.map(step => ({
                stepNumber: step.stepNumber,
                completed: step.isCompleted,
            })),
        }
    }

    /**
     * Helper method to get enrollment by userId
     */
    public async getMinimalEnrollmentByUserId(userId: string, steps: boolean = false) {
        const enrollment = await this.database.enrollment.findFirst({
            where: { userId },
            include: { steps: true },
        });

        if (!enrollment) {
            return null;
        }

        if ( steps ) {
            return this.minimalEnrollmentData(enrollment);
        }

        return this.minimalEnrollmentData(enrollment).enrollment;
    }

    /**
     * Helper method to get enrollment by id
     */
    public async getMinimalEnrollmentById(enrollmentId: string, steps: boolean = false) {
        const enrollment = await this.database.enrollment.findUnique({
            where: { id: enrollmentId },
            include: { steps: true },
        });

        if (!enrollment) {
            return null;
        }

        if ( steps ) {
            return this.minimalEnrollmentData(enrollment);
        }

        return this.minimalEnrollmentData(enrollment).enrollment;


    }

    /**
     * Helper function to get extended enrollment by userId
     */
    public async getExtendedEnrollmentByUserId(userId: string) {

        // Get the enrollment with all related data
        const enrollment = await this.database.enrollment.findUnique({
            where: { userId },
            include: {
                user    : true,
                contact : true,
                ancestry: true,

                consent: {
                    include: {
                        consent: true,
                    },
                },

                steps: true,
            },
        });

        if ( !enrollment ) {
            return null;
        }

        return this.ExtendedEnrollmentData(enrollment);
    }

    /**
     * Preaper extended enrollment data
     */
    private async ExtendedEnrollmentData(enrollment: Enrollment & {
        user    : User,
        contact : Contact | null,
        ancestry: Ancestry[],
        consent : { consent: Consent, accepted: boolean, acceptedAt: Date | null }[],
        steps   : EnrollmentStep[],
    }) {

        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        // -----------------------------
        // Document MAP
        // -----------------------------
        const documentsMap = await this.documentService.getAllEnrollmentDocumentList(enrollment.id);

        // -----------------------------
        // STEP STATUS MAP
        // -----------------------------
        const stepsMap = enrollment.steps.reduce((acc, step) => {
            acc[step.stepNumber] = step.isCompleted;
            return acc;
        }, {} as Record<number, boolean>);

        // -----------------------------
        // CONSENT SUMMARY
        // -----------------------------
        const consentSummary = enrollment.consent.map((c) => ({
            id        : c.consent.id,
            key       : c.consent.key,
            version   : c.consent.version,
            title     : c.consent.title,
            accepted  : c.accepted,
            acceptedAt: c.acceptedAt,
            required  : c.consent.required,
        }));

        // -----------------------------
        // ANCESTRY (KINSHIP) SUMMARY — keyed by relation
        // -----------------------------
        const ancestrySummary = enrollment.ancestry.reduce((acc, row) => {
            acc[row.relation] = mapAncestryOut(row);
            return acc;
        }, {} as Record<string, ReturnType<typeof mapAncestryOut>>);

        // -----------------------------
        // FINAL RESPONSE (CLEAN SHAPE)
        // -----------------------------
        return {
            id             : enrollment.id,
            status         : enrollment.status,
            consentAccepted: enrollment.consentAccepted,
            approvalDate   : enrollment.approvalDate,

            user: {
                id   : enrollment.user.id,
                email: enrollment.user.email,
                name : enrollment.user.name,
                role : enrollment.user.role,
            },

            personalInfo: {
                firstName: enrollment.firstName,
                lastName : enrollment.lastName,

                dateOfBirth        : enrollment.dateOfBirth,
                cityOfBirth        : enrollment.cityOfBirth,
                municipalityOfBirth: enrollment.municipalityOfBirth,
                countryOfBirth     : enrollment.countryOfBirth,

                sex               : enrollment.sex,
                gender            : enrollment.gender,
                genderSelfDescribe: enrollment.genderSelfDescribe,

                maritalStatus: enrollment.maritalStatus,
                occupation   : enrollment.occupation,

                identity        : enrollment.identity,
                yucayeke        : enrollment.yucayeke,
                yucayekeUnknown : enrollment.yucayekeUnknown,
                hasChildren     : enrollment.hasChildren,
                hasMinorChildren: enrollment.hasMinorChildren,
            },

            contact  : enrollment.contact,
            ancestry : ancestrySummary,
            consent  : consentSummary,
            documents: documentsMap,
            steps    : stepsMap,
        }
    }

    /**
     * Update the enrollment fields by enrollment id.
     */
    public async updateEnrollment(enrollmentId: string, data: Partial<Enrollment>) {
        return this.database.enrollment.update({
            where: {
                id: enrollmentId,
            },
            data: {
                ...data,
            }
        });
    }

    /**
     * Complete the enrollment: persists the confirmation e-signature
     * (signatureName / signatureDate) and sets the status to SUBMITTED.
     * This is only allowed if all required consents are accepted and every step is completed.
     *
     * Consent is asked ONCE, at the start of the flow. `agreedToTerms` is therefore
     * DERIVED here rather than re-collected at step 5: a valid e-signature over an
     * enrollment whose required consents (including the seeded `accuracy_declaration`
     * and `data_privacy_agreement`) are all accepted IS the terms attestation. The
     * caller-supplied `agreedToTerms` is accepted for deploy-skew compatibility and
     * deliberately ignored.
     */
    public async completeEnrollment(
        userId   : string,
        signature: { signatureName: string; signatureDate: string; agreedToTerms?: boolean },
    ) {
        const enrollment = await this.database.enrollment.findFirst({
            where: { userId },
            include: {
                steps    : true,
                documents: true,
                consent  : {
                    include: {
                        consent: true,
                    },
                },
            },
        });

        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        if ( enrollment.status !== EnrollmentStatus.DRAFT ) {
            throw new BadRequestException('Only enrollments in DRAFT status can be completed');
        }

        // Check if all required consents are accepted
        const allRequiredAccepted = enrollment?.consent
            .filter(c => c.consent.required)
            .every(c => c.accepted);

        if (!allRequiredAccepted) {
            throw new BadRequestException('All required consents must be accepted to complete enrollment');
        }

        // Check all steps are complete. `Array.every` is vacuously true for an
        // empty array, so require every expected step record to be present AND
        // completed — an enrollment with missing step rows must not submit.
        const allStepsCompleted = REQUIRED_ENROLLMENT_STEP_NUMBERS.every(stepNumber =>
            enrollment.steps.some(step => step.stepNumber === stepNumber && step.isCompleted),
        );

        if (!allStepsCompleted) {
            throw new BadRequestException('All enrollment steps must be completed to complete enrollment');
        }

        // Re-validate documents at submit time — step 4 may have passed before
        // a document was deleted, so completion re-checks the same rules.
        const hasAllRequiredDocs = REQUIRED_DOCUMENT_TYPES.every(requiredType =>
            enrollment.documents.some(doc => doc.type === requiredType),
        );

        if (!hasAllRequiredDocs) {
            throw new BadRequestException('missing_required_documents');
        }

        // A government ID is mandatory on top of the 2-distinct-types minimum,
        // so the specific code tells the member which rule they tripped.
        const missingIdentityDocumentError = getMissingIdentityDocumentError(enrollment.documents);

        if (missingIdentityDocumentError) {
            throw new BadRequestException(missingIdentityDocumentError);
        }

        // Require the confirmation e-signature
        const signatureName = signature.signatureName?.trim();

        if (!signatureName) {
            throw new BadRequestException('A signature name is required to complete enrollment');
        }

        const signatureDate = new Date(signature.signatureDate);

        if (Number.isNaN(signatureDate.getTime())) {
            throw new BadRequestException('A valid signature date is required to complete enrollment');
        }

        // Persist the e-signature and update enrollment status to SUBMITTED.
        //
        // `agreedToTerms: true` is DERIVED, not echoed back from the client: we only
        // reach this line once every required consent is accepted (checked above) AND
        // the member has signed with a valid name and date. That combination is the
        // terms-of-service attestation, and this row remains the platform's only
        // stored ToS record — sign-up never persists one.
        //
        // `consentAccepted` is deliberately NOT written here. `/enrollment/complete`
        // sits behind `ConsentAcceptedGuard`, which 403s unless the flag is already
        // true, and nothing in this method can clear it — so the write could only
        // ever be a no-op restating what the guard proved.
        await this.database.enrollment.update({
            where: { id: enrollment.id },
            data: {
                status       : EnrollmentStatus.SUBMITTED,
                signatureName,
                signatureDate,
                agreedToTerms: true,
            },
        });

        return { success: true, message: 'Enrollment completed successfully' };
    }
}
