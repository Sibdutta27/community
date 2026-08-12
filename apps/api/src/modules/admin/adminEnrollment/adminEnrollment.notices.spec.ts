import { EnrollmentStatus, NoticeChannel, NoticeStatus } from '@/generated/prisma/enums';

import { AdminEnrollmentService } from './adminEnrollment.service';

const enrollmentId = 'enrollment-1';

const contact = {
    email: 'contact@example.com',
    phoneNumber: '+17875551234',
    phoneType: 'MOBILE',
    allowSMS: true,
};

function buildService(enrollment: unknown) {

    const createMany = jest.fn().mockResolvedValue({ count: 0 });
    const update = jest.fn().mockResolvedValue({});

    const tx = {
        enrollment: { update },
        enrollmentNotice: { createMany },
    };

    const database = {
        enrollment: {
            findUnique: jest.fn().mockResolvedValue(enrollment),
            update,
        },

        enrollmentNotice: { createMany },

        $transaction: jest.fn(async (cb: (t: unknown) => unknown) => cb(tx)),
    };

    const service = new AdminEnrollmentService(
        database as never,
        {} as never,
        {} as never,
    );

    return { service, database, createMany, update };
}

function submitted(overrides: Record<string, unknown> = {}) {
    return {
        id: enrollmentId,
        status: EnrollmentStatus.SUBMITTED,
        user: { email: 'member@example.com' },
        contact,
        ...overrides,
    };
}

/** The rows handed to createMany, whatever shape the call took. */
function queuedRows(createMany: jest.Mock) {
    return createMany.mock.calls[0]?.[0]?.data ?? [];
}

describe('AdminEnrollmentService.rejectEnrollment — decision record', () => {

    it('records the reason and who decided, not just the status', async () => {
        const { service, update } = buildService(submitted());

        await service.rejectEnrollment(enrollmentId, {
            reason: '  Birth certificate did not match the name on the ID.  ',
            decidedById: 'admin-9',
        });

        expect(update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: EnrollmentStatus.REJECTED,
                    decisionReason:
                        'Birth certificate did not match the name on the ID.',
                    decidedById: 'admin-9',
                }),
            }),
        );
    });

    it('stores an omitted reason as null rather than an empty string', async () => {
        const { service, update } = buildService(submitted());

        await service.rejectEnrollment(enrollmentId, { reason: '   ' });

        expect(update.mock.calls[0][0].data.decisionReason).toBeNull();
    });

    it('queues nothing when no channel was chosen', async () => {
        const { service, createMany } = buildService(submitted());

        await service.rejectEnrollment(enrollmentId, { reason: 'No.' });

        expect(createMany).not.toHaveBeenCalled();
    });

    it('snapshots the destination so a later address change cannot rewrite it', async () => {
        const { service, createMany } = buildService(submitted());

        await service.rejectEnrollment(enrollmentId, {
            channels: [NoticeChannel.ACCOUNT_EMAIL],
        });

        expect(queuedRows(createMany)).toEqual([
            expect.objectContaining({
                channel: NoticeChannel.ACCOUNT_EMAIL,
                destination: 'member@example.com',
                status: NoticeStatus.PENDING,
            }),
        ]);
    });

    // The one with legal consequences: asking for SMS must not produce a
    // sendable row for a member who never agreed to be texted.
    it('suppresses SMS when the member did not consent, instead of queueing it', async () => {
        const { service, createMany } = buildService(
            submitted({ contact: { ...contact, allowSMS: false } }),
        );

        await service.rejectEnrollment(enrollmentId, {
            channels: [NoticeChannel.SMS],
        });

        expect(queuedRows(createMany)).toEqual([
            expect.objectContaining({
                channel: NoticeChannel.SMS,
                status: NoticeStatus.SUPPRESSED,
            }),
        ]);
    });

    it('queues SMS when the member did consent', async () => {
        const { service, createMany } = buildService(submitted());

        await service.rejectEnrollment(enrollmentId, {
            channels: [NoticeChannel.SMS],
        });

        expect(queuedRows(createMany)[0].status).toBe(NoticeStatus.PENDING);
    });

    it('skips a channel with nothing on file rather than queueing an empty destination', async () => {
        const { service, createMany } = buildService(
            submitted({ contact: null }),
        );

        await service.rejectEnrollment(enrollmentId, {
            channels: [NoticeChannel.CONTACT_EMAIL, NoticeChannel.SMS],
        });

        expect(createMany).not.toHaveBeenCalled();
    });

    it('never reports a notice as sent — delivery is not wired', async () => {
        const { service } = buildService(submitted());

        const result = await service.rejectEnrollment(enrollmentId, {
            channels: [NoticeChannel.ACCOUNT_EMAIL, NoticeChannel.SMS],
        });

        for (const notice of result.notices) {
            expect(notice.status).not.toBe(NoticeStatus.SENT);
        }
    });

    it('refuses to reject an already-approved enrollment', async () => {
        const { service } = buildService(
            submitted({ status: EnrollmentStatus.APPROVED }),
        );

        await expect(
            service.rejectEnrollment(enrollmentId, {}),
        ).rejects.toThrow('Approved enrollment cannot be rejected');
    });
});

describe('AdminEnrollmentService.getNotificationChannels', () => {

    it('offers the contact email only when it differs from the account email', async () => {
        const { service } = buildService(
            submitted({ contact: { ...contact, email: 'member@example.com' } }),
        );

        const { channels } = await service.getNotificationChannels(enrollmentId);

        expect(
            channels.filter((c) => c.channel === NoticeChannel.CONTACT_EMAIL),
        ).toHaveLength(0);
    });

    it('marks SMS unavailable, with the reason, when consent is missing', async () => {
        const { service } = buildService(
            submitted({ contact: { ...contact, allowSMS: false } }),
        );

        const { channels } = await service.getNotificationChannels(enrollmentId);
        const sms = channels.find((c) => c.channel === NoticeChannel.SMS);

        expect(sms?.available).toBe(false);
        expect(sms?.note).toMatch(/did not consent/i);
    });

    it('omits channels the member has no destination for', async () => {
        const { service } = buildService(submitted({ contact: null }));

        const { channels } = await service.getNotificationChannels(enrollmentId);

        expect(channels.map((c) => c.channel)).toEqual([
            NoticeChannel.ACCOUNT_EMAIL,
        ]);
    });
});
