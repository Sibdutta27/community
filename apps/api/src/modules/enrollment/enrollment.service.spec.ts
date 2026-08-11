import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentType, EnrollmentStatus } from '@/generated/prisma/enums';
import { EnrollmentService } from './enrollment.service';

describe('EnrollmentService.completeEnrollment (confirmation e-signature)', () => {
    const userId = 'user-1';
    const enrollmentId = 'enrollment-1';

    // Consent is collected once at the start of the flow, so step 5 sends only
    // the e-signature — there is no `agreedToTerms` field on the payload.
    const signature = {
        signatureName: 'Anani Guarocuya',
        signatureDate: '2026-07-02',
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
            documents: [
                { type: DocumentType.USER_PHOTO },
                { type: DocumentType.STATE_ID },
                { type: DocumentType.BIRTH_CERTIFICATE },
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
                signatureName: 'Anani Guarocuya',
                signatureDate: new Date('2026-07-02'),
                agreedToTerms: true,
            },
        });
    });

    it('does not re-write consentAccepted — the guard already proved it true', async () => {
        const { service, database } = buildService(buildDraftEnrollment());

        await service.completeEnrollment(userId, signature);

        expect(database.enrollment.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.not.objectContaining({
                    consentAccepted: expect.anything(),
                }),
            }),
        );
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

    it('throws when the enrollment has no step records at all (no vacuous pass)', async () => {
        const { service, database } = buildService(
            buildDraftEnrollment({ steps: [] }),
        );

        await expect(
            service.completeEnrollment(userId, signature),
        ).rejects.toThrow(
            'All enrollment steps must be completed to complete enrollment',
        );
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });

    it('throws when an expected step record is missing, even if the present ones are completed', async () => {
        const { service, database } = buildService(
            buildDraftEnrollment({
                steps: [
                    { stepNumber: 1, isCompleted: true },
                    { stepNumber: 2, isCompleted: true },
                    { stepNumber: 3, isCompleted: true },
                    // stepNumber 4 is missing entirely
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

    it('throws when the mandatory photo document is missing', async () => {
        const { service, database } = buildService(
            buildDraftEnrollment({
                documents: [
                    { type: DocumentType.STATE_ID },
                    { type: DocumentType.BIRTH_CERTIFICATE },
                ],
            }),
        );

        await expect(
            service.completeEnrollment(userId, signature),
        ).rejects.toThrow('missing_required_documents');
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });

    it('throws when fewer than 2 of the 3 identity documents are present', async () => {
        const { service, database } = buildService(
            buildDraftEnrollment({
                documents: [
                    { type: DocumentType.USER_PHOTO },
                    { type: DocumentType.STATE_ID },
                ],
            }),
        );

        await expect(
            service.completeEnrollment(userId, signature),
        ).rejects.toThrow('missing_identity_documents');
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });

    // Client 2026-07-20: a government ID is mandatory on top of the
    // 2-distinct-types minimum, and the member is told so specifically.
    it('throws missing_state_id when the two identity documents exclude the government ID', async () => {
        const { service, database } = buildService(
            buildDraftEnrollment({
                documents: [
                    { type: DocumentType.USER_PHOTO },
                    { type: DocumentType.BIRTH_CERTIFICATE },
                    { type: DocumentType.SOCIAL_SECURITY_CARD },
                ],
            }),
        );

        await expect(
            service.completeEnrollment(userId, signature),
        ).rejects.toThrow('missing_state_id');
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });

    it('throws missing_state_id when no identity document is uploaded at all', async () => {
        const { service, database } = buildService(
            buildDraftEnrollment({
                documents: [{ type: DocumentType.USER_PHOTO }],
            }),
        );

        await expect(
            service.completeEnrollment(userId, signature),
        ).rejects.toThrow('missing_state_id');
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });

    it('submits with the government ID plus a social security card', async () => {
        const { service, database } = buildService(
            buildDraftEnrollment({
                documents: [
                    { type: DocumentType.USER_PHOTO },
                    { type: DocumentType.STATE_ID },
                    { type: DocumentType.SOCIAL_SECURITY_CARD },
                ],
            }),
        );

        await expect(
            service.completeEnrollment(userId, signature),
        ).resolves.toEqual({
            success: true,
            message: 'Enrollment completed successfully',
        });
        expect(database.enrollment.update).toHaveBeenCalled();
    });

    it('accepts duplicate files of one identity type only when a second distinct type exists', async () => {
        const { service, database } = buildService(
            buildDraftEnrollment({
                documents: [
                    { type: DocumentType.USER_PHOTO },
                    { type: DocumentType.STATE_ID },
                    { type: DocumentType.STATE_ID },
                ],
            }),
        );

        await expect(
            service.completeEnrollment(userId, signature),
        ).rejects.toThrow('missing_identity_documents');
        expect(database.enrollment.update).not.toHaveBeenCalled();
    });

    it('derives agreedToTerms from a valid signature, ignoring what the client sent', async () => {
        // Consent is asked once, up front. A step-5 client (old or new) has no
        // say over the stored attestation: signing over an enrollment whose
        // required consents are accepted IS the attestation, so a stale bundle
        // sending `agreedToTerms: false` must still record `true` rather than
        // being rejected.
        const { service, database } = buildService(buildDraftEnrollment());

        await expect(
            service.completeEnrollment(userId, {
                ...signature,
                agreedToTerms: false,
            }),
        ).resolves.toEqual({
            success: true,
            message: 'Enrollment completed successfully',
        });
        expect(database.enrollment.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ agreedToTerms: true }),
            }),
        );
    });

    it('does not record the terms attestation when the signature is invalid', async () => {
        // The signature is what carries the attestation now, so an unsigned
        // submission must leave no ToS record at all.
        const { service, database } = buildService(buildDraftEnrollment());

        await expect(
            service.completeEnrollment(userId, { ...signature, signatureName: '' }),
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
