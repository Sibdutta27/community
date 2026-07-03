import { BadRequestException } from '@nestjs/common';
import { DocumentType } from '@/generated/prisma/enums';
import { DocumentService } from './document.service';

const MB = 1024 * 1024;
const enrollmentId = 'enrollment-1';

function buildService() {
    const documentDelegate = {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const tx = { document: documentDelegate };

    const database = {
        document: documentDelegate,
        $transaction: jest.fn(async (cb: (t: unknown) => unknown) => cb(tx)),
    };

    const s3Service = {
        uploadFile: jest.fn(),
        deleteFile: jest.fn().mockResolvedValue(undefined),
        gets3SignedUrl: jest.fn().mockResolvedValue('https://signed.example/get'),
        gets3SignedPublicUrl: jest.fn().mockResolvedValue('https://signed.example/public'),
        createPresignedPutUrl: jest.fn().mockResolvedValue('https://signed.example/put'),
        createPresignedGetUrl: jest.fn().mockResolvedValue('https://signed.example/get'),
    };

    const service = new DocumentService(database as never, s3Service as never);

    return { service, database, documentDelegate, s3Service };
}

describe('DocumentService.createEnrollmentPresignedUpload', () => {
    it('returns a PUT presign payload with an enrollment-scoped key', async () => {
        const { service, s3Service } = buildService();

        const result = await service.createEnrollmentPresignedUpload(enrollmentId, {
            documentType: DocumentType.USER_PHOTO,
            fileName: 'My Photo (1).jpg',
            mimeType: 'image/jpeg',
            fileSize: 2 * MB,
        });

        expect(result.method).toBe('PUT');
        expect(result.uploadUrl).toBe('https://signed.example/put');
        expect(result.headers).toEqual({ 'Content-Type': 'image/jpeg' });
        expect(result.key).toMatch(
            new RegExp(`^enrollment/${enrollmentId}/USER_PHOTO/[0-9a-f-]{36}-[A-Za-z0-9._-]+$`),
        );
        expect(s3Service.createPresignedPutUrl).toHaveBeenCalledWith(
            result.key,
            'image/jpeg',
            expect.any(Number),
        );
    });

    it('rejects a mime type not allowed for the slot (pdf as USER_PHOTO)', async () => {
        const { service } = buildService();

        await expect(
            service.createEnrollmentPresignedUpload(enrollmentId, {
                documentType: DocumentType.USER_PHOTO,
                fileName: 'photo.pdf',
                mimeType: 'application/pdf',
                fileSize: 1 * MB,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('rejects an oversize file for a 10 MB slot', async () => {
        const { service } = buildService();

        await expect(
            service.createEnrollmentPresignedUpload(enrollmentId, {
                documentType: DocumentType.GENEALOGICAL_RECORDS,
                fileName: 'tree.pdf',
                mimeType: 'application/pdf',
                fileSize: 11 * MB,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('rejects audio for a documents-only slot (mp3 as DNA_TESTING)', async () => {
        const { service } = buildService();

        await expect(
            service.createEnrollmentPresignedUpload(enrollmentId, {
                documentType: DocumentType.DNA_TESTING,
                fileName: 'results.mp3',
                mimeType: 'audio/mpeg',
                fileSize: 1 * MB,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('allows a 60 MB mp4 for ORAL_HISTORY (A/V slot, 100 MB cap)', async () => {
        const { service } = buildService();

        const result = await service.createEnrollmentPresignedUpload(enrollmentId, {
            documentType: DocumentType.ORAL_HISTORY,
            fileName: 'story.mp4',
            mimeType: 'video/mp4',
            fileSize: 60 * MB,
        });

        expect(result.key).toContain(`enrollment/${enrollmentId}/ORAL_HISTORY/`);
    });

    it('rejects an ORAL_HISTORY file above 100 MB', async () => {
        const { service } = buildService();

        await expect(
            service.createEnrollmentPresignedUpload(enrollmentId, {
                documentType: DocumentType.ORAL_HISTORY,
                fileName: 'story.mp4',
                mimeType: 'video/mp4',
                fileSize: 101 * MB,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('rejects a document type that is not an enrollment slot', async () => {
        const { service } = buildService();

        await expect(
            service.createEnrollmentPresignedUpload(enrollmentId, {
                documentType: DocumentType.UNKNOWN,
                fileName: 'file.pdf',
                mimeType: 'application/pdf',
                fileSize: 1 * MB,
            }),
        ).rejects.toThrow(BadRequestException);
    });
});

describe('DocumentService.confirmEnrollmentDocument', () => {
    const validKey = `enrollment/${enrollmentId}/GENEALOGICAL_RECORDS/2f1e9a30-1234-4abc-9def-000000000000-tree.pdf`;

    it('rejects a key that belongs to another enrollment', async () => {
        const { service } = buildService();

        await expect(
            service.confirmEnrollmentDocument(enrollmentId, {
                documentType: DocumentType.GENEALOGICAL_RECORDS,
                key: 'enrollment/other-enrollment/GENEALOGICAL_RECORDS/abc-tree.pdf',
                fileName: 'tree.pdf',
                mimeType: 'application/pdf',
                fileSize: 1 * MB,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('rejects a key whose document-type segment does not match', async () => {
        const { service } = buildService();

        await expect(
            service.confirmEnrollmentDocument(enrollmentId, {
                documentType: DocumentType.KINSHIP_LETTERS,
                key: validKey,
                fileName: 'tree.pdf',
                mimeType: 'application/pdf',
                fileSize: 1 * MB,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('re-validates the per-slot policy at confirm time', async () => {
        const { service } = buildService();

        await expect(
            service.confirmEnrollmentDocument(enrollmentId, {
                documentType: DocumentType.GENEALOGICAL_RECORDS,
                key: validKey,
                fileName: 'tree.pdf',
                mimeType: 'application/pdf',
                fileSize: 11 * MB,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('inserts a record for multi-file types with fileKey=key', async () => {
        const { service, documentDelegate } = buildService();

        documentDelegate.create.mockResolvedValue({
            id: 'doc-1',
            type: DocumentType.GENEALOGICAL_RECORDS,
            fileName: 'tree.pdf',
            fileKey: validKey,
            fileSize: 1 * MB,
            mimeType: 'application/pdf',
        });

        const result = await service.confirmEnrollmentDocument(enrollmentId, {
            documentType: DocumentType.GENEALOGICAL_RECORDS,
            key: validKey,
            fileName: 'tree.pdf',
            mimeType: 'application/pdf',
            fileSize: 1 * MB,
        });

        expect(documentDelegate.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                enrollmentId,
                type: DocumentType.GENEALOGICAL_RECORDS,
                fileKey: validKey,
                fileSize: 1 * MB,
                mimeType: 'application/pdf',
            }),
        });
        expect(result.document.fileKey).toBe(validKey);
        expect(result.document.url).toBe('https://signed.example/get');
    });

    it('upserts single-file types and deletes the replaced object', async () => {
        const { service, documentDelegate, s3Service } = buildService();

        const photoKey = `enrollment/${enrollmentId}/USER_PHOTO/2f1e9a30-1234-4abc-9def-000000000000-photo.jpg`;

        documentDelegate.findFirst.mockResolvedValue({
            id: 'doc-old',
            fileKey: 'enrollment/enrollment-1/USER_PHOTO/old-key.jpg',
        });
        documentDelegate.update.mockResolvedValue({
            id: 'doc-old',
            type: DocumentType.USER_PHOTO,
            fileName: 'photo.jpg',
            fileKey: photoKey,
            fileSize: 1 * MB,
            mimeType: 'image/jpeg',
        });

        const result = await service.confirmEnrollmentDocument(enrollmentId, {
            documentType: DocumentType.USER_PHOTO,
            key: photoKey,
            fileName: 'photo.jpg',
            mimeType: 'image/jpeg',
            fileSize: 1 * MB,
        });

        expect(documentDelegate.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'doc-old' },
                data: expect.objectContaining({ fileKey: photoKey }),
            }),
        );
        expect(documentDelegate.create).not.toHaveBeenCalled();
        expect(s3Service.deleteFile).toHaveBeenCalledWith(
            'enrollment/enrollment-1/USER_PHOTO/old-key.jpg',
        );
        expect(result.document.fileKey).toBe(photoKey);
    });
});

describe('DocumentService.validateFile (multipart fallback) — per-slot policy', () => {
    function buildFile(mimetype: string, size: number) {
        return { mimetype, size, buffer: Buffer.alloc(0) } as Express.Multer.File;
    }

    it('rejects a pdf uploaded as USER_PHOTO', async () => {
        const { service } = buildService();

        await expect(
            service.upsertSingleEnrollmentDocumentRecord(
                enrollmentId,
                DocumentType.USER_PHOTO,
                buildFile('application/pdf', 1 * MB),
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('accepts an mp3 for ORAL_HISTORY via multipart', async () => {
        const { service, documentDelegate, s3Service } = buildService();

        s3Service.uploadFile.mockResolvedValue({
            bucket: 'enrollment-documents',
            key: 'documents/oral_history/enrollment-1/x',
            url: 'documents/oral_history/enrollment-1/x',
            size: 1 * MB,
            type: 'audio/mpeg',
        });
        documentDelegate.create.mockResolvedValue({
            id: 'doc-2',
            type: DocumentType.ORAL_HISTORY,
            fileName: 'x',
            fileKey: 'documents/oral_history/enrollment-1/x',
            fileSize: 1 * MB,
            mimeType: 'audio/mpeg',
        });

        const result = await service.insertMultipleEnrollmentDocumentRecord(
            enrollmentId,
            DocumentType.ORAL_HISTORY,
            buildFile('audio/mpeg', 1 * MB),
        );

        expect(result.document.mimeType).toBe('audio/mpeg');
    });

    it('rejects an oversize multipart file for a 10 MB slot', async () => {
        const { service } = buildService();

        await expect(
            service.insertMultipleEnrollmentDocumentRecord(
                enrollmentId,
                DocumentType.KINSHIP_LETTERS,
                buildFile('application/pdf', 11 * MB),
            ),
        ).rejects.toThrow(BadRequestException);
    });
});
