import { DocumentType } from '@/generated/prisma/enums';
import { getDocumentPolicy } from './config';

const MB = 1024 * 1024;

describe('getDocumentPolicy — per-slot upload policy', () => {
    it('restricts USER_PHOTO to images only, 10 MB', () => {
        const policy = getDocumentPolicy(DocumentType.USER_PHOTO);

        expect(policy.allowedMime).toEqual(
            expect.arrayContaining(['image/jpeg', 'image/png', 'image/webp']),
        );
        expect(policy.allowedMime).not.toContain('application/pdf');
        expect(policy.maxSize).toBe(10 * MB);
    });

    it('restricts PROFILE_PICTURE to images only, 10 MB', () => {
        const policy = getDocumentPolicy(DocumentType.PROFILE_PICTURE);

        expect(policy.allowedMime).toEqual(
            expect.arrayContaining(['image/jpeg', 'image/png', 'image/webp']),
        );
        expect(policy.allowedMime).not.toContain('application/pdf');
        expect(policy.maxSize).toBe(10 * MB);
    });

    it.each([
        DocumentType.GENEALOGICAL_RECORDS,
        DocumentType.KINSHIP_LETTERS,
        DocumentType.DNA_TESTING,
    ])('allows documents + images for %s, 10 MB', (type) => {
        const policy = getDocumentPolicy(type);

        expect(policy.allowedMime).toEqual(
            expect.arrayContaining([
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/webp',
            ]),
        );
        expect(policy.allowedMime).not.toContain('audio/mpeg');
        expect(policy.allowedMime).not.toContain('video/mp4');
        expect(policy.maxSize).toBe(10 * MB);
    });

    it('allows audio/video for ORAL_HISTORY with a 100 MB cap', () => {
        const policy = getDocumentPolicy(DocumentType.ORAL_HISTORY);

        expect(policy.allowedMime).toEqual(
            expect.arrayContaining([
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/webp',
                'audio/mpeg',
                'audio/mp4',
                'audio/wav',
                'audio/x-wav',
                'video/mp4',
                'video/quicktime',
            ]),
        );
        expect(policy.maxSize).toBe(100 * MB);
    });

    it('falls back to a sensible default for unmapped types', () => {
        const policy = getDocumentPolicy(DocumentType.UNKNOWN);

        expect(policy.allowedMime.length).toBeGreaterThan(0);
        expect(policy.maxSize).toBeGreaterThan(0);
        expect(policy.maxSize).toBeLessThanOrEqual(10 * MB);
    });
});
