import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '@/database/database.service';

import { ContentService, type ActorInput } from './content.service';

import {
    getCatalogTerritory,
    isTerritoryStatus,
    TERRITORY_CATALOG,
    TERRITORY_STATUSES,
} from './territory.catalog';

/**
 * The five fields the Nation may edit on a territory. Everything else on the
 * record — slug, geometryKey, legalName, apiNames, legacyNames — is a join key
 * or a register fact, and lives only in the code.
 */
export interface TerritoryOverrideInput {
    displayName?: string | null;
    cacique?: string | null;
    altNames?: unknown;
    municipalities?: unknown;
    status?: string | null;
}

/**
 * Territory overrides for the Website Studio's Yukayeke tab.
 *
 * Same shape as the copy pipeline it sits beside: the git table is the source
 * of truth, the database holds a thin layer over it, and revert is a DELETE —
 * so restoring the shipped values cannot itself go wrong.
 *
 * Unlike a copy string, a territory row has no draft column to park an edit in,
 * so a save IS a publish. `publishedAt` is stamped on every write and the
 * public read requires it, which keeps a row written by any other path (a seed,
 * a hand-run SQL statement) off the site until something publishes it.
 */
@Injectable()
export class TerritoryService {

    constructor(
        private readonly database: DatabaseService,
        private readonly contentService: ContentService,
    ) { }

    /**
     * All 21 territories, each with the values the code ships and whatever
     * override is stored for it.
     *
     * Returns the whole catalog rather than only the overridden rows because
     * the Studio has no copy of the territory table: it needs the locked facts
     * to display and the shipped values to pre-fill the editor with. A stored
     * row whose slug the code no longer has is dropped, not surfaced.
     */
    public async listTerritories() {

        const rows = await this.database.territoryOverride.findMany();

        const bySlug = new Map(rows.map((row) => [row.slug, row]));

        const data = TERRITORY_CATALOG.map((territory) => ({
            slug       : territory.slug,
            geometryKey: territory.geometryKey,
            legalName  : territory.legalName,
            apiNames   : territory.apiNames,
            legacyNames: territory.legacyNames,

            base: {
                displayName   : territory.displayName,
                cacique       : territory.cacique,
                altNames      : territory.altNames,
                municipalities: territory.municipalities,
                status        : territory.status,
            },

            override: bySlug.get(territory.slug) ?? null,
        }));

        return { data, count: data.length };
    }

    /**
     * Create or replace one territory's override. Live on save.
     */
    public async saveOverride(
        slug: string,
        input: TerritoryOverrideInput,
        actor: ActorInput,
    ) {
        this.requireKnownSlug(slug);

        const status = this.readStatus(input.status);

        const data = {
            displayName   : readText(input.displayName),
            cacique       : readText(input.cacique),
            altNames      : readList(input.altNames),
            municipalities: readList(input.municipalities),
            status,
            publishedAt   : new Date(),
            updatedBy     : actor.actorId ?? null,
        };

        const saved = await this.database.territoryOverride.upsert({
            where : { slug },
            create: { slug, ...data },
            update: data,
        });

        await this.contentService.requestSiteRevalidation();

        return saved;
    }

    /**
     * Drop the override — the territory goes back to the values in the code.
     */
    public async revert(slug: string, actor: ActorInput) {

        this.requireKnownSlug(slug);

        // `actor` is accepted for symmetry with the copy pipeline but not
        // recorded: ContentRevision hangs off a ContentKey foreign key, and a
        // territory has no key to hang from. `updatedBy` on the row is the
        // whole audit trail this surface has.
        void actor;

        const existing = await this.database.territoryOverride.findUnique({
            where: { slug },
        });

        if (!existing) {
            throw new NotFoundException(
                'This yukayeke has no edits to restore',
            );
        }

        await this.database.territoryOverride.delete({ where: { slug } });

        await this.contentService.requestSiteRevalidation();

        return { success: true };
    }

    /**
     * The slug joins the stored row to the code's territory, to the public URL
     * and to the GeoJSON. A row keyed on anything else can never be rendered
     * and can never be found again — so it is refused before the database sees
     * it, exactly as `isEditableKeyPath` refuses a locked namespace.
     */
    private requireKnownSlug(slug: string) {
        if (!getCatalogTerritory(slug)) {
            throw new NotFoundException('Unknown yukayeke');
        }
    }

    private readStatus(value: string | null | undefined) {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        if (!isTerritoryStatus(value)) {
            throw new BadRequestException(
                `Status must be one of ${TERRITORY_STATUSES.join(', ')}`,
            );
        }

        return value;
    }
}

/**
 * Blank is "I did not set this", never "erase the shipped value" — a territory
 * with no display name has no heading at all.
 */
function readText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();

    return trimmed === '' ? null : trimmed;
}

function readList(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter((entry) => entry !== '');
}
