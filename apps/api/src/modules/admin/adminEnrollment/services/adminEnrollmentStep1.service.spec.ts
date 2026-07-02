import { Identity, MaritalStatus } from '@/generated/prisma/enums';
import { AdminEnrollmentStep1Service } from './adminEnrollmentStep1.service';

describe('AdminEnrollmentStep1Service.getStep1 (admin enrollment detail)', () => {
    const enrollmentId = 'enrollment-1';

    function buildEnrollment(overrides: Record<string, unknown> = {}) {
        return {
            id: enrollmentId,

            firstName: 'Anani',
            middleName: null,
            lastName: 'Guarocuya',
            maternalLastName: 'Higuamota',
            preferredName: 'Anani',

            dateOfBirth: new Date('1990-01-15'),
            cityOfBirth: 'Ponce',
            municipalityOfBirth: 'Ponce',
            countryOfBirth: 'Puerto Rico',

            gender: 'FEMALE',
            pronouns: 'she/her',

            maritalStatus: MaritalStatus.DOMESTIC_PARTNERSHIP,
            occupation: 'Teacher',
            educationLevel: 'Bachelors',
            languagesSpoken: ['Spanish', 'English'],
            specialSkills: 'Weaving',

            identity: Identity.TAINO,
            yucayeke: 'Guainía',
            yucayekeUnknown: false,
            hasChildren: true,
            hasMinorChildren: false,

            signatureName: 'Anani Guarocuya',
            signatureDate: new Date('2026-07-02'),
            agreedToTerms: true,

            contact: null,
            addresses: [],
            emergencyContact: null,
            steps: [{ stepNumber: 1, isCompleted: true }],

            ...overrides,
        };
    }

    function buildService(enrollment: Record<string, unknown> | null) {
        const database = {
            enrollment: {
                findFirst: jest.fn().mockResolvedValue(enrollment),
            },
        };

        const service = new AdminEnrollmentStep1Service(database as never);

        return { service, database };
    }

    it('includes the yucayeke info block (identity, yucayeke, children)', async () => {
        const { service } = buildService(buildEnrollment());

        const result = await service.getStep1(enrollmentId);

        expect(result.yucayekeInfo).toEqual({
            identity: Identity.TAINO,
            yucayeke: 'Guainía',
            yucayekeUnknown: false,
            hasChildren: true,
            hasMinorChildren: false,
        });
    });

    it('includes the confirmation e-signature block', async () => {
        const { service } = buildService(buildEnrollment());

        const result = await service.getStep1(enrollmentId);

        expect(result.signature).toEqual({
            signatureName: 'Anani Guarocuya',
            signatureDate: new Date('2026-07-02'),
            agreedToTerms: true,
        });
    });

    it('returns the DOMESTIC_PARTNERSHIP marital status in additional info', async () => {
        const { service } = buildService(buildEnrollment());

        const result = await service.getStep1(enrollmentId);

        expect(result.additionalInfo.maritalStatus).toBe(
            MaritalStatus.DOMESTIC_PARTNERSHIP,
        );
    });

    it('passes through null values for enrollments without the new fields', async () => {
        const { service } = buildService(
            buildEnrollment({
                identity: null,
                yucayeke: null,
                yucayekeUnknown: null,
                hasChildren: null,
                hasMinorChildren: null,
                signatureName: null,
                signatureDate: null,
                agreedToTerms: null,
            }),
        );

        const result = await service.getStep1(enrollmentId);

        expect(result.yucayekeInfo).toEqual({
            identity: null,
            yucayeke: null,
            yucayekeUnknown: null,
            hasChildren: null,
            hasMinorChildren: null,
        });
        expect(result.signature).toEqual({
            signatureName: null,
            signatureDate: null,
            agreedToTerms: null,
        });
    });

    it('throws when the enrollment does not exist', async () => {
        const { service } = buildService(null);

        await expect(service.getStep1(enrollmentId)).rejects.toThrow(
            'Enrollment not found',
        );
    });
});
