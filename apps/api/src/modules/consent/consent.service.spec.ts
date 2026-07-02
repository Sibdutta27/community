import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConsentService } from './consent.service';

describe('ConsentService.acceptEnrollmentConsent', () => {
    const requiredConsent = {
        id       : 'consent-required',
        key      : 'terms',
        title    : 'Terms of Service',
        content  : 'content',
        required : true,
        version  : 1,
        createdAt: new Date(),
        active   : true,
    };

    function buildService({ enrollment }: { enrollment: { id: string } | null }) {
        const database = {
            consent: {
                findMany: jest.fn().mockResolvedValue([requiredConsent]),
            },
            enrollmentConsent: {
                createMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
        };

        const enrollmentService = {
            getMinimalEnrollmentByUserId: jest.fn().mockResolvedValue(enrollment),
            updateEnrollment            : jest.fn().mockResolvedValue(undefined),
        };

        const service = new ConsentService(
            database as never,
            enrollmentService as never,
        );

        return { service, database, enrollmentService };
    }

    it('throws a NotFoundException when the user has no enrollment', async () => {
        const { service } = buildService({ enrollment: null });

        await expect(
            service.acceptEnrollmentConsent('user-1', { acceptRequired: true }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws a BadRequestException when a required consent is not accepted', async () => {
        const { service } = buildService({ enrollment: { id: 'enrollment-1' } });

        await expect(
            service.acceptEnrollmentConsent('user-1', { consentItemIds: [] }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('accepts the required consents and marks the enrollment consented', async () => {
        const { service, database, enrollmentService } = buildService({
            enrollment: { id: 'enrollment-1' },
        });

        const result = await service.acceptEnrollmentConsent('user-1', {
            acceptRequired: true,
        });

        expect(result).toEqual({
            success: true,
            message: 'Consents accepted successfully',
        });
        expect(database.enrollmentConsent.createMany).toHaveBeenCalledWith({
            data: [
                {
                    enrollmentId: 'enrollment-1',
                    consentId   : requiredConsent.id,
                    accepted    : true,
                },
            ],
            skipDuplicates: true,
        });
        expect(enrollmentService.updateEnrollment).toHaveBeenCalledWith(
            'enrollment-1',
            { consentAccepted: true },
        );
    });
});
