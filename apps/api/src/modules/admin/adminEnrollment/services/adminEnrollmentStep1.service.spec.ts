import { Identity, MaritalStatus, Sex } from '@/generated/prisma/enums';
import { AdminEnrollmentStep1Service } from './adminEnrollmentStep1.service';

describe('AdminEnrollmentStep1Service.getStep1 (admin enrollment detail)', () => {
    const enrollmentId = 'enrollment-1';

    function buildEnrollment(overrides: Record<string, unknown> = {}) {
        return {
            id: enrollmentId,

            firstName: 'Anani',
            lastName: 'Guarocuya',

            dateOfBirth: new Date('1990-01-15'),
            cityOfBirth: 'Ponce',
            municipalityOfBirth: 'Ponce',
            countryOfBirth: 'Puerto Rico',

            sex: Sex.FEMALE,
            gender: 'FEMALE',

            maritalStatus: MaritalStatus.DOMESTIC_PARTNERSHIP,
            occupation: 'Teacher',

            identity: Identity.TAINO,
            yucayeke: 'Guainía',
            yucayekeUnknown: false,
            hasChildren: true,
            hasMinorChildren: false,

            signatureName: 'Anani Guarocuya',
            signatureDate: new Date('2026-07-02'),
            agreedToTerms: true,

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

    it('includes the demographics block (including sex)', async () => {
        const { service } = buildService(buildEnrollment());

        const result = await service.getStep1(enrollmentId);

        expect(result.demographics.sex).toBe(Sex.FEMALE);
        expect(result.demographics.firstName).toBe('Anani');
        expect(result.demographics.maritalStatus).toBe(
            MaritalStatus.DOMESTIC_PARTNERSHIP,
        );
    });

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

    it('passes through null values for enrollments without the new fields', async () => {
        const { service } = buildService(
            buildEnrollment({
                sex: null,
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

        expect(result.demographics.sex).toBeNull();
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
