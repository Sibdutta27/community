import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';

import { ContentRevisionAction } from '@/generated/prisma/enums';

import { ContentService } from './content.service';

const HERO_KEY = {
    id       : 'key-1',
    keyPath  : 'home.hero.title',
    namespace: 'home',
    editable : true,
    retiredAt: null,
    defaultEn: 'Welcome to <highlight>Taíno Nation of Borikén</highlight>',
    defaultEs: 'Bienvenido a la <highlight>Nación Taíno de Borikén</highlight>',
};

function buildService(overrides: Record<string, unknown> = {}) {

    const contentKey = {
        findUnique: jest.fn().mockResolvedValue(HERO_KEY),
        findMany  : jest.fn().mockResolvedValue([]),
    };

    const contentString = {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany  : jest.fn().mockResolvedValue([]),
        upsert    : jest.fn().mockResolvedValue({}),
        update    : jest.fn().mockResolvedValue({}),
        delete    : jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    };

    const contentRevision = {
        create   : jest.fn().mockResolvedValue({}),
        findMany : jest.fn().mockResolvedValue([]),
        count    : jest.fn().mockResolvedValue(0),
    };

    const contentVersion = {
        findUnique: jest.fn().mockResolvedValue({ id: 'site', version: 4 }),
        upsert    : jest.fn().mockResolvedValue({ id: 'site', version: 5 }),
    };

    const tx = { contentString, contentRevision, contentVersion };

    const database = {
        contentKey,
        contentString,
        contentRevision,
        contentVersion,
        $transaction: jest.fn(async (cb: (t: unknown) => unknown) => cb(tx)),
        ...overrides,
    };

    const service = new ContentService(database as never);

    return { service, database, contentKey, contentString, contentRevision, contentVersion };
}

describe('ContentService.saveDraft — placeholder gate', () => {

    // The single most valuable rule in the feature. next-intl throws when a
    // message declares an argument that was not supplied, so dropping the tag
    // out of home.hero.title takes the homepage down rather than making a typo.
    it('refuses an edit that drops a rich-text tag', async () => {
        const { service } = buildService();

        await expect(
            service.saveDraft('home.hero.title', { en: 'Welcome to Borikén' }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('names the token that must be kept', async () => {
        const { service } = buildService();

        await expect(
            service.saveDraft('home.hero.title', { en: 'Welcome' }),
        ).rejects.toThrow(/<highlight>/);
    });

    it('refuses an edit that invents a placeholder', async () => {
        const { service } = buildService();

        await expect(
            service.saveDraft('home.hero.title', {
                en: 'Welcome <highlight>home</highlight> {name}',
            }),
        ).rejects.toThrow(/cannot introduce \{name\}/);
    });

    it('accepts a rewrite that keeps the tag', async () => {
        const { service, contentString } = buildService();

        await service.saveDraft('home.hero.title', {
            en: 'Kaya! <highlight>Taíno Nation of Borikén</highlight>',
        });

        expect(contentString.upsert).toHaveBeenCalled();
    });

    it('checks each locale against its own default', async () => {
        const { service } = buildService();

        await expect(
            service.saveDraft('home.hero.title', {
                en: 'Welcome <highlight>home</highlight>',
                es: 'Bienvenido',
            }),
        ).rejects.toThrow(/Spanish/);
    });

    // Blanking a field would publish an empty string over real copy; revert is
    // the way back to the default.
    it('refuses an empty string', async () => {
        const { service } = buildService();

        await expect(
            service.saveDraft('home.hero.title', { en: '   ' }),
        ).rejects.toThrow(/cannot be empty/);
    });
});

describe('ContentService.saveDraft — editable scope', () => {

    it('refuses a developer-owned namespace before touching the database', async () => {
        const { service, contentKey } = buildService();

        await expect(
            service.saveDraft('enrollment.confirmation.declaration', { en: 'x' }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(contentKey.findUnique).not.toHaveBeenCalled();
    });

    it('refuses a key the registry marks non-editable', async () => {
        const { service, contentKey } = buildService();
        contentKey.findUnique.mockResolvedValue({ ...HERO_KEY, editable: false });

        await expect(
            service.saveDraft('home.hero.title', { en: 'x' }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('refuses a retired key', async () => {
        const { service, contentKey } = buildService();
        contentKey.findUnique.mockResolvedValue({
            ...HERO_KEY,
            retiredAt: new Date(),
        });

        await expect(
            service.saveDraft('home.hero.title', { en: 'x' }),
        ).rejects.toThrow(/no longer used/);
    });

    it('refuses an unknown key', async () => {
        const { service, contentKey } = buildService();
        contentKey.findUnique.mockResolvedValue(null);

        await expect(
            service.saveDraft('home.hero.title', { en: 'x' }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});

describe('ContentService.publish', () => {

    const pendingRow = {
        id          : 'str-1',
        contentKeyId: 'key-1',
        keyPath     : 'home.hero.title',
        draftEn     : 'Kaya! <highlight>Borikén</highlight>',
        draftEs     : null,
        publishedEn : 'Old english',
        publishedEs : 'Viejo español',
        contentKey  : { id: 'key-1', keyPath: 'home.hero.title', editable: true, retiredAt: null },
    };

    it('moves draft to published, clears the draft, and bumps the version', async () => {
        const { service, contentString, contentVersion } = buildService();
        contentString.findMany.mockResolvedValue([pendingRow]);

        const result = await service.publish({ actorId: 'admin-1' });

        expect(contentString.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    publishedEn: 'Kaya! <highlight>Borikén</highlight>',
                    draftEn    : null,
                    draftEs    : null,
                }),
            }),
        );

        expect(contentVersion.upsert).toHaveBeenCalled();
        expect(result.published).toBe(1);
    });

    // A locale with no draft must keep what it already published, not be
    // blanked back to the git default — that would silently revert Spanish.
    it('leaves an unedited locale at its published value', async () => {
        const { service, contentString } = buildService();
        contentString.findMany.mockResolvedValue([pendingRow]);

        await service.publish({});

        expect(contentString.update.mock.calls[0][0].data.publishedEs).toBe(
            'Viejo español',
        );
    });

    it('writes an audit row naming the actor and both sides of the change', async () => {
        const { service, contentString, contentRevision } = buildService();
        contentString.findMany.mockResolvedValue([pendingRow]);

        await service.publish({ actorId: 'admin-1', actorEmail: 'a@example.com' });

        expect(contentRevision.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                action    : ContentRevisionAction.PUBLISHED,
                keyPath   : 'home.hero.title',
                fromEn    : 'Old english',
                toEn      : 'Kaya! <highlight>Borikén</highlight>',
                actorEmail: 'a@example.com',
            }),
        });
    });

    it('runs in a single transaction', async () => {
        const { service, database, contentString } = buildService();
        contentString.findMany.mockResolvedValue([pendingRow]);

        await service.publish({});

        expect(database.$transaction).toHaveBeenCalledTimes(1);
    });

    // A draft written before a developer locked or removed the key must not
    // reach the site just because it was queued first.
    it('skips a draft whose key was retired or locked since', async () => {
        const { service, contentString } = buildService();
        contentString.findMany.mockResolvedValue([
            { ...pendingRow, contentKey: { ...pendingRow.contentKey, retiredAt: new Date() } },
        ]);

        const result = await service.publish({});

        expect(result.published).toBe(0);
        expect(result.skipped).toBe(1);
        expect(contentString.update).not.toHaveBeenCalled();
    });

    it('does nothing and opens no transaction when there are no drafts', async () => {
        const { service, database } = buildService();

        const result = await service.publish({});

        expect(result.published).toBe(0);
        expect(database.$transaction).not.toHaveBeenCalled();
    });
});

describe('ContentService.revert', () => {

    it('deletes the override and records who reverted it', async () => {
        const { service, contentString, contentRevision } = buildService();
        contentString.findUnique.mockResolvedValue({
            contentKeyId: 'key-1',
            keyPath     : 'home.hero.title',
            publishedEn : 'Overridden',
            publishedEs : 'Anulado',
        });

        await service.revert('home.hero.title', { actorEmail: 'a@example.com' });

        expect(contentString.delete).toHaveBeenCalledWith({
            where: { keyPath: 'home.hero.title' },
        });

        expect(contentRevision.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                action: ContentRevisionAction.REVERTED,
                fromEn: 'Overridden',
                toEn  : null,
            }),
        });
    });

    it('404s when there is nothing to revert', async () => {
        const { service } = buildService();

        await expect(
            service.revert('home.hero.title', {}),
        ).rejects.toBeInstanceOf(NotFoundException);
    });
});

describe('ContentService.getPublishedMessages', () => {

    it('returns only the locales that are actually published', async () => {
        const { service, contentString } = buildService();
        contentString.findMany.mockResolvedValue([
            { keyPath: 'home.hero.title', publishedEn: 'EN only', publishedEs: null },
        ]);

        const result = await service.getPublishedMessages();

        expect(result.overrides['home.hero.title']).toEqual({ en: 'EN only' });
    });

    // A row that exists but has nothing published is a draft-only row; serving
    // it as an empty override would blank the string on the site.
    it('omits a row with neither locale published', async () => {
        const { service, contentString } = buildService();
        contentString.findMany.mockResolvedValue([
            { keyPath: 'home.hero.title', publishedEn: null, publishedEs: null },
        ]);

        const result = await service.getPublishedMessages();

        expect(result.overrides).toEqual({});
    });

    it('asks the database for published rows on live editable keys only', async () => {
        const { service, contentString } = buildService();

        await service.getPublishedMessages();

        expect(contentString.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    publishedAt: { not: null },
                    contentKey : { editable: true, retiredAt: null },
                },
            }),
        );
    });
});
