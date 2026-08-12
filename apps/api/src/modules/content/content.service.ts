import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '@/database/database.service';
import { ContentRevisionAction } from '@/generated/prisma/enums';

import { extractPlaceholders, isEditableKeyPath } from './content.util';
import { getCatalogTerritory, isTerritoryStatus } from './territory.catalog';

/** The single ContentVersion row. */
const VERSION_ID = 'site';

/** One territory's published override, as the public payload carries it. */
export interface PublishedTerritoryOverride {
    displayName?: string;
    cacique?: string;
    altNames?: string[];
    municipalities?: string[];
    status?: string;
}

interface TerritoryOverrideRow {
    slug: string;
    displayName: string | null;
    cacique: string | null;
    altNames: string[];
    municipalities: string[];
    status: string | null;
}

/**
 * Shape the stored rows into the layer the web app applies at its render
 * boundary. Three rules, each of which exists to stop a stored row doing
 * damage the code cannot undo:
 *
 * - a slug the code no longer ships is dropped, exactly as the write path
 *   refuses to create one;
 * - a status outside the two-value union is dropped — the site draws a badge
 *   from it and asks next-intl for a `status.<value>` message, so a third
 *   value takes the page down rather than looking wrong;
 * - an empty list is not an override. Prisma defaults both list columns to
 *   `[]`, so a row created to change only the cacique arrives with empty
 *   lists; sending them would erase the municipalities the code ships as a
 *   side effect of an unrelated edit.
 */
function buildTerritoryOverrides(rows: readonly TerritoryOverrideRow[]) {

    const territories: Record<string, PublishedTerritoryOverride> = {};

    for (const row of rows) {
        if (!getCatalogTerritory(row.slug)) {
            continue;
        }

        const entry: PublishedTerritoryOverride = {};

        if (row.displayName) entry.displayName = row.displayName;
        if (row.cacique) entry.cacique = row.cacique;
        if (row.altNames?.length) entry.altNames = row.altNames;
        if (row.municipalities?.length) {
            entry.municipalities = row.municipalities;
        }
        if (isTerritoryStatus(row.status)) entry.status = row.status;

        if (Object.keys(entry).length > 0) {
            territories[row.slug] = entry;
        }
    }

    return territories;
}

export interface SaveDraftInput {
    en?: string | null;
    es?: string | null;
    actorId?: string;
}

export interface ActorInput {
    actorId?: string;
    actorEmail?: string;
}

@Injectable()
export class ContentService {

    private readonly logger = new Logger(ContentService.name);

    constructor(
        private readonly database: DatabaseService,
    ) { }

    /**
     * Ask the web app to drop its cached content.
     *
     * Best-effort by design: the copy is already committed by the time this
     * runs, so a failure here only means the change appears within the web
     * app's revalidate window instead of immediately. It must never turn a
     * successful publish into a failed request.
     *
     * Public so `TerritoryService` can bust the same cache: both surfaces feed
     * the one `/content/messages` payload, so they must invalidate together.
     */
    public async requestSiteRevalidation() {

        const webBaseUrl = process.env.WEB_BASE_URL?.trim();
        const secret = process.env.CONTENT_REVALIDATE_SECRET?.trim();

        if (!webBaseUrl || !secret) {
            this.logger.warn(
                'WEB_BASE_URL or CONTENT_REVALIDATE_SECRET not set — published content will appear within the cache window rather than immediately',
            );
            return;
        }

        try {
            const response = await fetch(
                `${webBaseUrl}/api/revalidate/content`,
                {
                    method : 'POST',
                    headers: { 'x-content-revalidate-secret': secret },
                    signal : AbortSignal.timeout(3000),
                },
            );

            if (!response.ok) {
                this.logger.warn(
                    `Site revalidation returned ${response.status}`,
                );
            }
        } catch (error) {
            this.logger.warn(
                `Site revalidation failed: ${error instanceof Error ? error.message : 'unknown error'}`,
            );
        }
    }

    /**
     * Everything the public site needs, in one payload.
     *
     * Only PUBLISHED values, and only for keys that are still editable and not
     * retired — a key a developer removed must stop being served even if an
     * override outlived it. Deliberately unpaginated and unauthenticated: it
     * is read behind every page render and is cached at the edge.
     *
     * Territory overrides ride along here rather than getting their own
     * endpoint: the web app already makes exactly one cached fetch in front of
     * every render, and a second one would double that cost to deliver a few
     * dozen names.
     */
    public async getPublishedMessages() {

        const [rows, version, territoryRows] = await Promise.all([
            this.database.contentString.findMany({
                where: {
                    publishedAt: { not: null },

                    contentKey: {
                        editable : true,
                        retiredAt: null,
                    },
                },

                select: {
                    keyPath    : true,
                    publishedEn: true,
                    publishedEs: true,
                },
            }),

            this.database.contentVersion.findUnique({
                where: { id: VERSION_ID },
            }),

            this.database.territoryOverride.findMany({
                where: { publishedAt: { not: null } },

                select: {
                    slug          : true,
                    displayName   : true,
                    cacique       : true,
                    altNames      : true,
                    municipalities: true,
                    status        : true,
                },
            }),
        ]);

        const overrides: Record<string, { en?: string; es?: string }> = {};

        for (const row of rows) {
            const entry: { en?: string; es?: string } = {};

            if (row.publishedEn !== null) entry.en = row.publishedEn;
            if (row.publishedEs !== null) entry.es = row.publishedEs;

            // A row with neither locale published is not an override.
            if (entry.en !== undefined || entry.es !== undefined) {
                overrides[row.keyPath] = entry;
            }
        }

        return {
            version: version?.version ?? 0,
            overrides,
            territories: buildTerritoryOverrides(territoryRows),
        };
    }

    /**
     * The editable catalog for the Studio: every editable key with its shipped
     * default and any draft/published override.
     *
     * Unpaginated on purpose — 368 rows is one payload, and the editor filters
     * client-side. Paginating would make "show me every unpublished change"
     * a multi-request problem for no benefit.
     */
    public async getEditableKeys(namespace?: string) {

        const keys = await this.database.contentKey.findMany({
            where: {
                editable : true,
                retiredAt: null,
                ...(namespace && { namespace }),
            },

            orderBy: [
                { namespace: 'asc' },
                { keyPath: 'asc' },
            ],

            select: {
                id          : true,
                keyPath     : true,
                namespace   : true,
                group       : true,
                defaultEn   : true,
                defaultEs   : true,
                isArrayLeaf : true,
                placeholders: true,

                override: {
                    select: {
                        draftEn    : true,
                        draftEs    : true,
                        publishedEn: true,
                        publishedEs: true,
                        publishedAt: true,
                        updatedAt  : true,
                    },
                },
            },
        });

        return {
            data : keys,
            count: keys.length,
        };
    }

    /**
     * Save a draft edit. Does not affect the live site.
     */
    public async saveDraft(keyPath: string, input: SaveDraftInput) {

        const key = await this.requireEditableKey(keyPath);

        this.assertPlaceholdersPreserved(key.defaultEn, input.en, 'English');
        this.assertPlaceholdersPreserved(key.defaultEs, input.es, 'Spanish');

        return this.database.contentString.upsert({
            where: { keyPath },

            create: {
                contentKeyId: key.id,
                keyPath,
                draftEn     : input.en ?? null,
                draftEs     : input.es ?? null,
                updatedBy   : input.actorId ?? null,
            },

            update: {
                draftEn  : input.en ?? null,
                draftEs  : input.es ?? null,
                updatedBy: input.actorId ?? null,
            },
        });
    }

    /**
     * Publish every pending draft at once, in one transaction.
     *
     * Site-wide rather than per-key: one or two people editing a small site do
     * not need release semantics, and a partial publish is how a page ends up
     * half-rewritten.
     */
    public async publish(actor: ActorInput) {

        const pending = await this.database.contentString.findMany({
            where: {
                OR: [
                    { draftEn: { not: null } },
                    { draftEs: { not: null } },
                ],
            },

            include: {
                contentKey: {
                    select: {
                        id       : true,
                        keyPath  : true,
                        editable : true,
                        retiredAt: true,
                    },
                },
            },
        });

        // A draft against a key that has since been retired or locked must not
        // go live; it is dropped from the publish and reported back.
        const publishable = pending.filter(
            (row) => row.contentKey.editable && row.contentKey.retiredAt === null,
        );

        const skipped = pending.length - publishable.length;

        if (publishable.length === 0) {
            return {
                published: 0,
                skipped,
                version  : await this.currentVersion(),
            };
        }

        const version = await this.database.$transaction(async (tx) => {

            for (const row of publishable) {
                const nextEn = row.draftEn ?? row.publishedEn;
                const nextEs = row.draftEs ?? row.publishedEs;

                await tx.contentString.update({
                    where: { id: row.id },

                    data: {
                        publishedEn: nextEn,
                        publishedEs: nextEs,
                        publishedAt: new Date(),
                        publishedBy: actor.actorId ?? null,
                        draftEn    : null,
                        draftEs    : null,
                    },
                });

                await tx.contentRevision.create({
                    data: {
                        contentKeyId: row.contentKeyId,
                        keyPath     : row.keyPath,
                        action      : ContentRevisionAction.PUBLISHED,
                        fromEn      : row.publishedEn,
                        fromEs      : row.publishedEs,
                        toEn        : nextEn,
                        toEs        : nextEs,
                        actorId     : actor.actorId ?? null,
                        actorEmail  : actor.actorEmail ?? null,
                    },
                });
            }

            const bumped = await tx.contentVersion.upsert({
                where : { id: VERSION_ID },
                create: { id: VERSION_ID, version: 1 },
                update: { version: { increment: 1 } },
            });

            return bumped.version;
        });

        await this.requestSiteRevalidation();

        return {
            published: publishable.length,
            skipped,
            version,
        };
    }

    /**
     * Drop an override entirely — the key goes back to its shipped default.
     *
     * Deleting the row rather than blanking it is the point: git still holds
     * the original copy, so revert is a delete and cannot itself be wrong.
     */
    public async revert(keyPath: string, actor: ActorInput) {

        const existing = await this.database.contentString.findUnique({
            where: { keyPath },
        });

        if (!existing) {
            throw new NotFoundException('No override exists for this key');
        }

        await this.database.$transaction(async (tx) => {

            await tx.contentRevision.create({
                data: {
                    contentKeyId: existing.contentKeyId,
                    keyPath,
                    action      : ContentRevisionAction.REVERTED,
                    fromEn      : existing.publishedEn,
                    fromEs      : existing.publishedEs,
                    toEn        : null,
                    toEs        : null,
                    actorId     : actor.actorId ?? null,
                    actorEmail  : actor.actorEmail ?? null,
                },
            });

            await tx.contentString.delete({
                where: { keyPath },
            });

            await tx.contentVersion.upsert({
                where : { id: VERSION_ID },
                create: { id: VERSION_ID, version: 1 },
                update: { version: { increment: 1 } },
            });
        });

        await this.requestSiteRevalidation();

        return { success: true };
    }

    /**
     * Discard every unpublished draft, leaving the live site untouched.
     */
    public async discardDrafts() {

        const result = await this.database.contentString.updateMany({
            where: {
                OR: [
                    { draftEn: { not: null } },
                    { draftEs: { not: null } },
                ],
            },

            data: {
                draftEn: null,
                draftEs: null,
            },
        });

        // A row that only ever held a draft is now empty and would otherwise
        // linger as a phantom "override" in the editor's counts.
        await this.database.contentString.deleteMany({
            where: {
                draftEn    : null,
                draftEs    : null,
                publishedAt: null,
            },
        });

        return { discarded: result.count };
    }

    public async getRevisions(query: { page?: number; limit?: number }) {

        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const [data, count] = await Promise.all([
            this.database.contentRevision.findMany({
                skip,
                take   : limit,
                orderBy: { createdAt: 'desc' },
            }),

            this.database.contentRevision.count(),
        ]);

        return { data, count };
    }

    private async currentVersion() {
        const row = await this.database.contentVersion.findUnique({
            where: { id: VERSION_ID },
        });

        return row?.version ?? 0;
    }

    private async requireEditableKey(keyPath: string) {

        // Checked before the DB so a locked namespace is refused even if the
        // registry is stale.
        if (!isEditableKeyPath(keyPath)) {
            throw new ForbiddenException(
                'This text is part of the application interface and is not editable here',
            );
        }

        const key = await this.database.contentKey.findUnique({
            where: { keyPath },
        });

        if (!key) {
            throw new NotFoundException('Unknown content key');
        }

        if (!key.editable) {
            throw new ForbiddenException(
                'This text is part of the application interface and is not editable here',
            );
        }

        if (key.retiredAt) {
            throw new BadRequestException(
                'This text is no longer used on the site',
            );
        }

        return key;
    }

    /**
     * An override must declare exactly the placeholders its default declares.
     *
     * next-intl throws when a message references an argument that was not
     * supplied, and a dropped rich-text tag breaks the render — so this is the
     * difference between a typo and a page that will not load.
     */
    private assertPlaceholdersPreserved(
        defaultValue: string,
        candidate: string | null | undefined,
        localeLabel: string,
    ) {
        if (candidate === null || candidate === undefined) {
            return;
        }

        if (candidate.trim() === '') {
            throw new BadRequestException(
                `${localeLabel} text cannot be empty — use revert to restore the original`,
            );
        }

        const expected = extractPlaceholders(defaultValue);
        const actual = extractPlaceholders(candidate);

        const missing = expected.filter((token) => !actual.includes(token));
        const added = actual.filter((token) => !expected.includes(token));

        if (missing.length > 0 || added.length > 0) {
            const parts: string[] = [];

            if (missing.length > 0) {
                parts.push(`must keep ${missing.join(', ')}`);
            }

            if (added.length > 0) {
                parts.push(`cannot introduce ${added.join(', ')}`);
            }

            throw new BadRequestException(
                `${localeLabel} text ${parts.join(' and ')}`,
            );
        }
    }
}
