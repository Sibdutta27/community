import { DatabaseService } from '@/database/database.service';
import { Address, Consent, Contact, CulturalConnection, Document, EmergencyContact, Enrollment, EnrollmentStep, MaternalLineage, User } from '@/generated/prisma/client';
import { EnrollmentStatus, LivingStatus } from '@/generated/prisma/enums';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentService } from '../document/document.service';

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
                user            : true,
                contact         : true,
                addresses       : true,
                emergencyContact: true,

                maternalLineages: true,

                culturalConnections: {
                    include: {
                        CulturalConnection: true,
                    },
                },

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
        user               : User,
        contact            : Contact | null,
        addresses          : Address[],
        emergencyContact   : EmergencyContact | null,
        maternalLineages   : MaternalLineage[],
        culturalConnections: { CulturalConnection: CulturalConnection }[],
        consent            : { consent: Consent, accepted: boolean, acceptedAt: Date | null }[],
        steps              : EnrollmentStep[],
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

        const allRequiredAccepted = consentSummary
            .filter(c => c.required)
            .every(c => c.accepted);

        // -----------------------------
        // MATERNAL LINEAGE SUMMARY
        // -----------------------------
        const maternalLineageSummary = enrollment.maternalLineages.map((ml) => ({
            id                  : ml.id,
            fullName            : ml.fullName,
            maidenName          : ml?.maidenName || null,
            dateOfBirth         : ml.dateOfBirth,
            placeOfBirth        : ml.placeOfBirth,
            LivingStatus        : ml.livingStatus,
            approximateBirthYear: ml.approximateBirthYear,
            regionOfOrigin      : ml.regionOfOrigin,
            familyOccupation    : ml.familyOccupation,
            additionalNotes     : ml.additionalNotes,
            relation            : ml.relation,
        }));

        // -----------------------------
        // CULTURAL CONNECTION SUMMARY
        // -----------------------------
        const culturalConnectionSummary = enrollment.culturalConnections.map((cc) => ({
            id         : cc.CulturalConnection.id,
            key        : cc.CulturalConnection.key,
            description: cc.CulturalConnection.description,
        }));

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
                firstName       : enrollment.firstName,
                middleName      : enrollment.middleName,
                lastName        : enrollment.lastName,
                preferredName   : enrollment.preferredName,
                maternalLastName: enrollment.maternalLastName,

                dateOfBirth        : enrollment.dateOfBirth,
                cityOfBirth        : enrollment.cityOfBirth,
                municipalityOfBirth: enrollment.municipalityOfBirth,
                countryOfBirth     : enrollment.countryOfBirth,

                gender  : enrollment.gender,
                pronouns: enrollment.pronouns,

                maritalStatus  : enrollment.maritalStatus,
                occupation     : enrollment.occupation,
                educationLevel : enrollment.educationLevel,
                languagesSpoken: enrollment.languagesSpoken,
                specialSkills  : enrollment.specialSkills,
            },

            contact            : enrollment.contact,
            addresses          : enrollment.addresses,
            emergencyContact   : enrollment.emergencyContact,
            maternalLineages   : maternalLineageSummary,
            culturalConnections: culturalConnectionSummary,
            consent            : consentSummary,
            documents          : documentsMap,
            steps              : stepsMap,
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
     * Complete the enrollment by setting the status to COMPLETED. This should only be allowed if all required consents are accepted.
     */
    public async completeEnrollment(userId: string) {
        const enrollment = await this.database.enrollment.findFirst({
            where: { userId },
            include: {
                steps  : true,
                consent: {
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

        // Check all steps are complete
        const allStepsCompleted = enrollment.steps.every(step => step.isCompleted);

        if (!allStepsCompleted) {
            throw new BadRequestException('All enrollment steps must be completed to complete enrollment');
        }

        // Update enrollment status to COMPLETED
        await this.database.enrollment.update({
            where: { id: enrollment.id },
            data: { status: EnrollmentStatus.SUBMITTED, consentAccepted: true },
        });

        return { success: true, message: 'Enrollment completed successfully' };
    }
}
