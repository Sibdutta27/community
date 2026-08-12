import { readFileSync } from 'fs';
import { join } from 'path';

import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

import { MEDIA_MAX_FILE_SIZE, MEDIA_SLOTS, MEDIA_SLOT_KEYS } from './config';
import { MediaService } from './media.service';

const PNG = 'image/png';

function buildService(storageOverrides: Record<string, unknown> = {}) {

    const contentMedia = {
        findMany  : jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({ id: 'media-1', fileKey: 'site-media/a.png' }),
        create    : jest.fn().mockImplementation(({ data }) => ({ id: 'media-1', ...data })),
        update    : jest.fn().mockResolvedValue({ id: 'media-1' }),
    };

    const contentImageSlot = {
        findMany: jest.fn().mockResolvedValue([]),
        upsert  : jest.fn().mockResolvedValue({}),
        delete  : jest.fn().mockResolvedValue({}),
    };

    const database = { contentMedia, contentImageSlot };

    const storage = {
        isConfigured        : true,
        createPresignedPutUrl: jest.fn().mockResolvedValue('https://signed.example/put'),
        publicUrlFor        : jest.fn((key: string) => `https://cdn.example.org/${key}`),
        assertConfigured    : jest.fn(),
        ...storageOverrides,
    };

    const contentService = { requestSiteRevalidation: jest.fn() };

    const service = new MediaService(
        database as never,
        storage as never,
        contentService as never,
    );

    return {
        contentService, service, database, contentMedia, contentImageSlot, storage };
}

function upload(overrides: Record<string, unknown> = {}) {
    return {
        fileName: 'new-logo.png',
        mimeType: PNG,
        fileSize: 120_000,
        ...overrides,
    } as { fileName: string; mimeType: string; fileSize: number };
}

describe('MediaService — upload policy', () => {

    // An SVG is a script container. Served from a public origin under the
    // site's own domain it is stored XSS, and the site's real SVGs are
    // design-system icons that belong in git, not in a CMS.
    it('rejects an SVG', async () => {
        const { service } = buildService();

        await expect(
            service.presignUpload(upload({ mimeType: 'image/svg+xml', fileName: 'icon.svg' })),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('explains why an SVG is refused rather than just listing allowed types', async () => {
        const { service } = buildService();

        await expect(
            service.presignUpload(upload({ mimeType: 'image/svg+xml' })),
        ).rejects.toThrow(/SVG/);

        await expect(
            service.presignUpload(upload({ mimeType: 'image/svg+xml' })),
        ).rejects.toThrow(/script|code|developer/i);
    });

    it('rejects a file over the size limit', async () => {
        const { service } = buildService();

        await expect(
            service.presignUpload(upload({ fileSize: MEDIA_MAX_FILE_SIZE + 1 })),
        ).rejects.toThrow(/4 MB/);
    });

    it('rejects an empty file', async () => {
        const { service } = buildService();

        await expect(
            service.presignUpload(upload({ fileSize: 0 })),
        ).rejects.toThrow(/empty/i);
    });

    it('rejects a type that is not an image at all', async () => {
        const { service } = buildService();

        await expect(
            service.presignUpload(upload({ mimeType: 'application/pdf' })),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it.each(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])(
        'presigns a %s within the limit',
        async (mimeType) => {
            const { service, storage } = buildService();

            const result = await service.presignUpload(upload({ mimeType }));

            expect(result.uploadUrl).toBe('https://signed.example/put');
            expect(storage.createPresignedPutUrl).toHaveBeenCalled();
        },
    );

    it('signs a key inside the site-media prefix, never a caller-chosen path', async () => {
        const { service, storage } = buildService();

        const result = await service.presignUpload(
            upload({ fileName: '../../enrollment/steal me.png' }),
        );

        expect(result.key.startsWith('site-media/')).toBe(true);
        expect(result.key).not.toContain('..');
        expect(storage.createPresignedPutUrl.mock.calls[0][0]).toBe(result.key);
    });
});

describe('MediaService — unconfigured storage', () => {

    function unconfigured() {
        return buildService({
            isConfigured    : false,
            assertConfigured: () => {
                throw new ServiceUnavailableException(
                    'Media storage is not configured',
                );
            },
        });
    }

    // Neither S3_PUBLIC_BUCKET nor S3_PUBLIC_URL is set anywhere yet. The
    // uploader must say so plainly instead of failing somewhere in the AWS
    // SDK with a message nobody can act on.
    it('answers an upload with a clear "not configured" error', async () => {
        const { service } = unconfigured();

        await expect(service.presignUpload(upload()))
            .rejects.toThrow(/media storage is not configured/i);
    });

    it('does not write a media row when storage is unconfigured', async () => {
        const { service, contentMedia } = unconfigured();

        await expect(
            service.confirmUpload({ ...upload(), key: 'site-media/a.png' } as never),
        ).rejects.toThrow(/media storage is not configured/i);

        expect(contentMedia.create).not.toHaveBeenCalled();
    });

    // Everything that is not an upload must keep working, so the Studio can
    // still explain itself and the public read never depends on this.
    it('still lists the (empty) library', async () => {
        const { service } = unconfigured();

        await expect(service.listMedia()).resolves.toEqual({ data: [], count: 0 });
    });
});

describe('MediaService.confirmUpload', () => {

    it('re-validates the policy the presign already checked', async () => {
        const { service, contentMedia } = buildService();

        await expect(
            service.confirmUpload({
                ...upload({ mimeType: 'image/svg+xml' }),
                key: 'site-media/abc-icon.svg',
            } as never),
        ).rejects.toThrow(/SVG/);

        expect(contentMedia.create).not.toHaveBeenCalled();
    });

    // The key is client-supplied. Without the prefix check a caller could
    // register a row pointing at any object path they can name.
    it('refuses a key outside the site-media prefix', async () => {
        const { service } = buildService();

        await expect(
            service.confirmUpload({
                ...upload(),
                key: 'enrollment/abc/STATE_ID/scan.png',
            } as never),
        ).rejects.toThrow(/does not belong/i);
    });

    it('writes the row and returns a public URL', async () => {
        const { service, contentMedia } = buildService();

        const result = await service.confirmUpload({
            ...upload(),
            key  : 'site-media/abc-new-logo.png',
            altEn: 'The seal',
            altEs: 'El sello',
        } as never);

        expect(contentMedia.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                fileKey : 'site-media/abc-new-logo.png',
                mimeType: PNG,
                altEn   : 'The seal',
                altEs   : 'El sello',
            }),
        });

        expect(result.media.url).toBe(
            'https://cdn.example.org/site-media/abc-new-logo.png',
        );
    });
});

describe('MediaService — slot assignment', () => {

    it('refuses a slot key the registry does not declare', async () => {
        const { service, contentImageSlot } = buildService();

        await expect(
            service.assignSlot('home.hero.invented', 'media-1', {}),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(contentImageSlot.upsert).not.toHaveBeenCalled();
    });

    it('names the unknown slot so a typo is obvious', async () => {
        const { service } = buildService();

        await expect(
            service.assignSlot('brand.logoo', 'media-1', {}),
        ).rejects.toThrow(/brand\.logoo/);
    });

    it('refuses to clear a slot key the registry does not declare', async () => {
        const { service, contentImageSlot } = buildService();

        await expect(service.clearSlot('nope.at.all')).rejects.toBeInstanceOf(
            BadRequestException,
        );

        expect(contentImageSlot.delete).not.toHaveBeenCalled();
    });

    it('assigns a declared slot', async () => {
        const { service, contentImageSlot } = buildService();

        await service.assignSlot('brand.logo', 'media-1', { actorId: 'admin-1' });

        expect(contentImageSlot.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { slotKey: 'brand.logo' },
            }),
        );
    });

    it('404s when the image being assigned does not exist', async () => {
        const { service, contentMedia } = buildService();
        contentMedia.findUnique.mockResolvedValue(null);

        await expect(
            service.assignSlot('brand.logo', 'missing', {}),
        ).rejects.toThrow(/not found|unknown/i);
    });

    // Clearing is a delete, not a blank row: the registry default is what the
    // site ships, so "restore the original" cannot itself be wrong.
    it('clears a slot back to the shipped default by deleting the row', async () => {
        const { service, contentImageSlot } = buildService();

        await service.clearSlot('brand.logo');

        expect(contentImageSlot.delete).toHaveBeenCalledWith({
            where: { slotKey: 'brand.logo' },
        });
    });
});

/**
 * The web app's `src/content/media-slots.ts` is the authority: there the
 * registry is the allowlist AND the shipped fallback. This module keeps a
 * hand-maintained mirror so the API can refuse an unknown slot and describe
 * each one to an editor — and a hand-maintained mirror drifts.
 *
 * Read as text rather than imported: the two apps are separate TypeScript
 * projects, and importing across them would pull the web app's module graph
 * into the API build.
 */
describe('the web media-slots registry mirror', () => {

    function webRegistry(): Record<string, string> {
        const source = readFileSync(
            join(__dirname, '../../../../web/src/content/media-slots.ts'),
            'utf8',
        );

        const body = source.slice(
            source.indexOf('export const MEDIA_SLOTS = {'),
            source.indexOf('} as const;'),
        );

        const entries: Record<string, string> = {};

        for (const match of body.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
            entries[match[1]] = match[2];
        }

        return entries;
    }

    it('declares exactly the slots the site renders', () => {
        expect(MEDIA_SLOT_KEYS.slice().sort())
            .toEqual(Object.keys(webRegistry()).sort());
    });

    // The default is shown to the editor as "this is what the site shows
    // today", so drift here is a caption that lies.
    it('quotes each slot\'s shipped default correctly', () => {
        const web = webRegistry();

        for (const slotKey of MEDIA_SLOT_KEYS) {
            expect(MEDIA_SLOTS[slotKey].defaultPath).toBe(web[slotKey]);
        }
    });
});

/**
 * Copy and territory changes bust the web app's content cache the moment they
 * publish. Image slots were the odd one out — an assignment sat behind the
 * 60s revalidate window, so a swapped photograph appeared up to a minute
 * after every other kind of edit. Measured on the deployed stack: ~24s.
 */
describe('MediaService — cache invalidation', () => {

    it('busts the site cache when a slot is assigned', async () => {
        const { service, contentService } = buildService();

        await service.assignSlot('brand.logo', 'media-1', {});

        expect(contentService.requestSiteRevalidation).toHaveBeenCalled();
    });

    it('busts the site cache when a slot is cleared', async () => {
        const { service, contentService } = buildService();

        await service.clearSlot('brand.logo');

        expect(contentService.requestSiteRevalidation).toHaveBeenCalled();
    });
});
