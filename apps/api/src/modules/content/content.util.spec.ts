import {
    EDITABLE_NAMESPACES,
    extractPlaceholders,
    flattenCatalog,
    isEditableKeyPath,
    placeholdersMatch,
} from './content.util';

describe('flattenCatalog', () => {

    it('produces dotted paths for nested objects', () => {
        expect(
            flattenCatalog({ home: { hero: { title: 'Welcome' } } }),
        ).toEqual([
            { keyPath: 'home.hero.title', value: 'Welcome', isArrayLeaf: false },
        ]);
    });

    // The catalog has exactly one array leaf today
    // (yucayeke.welcome.paragraphs). Flagging it is what lets the web-side
    // merge write back into a real Array instead of turning it into an object.
    it('addresses array entries by index and flags them', () => {
        expect(
            flattenCatalog({ yucayeke: { welcome: { paragraphs: ['One', 'Two'] } } }),
        ).toEqual([
            {
                keyPath: 'yucayeke.welcome.paragraphs.0',
                value: 'One',
                isArrayLeaf: true,
            },
            {
                keyPath: 'yucayeke.welcome.paragraphs.1',
                value: 'Two',
                isArrayLeaf: true,
            },
        ]);
    });

    it('does not flag a plain nested string as an array leaf', () => {
        const [leaf] = flattenCatalog({ a: { b: 'c' } });
        expect(leaf.isArrayLeaf).toBe(false);
    });
});

describe('extractPlaceholders', () => {

    it('finds ICU arguments', () => {
        expect(extractPlaceholders('Cacique {name}')).toEqual(['{name}']);
    });

    it('finds the argument name in a plural/select block', () => {
        expect(
            extractPlaceholders('{count, plural, one {# member} other {# members}}'),
        ).toEqual(['{count}']);
    });

    it('finds next-intl rich-text tags', () => {
        expect(
            extractPlaceholders('Welcome to <highlight>Borikén</highlight>'),
        ).toEqual(['<highlight>']);
    });

    it('returns a stable sorted set with no duplicates', () => {
        expect(extractPlaceholders('{a} {a} <b> {c}')).toEqual([
            '<b>',
            '{a}',
            '{c}',
        ]);
    });

    it('finds nothing in plain prose', () => {
        expect(extractPlaceholders('An ordinary sentence.')).toEqual([]);
    });
});

describe('placeholdersMatch', () => {

    // The rule that keeps an editor from taking a page down: next-intl throws
    // when a declared argument is missing, and a dropped rich tag breaks the
    // render.
    it('rejects an override that drops a rich-text tag', () => {
        expect(
            placeholdersMatch(
                'Welcome to <highlight>Borikén</highlight>',
                'Welcome to Borikén',
            ),
        ).toBe(false);
    });

    it('rejects an override that drops an ICU argument', () => {
        expect(placeholdersMatch('Cacique {name}', 'Cacique')).toBe(false);
    });

    it('rejects an override that invents a new argument', () => {
        expect(placeholdersMatch('Hello', 'Hello {name}')).toBe(false);
    });

    it('accepts a rewrite that keeps the same set, reordered', () => {
        expect(
            placeholdersMatch('{greeting}, {name}!', '{name} — {greeting}'),
        ).toBe(true);
    });

    it('accepts ordinary prose edits', () => {
        expect(placeholdersMatch('Old copy.', 'New copy entirely.')).toBe(true);
    });
});

describe('editable namespaces', () => {

    it('allows the marketing surfaces', () => {
        for (const namespace of ['home', 'about', 'services', 'yucayeke']) {
            expect(isEditableKeyPath(`${namespace}.some.key`)).toBe(true);
        }
    });

    // These carry validation messages, legal declarations and form logic —
    // an editor changing them can break enrollment, not just wording.
    it('refuses the developer-owned application UI', () => {
        for (const namespace of [
            'enrollment',
            'profile',
            'auth',
            'errors',
            'consent',
            'dashboard',
            'feedback',
            'common',
        ]) {
            expect(isEditableKeyPath(`${namespace}.some.key`)).toBe(false);
            expect(EDITABLE_NAMESPACES.has(namespace)).toBe(false);
        }
    });
});
