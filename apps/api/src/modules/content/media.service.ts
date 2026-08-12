import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { randomUUID } from 'crypto';

import { DatabaseService } from '@/database/database.service';

import {
    MEDIA_ALLOWED_MIME,
    MEDIA_KEY_PREFIX,
    MEDIA_MAX_FILE_SIZE,
    MEDIA_PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS,
    MEDIA_SLOTS,
    MEDIA_SLOT_KEYS,
    SVG_MIME_TYPES,
    SVG_REJECTION_MESSAGE,
    isMediaSlotKey,
} from './config';

import { PublicMediaStorageService } from './publicMediaStorage.service';
import { ContentService } from './content.service';

export type PresignMediaInput = Readonly<{
    fileName: string;
    mimeType: string;
    fileSize: number;
}>;

export type ConfirmMediaInput = PresignMediaInput & Readonly<{
    key: string;
    altEn?: string | null;
    altEs?: string | null;
    width?: number | null;
    height?: number | null;
    uploadedBy?: string | null;
}>;

export type SlotActor = Readonly<{ actorId?: string }>;

@Injectable()
export class MediaService {

    constructor(
        private readonly database: DatabaseService,
        private readonly storage: PublicMediaStorageService,
        private readonly contentService: ContentService,
    ) { }

    /**
     * Step 1 of the upload: validate the file's metadata, then hand back a
     * presigned PUT into the public bucket.
     *
     * Validating here is convenience, not security — the browser could always
     * lie — which is why `confirmUpload` runs the same checks again before a
     * row exists.
     */
    public async presignUpload(input: PresignMediaInput) {

        this.assertAcceptableFile(input.mimeType, input.fileSize);

        this.storage.assertConfigured();

        const key = this.buildMediaKey(input.fileName);

        const uploadUrl = await this.storage.createPresignedPutUrl(
            key,
            input.mimeType,
            MEDIA_PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS,
        );

        return {
            uploadUrl,
            key,
            headers: { 'Content-Type': input.mimeType },
            method : 'PUT' as const,
        };
    }

    /**
     * Step 2: record the uploaded image.
     *
     * The key comes from the client, so it is checked against the prefix the
     * presign step would have produced — otherwise this endpoint would let a
     * caller register a row pointing at any object path they can name.
     */
    public async confirmUpload(input: ConfirmMediaInput) {

        this.assertAcceptableFile(input.mimeType, input.fileSize);

        this.storage.assertConfigured();

        if (
            !input.key.startsWith(MEDIA_KEY_PREFIX)
            || input.key.length <= MEDIA_KEY_PREFIX.length
        ) {
            throw new BadRequestException(
                `The uploaded file key does not belong to the site media library (expected it to start with "${MEDIA_KEY_PREFIX}")`,
            );
        }

        const media = await this.database.contentMedia.create({
            data: {
                fileKey   : input.key,
                fileName  : input.fileName,
                mimeType  : input.mimeType,
                fileSize  : input.fileSize,
                width     : input.width ?? null,
                height    : input.height ?? null,
                altEn     : input.altEn ?? null,
                altEs     : input.altEs ?? null,
                uploadedBy: input.uploadedBy ?? null,
            },
        });

        return { media: this.present(media) };
    }

    /**
     * The library, newest first.
     *
     * Unpaginated for the same reason the copy catalog is: a small site's
     * image library is one payload, and the grid filters client-side.
     */
    public async listMedia() {

        const rows = await this.database.contentMedia.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return {
            data : rows.map((row) => this.present(row)),
            count: rows.length,
        };
    }

    /**
     * Alt text, in both languages.
     *
     * Separate from the upload because an image swap that drops alt text is an
     * accessibility regression, and the person uploading is not always the
     * person who can describe the picture in Spanish.
     */
    public async updateAltText(
        id: string,
        input: { altEn?: string | null; altEs?: string | null },
    ) {
        await this.requireMedia(id);

        const media = await this.database.contentMedia.update({
            where: { id },

            data: {
                ...(input.altEn !== undefined && { altEn: input.altEn || null }),
                ...(input.altEs !== undefined && { altEs: input.altEs || null }),
            },
        });

        return { media: this.present(media) };
    }

    /**
     * Every slot the site renders, with whatever is currently assigned.
     *
     * Always returns one entry per registry slot, assigned or not — the Studio
     * has to be able to show an unassigned slot and its shipped default, and
     * deriving that list from the database rows would hide exactly the slots
     * nobody has touched yet.
     */
    public async listSlots() {

        const rows = await this.database.contentImageSlot.findMany({
            include: { media: true },
        });

        const bySlotKey = new Map(rows.map((row) => [row.slotKey, row]));

        return {
            data: MEDIA_SLOT_KEYS.map((slotKey) => {
                const row = bySlotKey.get(slotKey);
                const slot = MEDIA_SLOTS[slotKey];

                return {
                    slotKey,
                    label      : slot.label,
                    description: slot.description,
                    // What the site shows when nothing is assigned. Sent as
                    // text so the Studio can say which image is live without
                    // loading it cross-origin from the web app.
                    defaultPath: slot.defaultPath,
                    mediaId    : row?.mediaId ?? null,
                    media      : row?.media ? this.present(row.media) : null,
                    publishedAt: row?.publishedAt ?? null,
                    updatedAt  : row?.updatedAt ?? null,
                };
            }),
        };
    }

    /**
     * Point a slot at an image.
     *
     * Assignments publish immediately rather than joining the copy draft/publish
     * cycle: an image is either the right one or it is not, and there is no
     * half-translated state to hold back.
     */
    public async assignSlot(slotKey: string, mediaId: string, actor: SlotActor) {

        this.assertKnownSlot(slotKey);

        await this.requireMedia(mediaId);

        await this.database.contentImageSlot.upsert({
            where: { slotKey },

            create: {
                slotKey,
                mediaId,
                publishedAt: new Date(),
                updatedBy  : actor.actorId ?? null,
            },

            update: {
                mediaId,
                publishedAt: new Date(),
                updatedBy  : actor.actorId ?? null,
            },
        });

        // Same treatment copy and territories get. Without this an image swap
        // sat behind the 60s revalidate window while every other kind of edit
        // was live in about a second.
        await this.contentService.requestSiteRevalidation();

        return { success: true, slotKey };
    }

    /**
     * Send a slot back to the image that shipped.
     *
     * Deleting the row rather than blanking it is the point, exactly as with
     * copy: git still holds the default, so "restore the original" is a delete
     * and cannot itself be wrong.
     */
    public async clearSlot(slotKey: string) {

        this.assertKnownSlot(slotKey);

        await this.database.contentImageSlot
            .delete({ where: { slotKey } })
            // Already on the default. Clearing an unassigned slot is the
            // outcome the caller asked for, not an error.
            .catch(() => undefined);

        await this.contentService.requestSiteRevalidation();

        return { success: true, slotKey };
    }

    /**
     * The MIME + size policy, applied identically on presign and on confirm.
     */
    private assertAcceptableFile(mimeType: string, fileSize: number) {

        const normalized = mimeType?.trim().toLowerCase();

        // Checked ahead of the allowlist so the refusal explains itself
        // instead of reading as "png, jpeg, webp, avif" and leaving the person
        // to guess why their icon is unwelcome.
        if ((SVG_MIME_TYPES as readonly string[]).includes(normalized)) {
            throw new BadRequestException(SVG_REJECTION_MESSAGE);
        }

        if (!(MEDIA_ALLOWED_MIME as readonly string[]).includes(normalized)) {
            throw new BadRequestException(
                `${mimeType} is not an accepted image type. Allowed: ${MEDIA_ALLOWED_MIME.join(', ')}.`,
            );
        }

        if (typeof fileSize !== 'number' || fileSize <= 0) {
            throw new BadRequestException('That file is empty');
        }

        if (fileSize > MEDIA_MAX_FILE_SIZE) {
            const maxMb = Math.round(MEDIA_MAX_FILE_SIZE / (1024 * 1024));

            throw new BadRequestException(
                `That image is larger than the ${maxMb} MB limit. Export it smaller — site images load on every visit.`,
            );
        }
    }

    /**
     * The storage key for a new upload.
     *
     * The caller's file name is kept only as a readable suffix, stripped to a
     * safe character set — it is a label, never a path. A UUID does the actual
     * uniqueness work, so two people uploading `logo.png` cannot overwrite
     * each other's image (or an image a slot is already pointing at).
     */
    private buildMediaKey(fileName: string): string {

        const safeFileName =
            fileName
                .trim()
                .replace(/[^A-Za-z0-9._-]+/g, '_')
                .replace(/^[._]+|_+$/g, '')
                .slice(0, 100) || 'image';

        return `${MEDIA_KEY_PREFIX}${randomUUID()}-${safeFileName}`;
    }

    private assertKnownSlot(slotKey: string) {
        if (!isMediaSlotKey(slotKey)) {
            throw new BadRequestException(
                `"${slotKey}" is not an image slot on this site. Known slots: ${MEDIA_SLOT_KEYS.join(', ')}.`,
            );
        }
    }

    private async requireMedia(id: string) {
        const media = await this.database.contentMedia.findUnique({ where: { id } });

        if (!media) {
            throw new NotFoundException('That image was not found in the media library');
        }

        return media;
    }

    /**
     * Storage key in, a shape the admin panel can render out.
     *
     * `url` is `null` when media storage is unconfigured, which the Studio
     * shows as "storage not configured" rather than a broken thumbnail.
     */
    private present(media: {
        id: string;
        fileKey: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        width: number | null;
        height: number | null;
        altEn: string | null;
        altEs: string | null;
        createdAt: Date;
    }) {
        return {
            id       : media.id,
            fileKey  : media.fileKey,
            fileName : media.fileName,
            mimeType : media.mimeType,
            fileSize : media.fileSize,
            width    : media.width,
            height   : media.height,
            altEn    : media.altEn,
            altEs    : media.altEs,
            createdAt: media.createdAt,
            url      : this.storage.publicUrlFor(media.fileKey),
        };
    }
}
