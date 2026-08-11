import { NotFoundException } from '@nestjs/common';
import { FeedbackStatus } from '@/generated/prisma/enums';
import {
    AdminFeedbackService,
    FEEDBACK_PREVIEW_LENGTH,
} from './adminFeedback.service';

function buildRow(overrides: Record<string, unknown> = {}) {
    return {
        id: 'feedback-1',
        status: FeedbackStatus.NEW,

        message: 'The yucayeke map is blank on my phone.',
        pageUrl: 'https://app.example/yucayeke',
        locale: 'es',
        userAgent: 'Mozilla/5.0 (iPhone)',

        attachmentKey: null,
        attachmentName: null,
        attachmentMimeType: null,
        attachmentSize: null,

        createdAt: new Date('2026-08-10T12:00:00Z'),
        updatedAt: new Date('2026-08-10T12:00:00Z'),

        user: {
            id: 'user-1',
            publicId: 1042,
            name: 'Anani Guarocuya',
            email: 'anani@example.com',
        },

        ...overrides,
    };
}

function buildService(options: {
    rows?: Record<string, unknown>[];
    count?: number;
    detail?: Record<string, unknown> | null;
    grouped?: { status: FeedbackStatus; _count: { _all: number } }[];
} = {}) {
    const database = {
        feedback: {
            findMany: jest.fn().mockResolvedValue(options.rows ?? []),
            count: jest.fn().mockResolvedValue(options.count ?? 0),
            findUnique: jest.fn().mockResolvedValue(
                options.detail === undefined ? buildRow() : options.detail,
            ),
            update: jest.fn().mockImplementation(({ data }) =>
                Promise.resolve({
                    id: 'feedback-1',
                    status: data.status,
                    updatedAt: new Date('2026-08-11T09:00:00Z'),
                }),
            ),
            groupBy: jest.fn().mockResolvedValue(options.grouped ?? []),
        },
    };

    const s3Service = {
        gets3SignedUrl: jest
            .fn()
            .mockResolvedValue('https://signed.example/shot.png?sig=abc'),
    };

    const service = new AdminFeedbackService(
        database as never,
        s3Service as never,
    );

    return { service, database, s3Service };
}

describe('AdminFeedbackService.getFeedback (triage queue)', () => {

    it('returns the newest submissions first, one page at a time', async () => {
        const { service, database } = buildService({
            rows: [buildRow()],
            count: 37,
        });

        const result = await service.getFeedback({ page: 3, limit: 10 });

        const args = database.feedback.findMany.mock.calls[0][0];

        expect(args.skip).toBe(20);
        expect(args.take).toBe(10);
        expect(args.orderBy).toEqual({ createdAt: 'desc' });

        expect(result.count).toBe(37);
        expect(result.data).toHaveLength(1);
    });

    it('defaults to the first page of ten when no paging is asked for', async () => {
        const { service, database } = buildService();

        await service.getFeedback({});

        const args = database.feedback.findMany.mock.calls[0][0];

        expect(args.skip).toBe(0);
        expect(args.take).toBe(10);
    });

    it('filters to a single triage lane, and counts the same filtered set', async () => {
        const { service, database } = buildService();

        await service.getFeedback({ status: FeedbackStatus.IN_REVIEW });

        expect(database.feedback.findMany.mock.calls[0][0].where).toEqual({
            status: FeedbackStatus.IN_REVIEW,
        });

        expect(database.feedback.count.mock.calls[0][0].where).toEqual({
            status: FeedbackStatus.IN_REVIEW,
        });
    });

    it('does not filter when no lane is selected', async () => {
        const { service, database } = buildService();

        await service.getFeedback({});

        expect(database.feedback.findMany.mock.calls[0][0].where).toEqual({});
    });

    it('carries the submitter through for a signed-in member', async () => {
        const { service } = buildService({ rows: [buildRow()], count: 1 });

        const [row] = (await service.getFeedback({})).data;

        expect(row.isAnonymous).toBe(false);
        expect(row.submitter).toEqual({
            id: 'user-1',
            publicId: 1042,
            name: 'Anani Guarocuya',
            email: 'anani@example.com',
        });
    });

    it('marks a signed-out submission as anonymous rather than blank', async () => {
        const { service } = buildService({
            rows: [buildRow({ user: null })],
            count: 1,
        });

        const [row] = (await service.getFeedback({})).data;

        expect(row.isAnonymous).toBe(true);
        expect(row.submitter).toBeNull();
    });

    it('flags whether a row has an attachment without leaking the storage key', async () => {
        const { service } = buildService({
            rows: [
                buildRow({ attachmentKey: 'feedback/uuid-shot.png' }),
                buildRow({ id: 'feedback-2' }),
            ],
            count: 2,
        });

        const rows = (await service.getFeedback({})).data;

        expect(rows[0].hasAttachment).toBe(true);
        expect(rows[1].hasAttachment).toBe(false);
        expect(JSON.stringify(rows)).not.toContain('feedback/uuid-shot.png');
    });

    it('truncates a long message down to a scannable preview', async () => {
        const { service } = buildService({
            rows: [buildRow({ message: 'x'.repeat(FEEDBACK_PREVIEW_LENGTH + 50) })],
            count: 1,
        });

        const [row] = (await service.getFeedback({})).data;

        expect(row.messagePreview).toHaveLength(FEEDBACK_PREVIEW_LENGTH + 1);
        expect(row.messagePreview.endsWith('…')).toBe(true);
    });

    it('leaves a short message intact, collapsing stray whitespace', async () => {
        const { service } = buildService({
            rows: [buildRow({ message: '  it   broke\n\nagain  ' })],
            count: 1,
        });

        const [row] = (await service.getFeedback({})).data;

        expect(row.messagePreview).toBe('it broke again');
    });
});

describe('AdminFeedbackService.getStatusCounts', () => {

    it('reports zero for lanes nobody has used yet', async () => {
        const { service } = buildService({
            grouped: [
                { status: FeedbackStatus.NEW, _count: { _all: 4 } },
                { status: FeedbackStatus.RESOLVED, _count: { _all: 2 } },
            ],
        });

        expect(await service.getStatusCounts()).toEqual({
            NEW: 4,
            IN_REVIEW: 0,
            RESOLVED: 2,
            DECLINED: 0,
        });
    });
});

describe('AdminFeedbackService.getFeedbackDetail', () => {

    it('signs the attachment instead of returning its storage key', async () => {
        const { service, s3Service } = buildService({
            detail: buildRow({
                attachmentKey: 'feedback/uuid-shot.png',
                attachmentName: 'shot.png',
                attachmentMimeType: 'image/png',
                attachmentSize: 2048,
            }),
        });

        const result = await service.getFeedbackDetail('feedback-1');

        expect(s3Service.gets3SignedUrl).toHaveBeenCalledWith(
            'feedback/uuid-shot.png',
        );

        expect(result.attachment).toEqual({
            name: 'shot.png',
            mimeType: 'image/png',
            size: 2048,
            url: 'https://signed.example/shot.png?sig=abc',
        });

        expect(JSON.stringify(result)).not.toContain('feedback/uuid-shot.png');
    });

    it('returns no attachment, and signs nothing, when none was sent', async () => {
        const { service, s3Service } = buildService({ detail: buildRow() });

        const result = await service.getFeedbackDetail('feedback-1');

        expect(result.attachment).toBeNull();
        expect(s3Service.gets3SignedUrl).not.toHaveBeenCalled();
    });

    it('includes the full message and the debugging context', async () => {
        const { service } = buildService({ detail: buildRow() });

        const result = await service.getFeedbackDetail('feedback-1');

        expect(result.message).toBe('The yucayeke map is blank on my phone.');
        expect(result.pageUrl).toBe('https://app.example/yucayeke');
        expect(result.locale).toBe('es');
        expect(result.userAgent).toBe('Mozilla/5.0 (iPhone)');
    });

    it('marks an anonymous submission as such', async () => {
        const { service } = buildService({ detail: buildRow({ user: null }) });

        const result = await service.getFeedbackDetail('feedback-1');

        expect(result.isAnonymous).toBe(true);
        expect(result.submitter).toBeNull();
    });

    it('404s on an unknown id', async () => {
        const { service } = buildService({ detail: null });

        await expect(
            service.getFeedbackDetail('missing'),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});

describe('AdminFeedbackService.updateStatus (triage transitions)', () => {

    it.each([
        [FeedbackStatus.IN_REVIEW],
        [FeedbackStatus.RESOLVED],
        [FeedbackStatus.DECLINED],
        [FeedbackStatus.NEW],
    ])('moves a submission to %s', async (status) => {
        const { service, database } = buildService();

        const result = await service.updateStatus('feedback-1', status);

        expect(database.feedback.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'feedback-1' },
                data: { status },
            }),
        );

        expect(result.success).toBe(true);
        expect(result.feedback.status).toBe(status);
    });

    it('lets a resolved report be reopened — nothing is a dead end', async () => {
        const { service } = buildService({
            detail: buildRow({ status: FeedbackStatus.RESOLVED }),
        });

        const result = await service.updateStatus(
            'feedback-1',
            FeedbackStatus.IN_REVIEW,
        );

        expect(result.feedback.status).toBe(FeedbackStatus.IN_REVIEW);
    });

    it('404s on an unknown id instead of writing', async () => {
        const { service, database } = buildService({ detail: null });

        await expect(
            service.updateStatus('missing', FeedbackStatus.RESOLVED),
        ).rejects.toBeInstanceOf(NotFoundException);

        expect(database.feedback.update).not.toHaveBeenCalled();
    });
});
