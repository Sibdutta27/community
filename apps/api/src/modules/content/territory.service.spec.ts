import {
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

import { TERRITORY_SLUGS } from './territory.catalog';
import { TerritoryService } from './territory.service';

function buildService() {

    const territoryOverride = {
        findMany : jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        upsert   : jest.fn().mockImplementation(({ create }) => create),
        delete   : jest.fn().mockResolvedValue({}),
    };

    const database = { territoryOverride };

    const contentService = { requestSiteRevalidation: jest.fn() };

    const service = new TerritoryService(
        database as never,
        contentService as never,
    );

    return { service, territoryOverride, contentService };
}

describe('TerritoryService — the slug gate', () => {

    // The slug is the join key between the database row, the URL
    // `/yucayeke/<slug>`, and the code's territory table. A row keyed on a slug
    // the code does not have is invisible forever: it can never be rendered and
    // can never be found again to delete.
    it('refuses to write an override for an unknown yukayeke', async () => {
        const { service, territoryOverride } = buildService();

        await expect(
            service.saveOverride('atlantis', { displayName: 'Atlantis' }, {}),
        ).rejects.toBeInstanceOf(NotFoundException);

        expect(territoryOverride.upsert).not.toHaveBeenCalled();
    });

    it('refuses to revert an unknown yukayeke', async () => {
        const { service, territoryOverride } = buildService();

        await expect(service.revert('atlantis', {})).rejects.toBeInstanceOf(
            NotFoundException,
        );

        expect(territoryOverride.delete).not.toHaveBeenCalled();
    });

    it('checks the slug before touching the database', async () => {
        const { service, territoryOverride } = buildService();

        await expect(
            service.saveOverride('', { displayName: 'x' }, {}),
        ).rejects.toBeInstanceOf(NotFoundException);

        expect(territoryOverride.findUnique).not.toHaveBeenCalled();
    });

    it('accepts every slug the code actually ships', async () => {
        const { service } = buildService();

        for (const slug of TERRITORY_SLUGS) {
            await expect(
                service.saveOverride(slug, { cacique: 'Someone' }, {}),
            ).resolves.toBeDefined();
        }
    });
});

describe('TerritoryService — the status gate', () => {

    // `status` drives a two-value badge and a `status.<value>` message lookup.
    // A third value renders an unstyled badge AND throws a missing-message
    // error out of next-intl, which takes the page down rather than looking odd.
    it('refuses a status the site cannot render', async () => {
        const { service, territoryOverride } = buildService();

        await expect(
            service.saveOverride('aymaco', { status: 'unconfirmed' }, {}),
        ).rejects.toBeInstanceOf(BadRequestException);

        expect(territoryOverride.upsert).not.toHaveBeenCalled();
    });

    it('refuses a near-miss of a valid status', async () => {
        const { service } = buildService();

        await expect(
            service.saveOverride('aymaco', { status: 'Confirmed' }, {}),
        ).rejects.toThrow(/confirmed/);
    });

    it('accepts both statuses the site knows how to draw', async () => {
        const { service } = buildService();

        for (const status of ['confirmed', 'oralTradition']) {
            await expect(
                service.saveOverride('aymaco', { status }, {}),
            ).resolves.toBeDefined();
        }
    });
});

describe('TerritoryService.saveOverride', () => {

    it('upserts on the slug and records who wrote it', async () => {
        const { service, territoryOverride } = buildService();

        await service.saveOverride(
            'aymaco',
            {
                displayName   : 'Aymamón',
                cacique       : 'Aymamón',
                altNames      : ['Aimako'],
                municipalities: ['Aguadilla'],
                status        : 'confirmed',
            },
            { actorId: 'admin-1' },
        );

        expect(territoryOverride.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                where : { slug: 'aymaco' },
                create: expect.objectContaining({
                    slug       : 'aymaco',
                    displayName: 'Aymamón',
                    altNames   : ['Aimako'],
                    updatedBy  : 'admin-1',
                }),
            }),
        );
    });

    // A territory override has no draft column to park an edit in, so a save IS
    // a publish. Stamping `publishedAt` is what makes it visible on the public
    // payload — an unstamped row is deliberately never served.
    it('stamps the row as published, because a save is live immediately', async () => {
        const { service, territoryOverride } = buildService();

        await service.saveOverride('aymaco', { cacique: 'Aymamón' }, {});

        expect(
            territoryOverride.upsert.mock.calls[0][0].create.publishedAt,
        ).toBeInstanceOf(Date);
    });

    // The web app caches `/content/messages` for a minute behind a bustable
    // tag. Without this the editor saves, reloads the site, and sees nothing.
    it('asks the site to drop its cached content', async () => {
        const { service, contentService } = buildService();

        await service.saveOverride('aymaco', { cacique: 'Aymamón' }, {});

        expect(contentService.requestSiteRevalidation).toHaveBeenCalled();
    });

    it('normalizes blank text to no override rather than storing whitespace', async () => {
        const { service, territoryOverride } = buildService();

        await service.saveOverride(
            'aymaco',
            { displayName: '   ', cacique: '' },
            {},
        );

        const { create } = territoryOverride.upsert.mock.calls[0][0];

        expect(create.displayName).toBeNull();
        expect(create.cacique).toBeNull();
    });

    it('drops blank list entries', async () => {
        const { service, territoryOverride } = buildService();

        await service.saveOverride(
            'aymaco',
            { municipalities: [' Moca ', '', '   ', 'Aguada'] },
            {},
        );

        expect(
            territoryOverride.upsert.mock.calls[0][0].create.municipalities,
        ).toEqual(['Moca', 'Aguada']);
    });
});

describe('TerritoryService.revert', () => {

    it('deletes the row so the code s values come back', async () => {
        const { service, territoryOverride } = buildService();
        territoryOverride.findUnique.mockResolvedValue({ slug: 'aymaco' });

        await service.revert('aymaco', { actorId: 'admin-1' });

        expect(territoryOverride.delete).toHaveBeenCalledWith({
            where: { slug: 'aymaco' },
        });
    });

    it('404s when there is nothing to revert', async () => {
        const { service } = buildService();

        await expect(service.revert('aymaco', {})).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });

    it('busts the site cache so the original name comes back at once', async () => {
        const { service, territoryOverride, contentService } = buildService();
        territoryOverride.findUnique.mockResolvedValue({ slug: 'aymaco' });

        await service.revert('aymaco', {});

        expect(contentService.requestSiteRevalidation).toHaveBeenCalled();
    });
});

describe('TerritoryService.listTerritories', () => {

    it('returns all 21 territories, overridden or not', async () => {
        const { service } = buildService();

        const result = await service.listTerritories();

        expect(result.count).toBe(21);
        expect(result.data).toHaveLength(21);
        expect(result.data.every((entry) => entry.override === null)).toBe(true);
    });

    // The Studio has to draw the locked facts (legal name, apiNames,
    // legacyNames) and pre-fill the editable ones. It has no copy of the
    // territory table, so the base values have to travel with the overrides.
    it('carries the code s values so the editor can show what it is overriding', async () => {
        const { service } = buildService();

        const aymaco = (await service.listTerritories()).data.find(
            (entry) => entry.slug === 'aymaco',
        );

        expect(aymaco).toMatchObject({
            slug       : 'aymaco',
            geometryKey: 'Aymaco',
            legalName  : 'Yukayeke Aymako',
            apiNames   : ['Aymaco'],
            legacyNames: ['Aymamon'],
            base       : expect.objectContaining({ displayName: 'Aymako' }),
        });
    });

    it('attaches an override to its territory', async () => {
        const { service, territoryOverride } = buildService();
        territoryOverride.findMany.mockResolvedValue([
            { slug: 'aymaco', displayName: 'Aymamón', altNames: [] },
        ]);

        const result = await service.listTerritories();

        expect(
            result.data.find((entry) => entry.slug === 'aymaco')?.override,
        ).toMatchObject({ displayName: 'Aymamón' });
    });

    // A row left behind by a slug that a developer later renamed must not
    // become a 22nd territory in the editor.
    it('ignores a stored row whose slug the code no longer has', async () => {
        const { service, territoryOverride } = buildService();
        territoryOverride.findMany.mockResolvedValue([
            { slug: 'atlantis', displayName: 'Atlantis' },
        ]);

        const result = await service.listTerritories();

        expect(result.data).toHaveLength(21);
        expect(result.data.some((entry) => entry.slug === 'atlantis')).toBe(
            false,
        );
    });
});
