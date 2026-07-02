import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EnrollmentStatus } from '@/generated/prisma/enums';
import { EnrollmentService } from './enrollment.service';

describe('EnrollmentService.completeEnrollment (confirmation e-signature)', () => {
    const userId = 'user-1';
    const enrollmentId = 'enrollment-1';

    const signature = {
        signatureName: 'Anani Guarocuya',
        signatureDate: '2026-07-02',
        agreedToTerms: true,
    };

    function buildDraftEnrollment(overrides: Record<string, unknown> = {}) {
        return {
            id: enrollmentId,
            userId,
            status: EnrollmentStatus.DRAFT,
            steps: [
                { stepNumber: 1, isCompleted: true },
                { stepNumber: 2, isCompleted: true },
                { stepNumber: 3, isCompleted: true },
                { stepNumber: 4, isCompleted: true },
            ],
            consent: [
                { accepted: true, consent: { required: true } },
                { accepted: true, consent: { required: false } },
            ],
            ...overrides,
        };
    }

    function buildService(enrollment: Record<string, unknown> | null) {
        const database = {
            enrollment: {
                findFirst: jest.fn().mockResolvedValue(enrollment),
                update: jest.fn().mockResolvedValue({}),
            },
        };
        const documentService = {};
        const service = new EnrollmentService(
            database as never,
            documentService as never,
        );

        return { service, database };
    }

    it('persists the e-signature and sets the status to SUBMITTED', async () => {
        const { service, database } = buildService(buildDraftEnrollment());

        const result = await service.completeEnrollment(userId, signature);

        expect(result).toEqual({
            success: true,
            message: 'Enrollment completed successfully',
        });
        expect(database.enrollment.update).toHaveBeenCalledWith({
            where: { id: enrollmentId },
            data: {
                status: EnrollmentStatus.SUBMITTED,
                consentAccepted: true,
                signatureName: 'Anani Guarocuya',
                signatureDate: new Date('2026-07-02'),
                agreedToTerms: true,
            },
        });
    });

    it('trims the signature name before persisting it', async () => {
        const { service, database } = buildService(buildDraftEnrollment());

        await service.completeEnrollment(userId, {
            ...signature,
            signatureName: '  Anani Guarocuya  ',
        });

        expect(database.enrollment.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    signatureName: 'Anani Guarocuya',
                }),
            }),
        );
    });

    it('throws when the enrollment does not exist', async () => {
        const { service } = buildService(null);

        await expect(
            service.completeEnrollment(userId, signature),
        ).rejects.toThrow(NotFoundException);
    });

    it('throws when the enrollment is not in DRAFT status', async () => {
        const { service, database } = buildService(
            buildDraftEnrollment({ status: EnrollmentStatus.SUBMITTED }),
        );

        await expect(
            service.completeEnrollment(userId, signature),
        ).rejects.toThrow('Only enrollments in DRAFT status can be completed');
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });

    it('throws when a required consent is not accepted', async () => {
        const { service, database } = buildService(
            buildDraftEnrollment({
                consent: [{ accepted: false, consent: { required: true } }],
            }),
        );

        await expect(
            service.completeEnrollment(userId, signature),
        ).rejects.toThrow(
            'All required consents must be accepted to complete enrollment',
        );
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });

    it('throws when not every enrollment step is completed', async () => {
        const { service, database } = buildService(
            buildDraftEnrollment({
                steps: [
                    { stepNumber: 1, isCompleted: true },
                    { stepNumber: 2, isCompleted: true },
                    { stepNumber: 3, isCompleted: true },
                    { stepNumber: 4, isCompleted: false },
                ],
            }),
        );

        await expect(
            service.completeEnrollment(userId, signature),
        ).rejects.toThrow(
            'All enrollment steps must be completed to complete enrollment',
        );
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });

    it('throws when the terms of service are not agreed to', async () => {
        const { service, database } = buildService(buildDraftEnrollment());

        await expect(
            service.completeEnrollment(userId, {
                ...signature,
                agreedToTerms: false,
            }),
        ).rejects.toThrow(BadRequestException);
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });

    it('throws when the signature name is empty', async () => {
        const { service, database } = buildService(buildDraftEnrollment());

        await expect(
            service.completeEnrollment(userId, {
                ...signature,
                signatureName: '   ',
            }),
        ).rejects.toThrow(
            'A signature name is required to complete enrollment',
        );
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });

    it('throws when the signature date is invalid', async () => {
        const { service, database } = buildService(buildDraftEnrollment());

        await expect(
            service.completeEnrollment(userId, {
                ...signature,
                signatureDate: 'not-a-date',
            }),
        ).rejects.toThrow(
            'A valid signature date is required to complete enrollment',
        );
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });
});
