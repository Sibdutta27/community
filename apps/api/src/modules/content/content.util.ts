/**
 * Pure helpers shared by the content sync script and the write path.
 *
 * They live here rather than in `prisma/scripts/` for two reasons: the API
 * validates an incoming override against exactly the same placeholder rule the
 * sync used to record it, and jest only discovers specs under `src/`.
 */

/**
 * Namespaces a non-developer may edit.
 *
 * Everything else — enrollment, profile, auth, errors, dashboard, feedback,
 * consent, common — is application UI welded to form logic, validation
 * messages and legal declarations. Those stay developer-owned and the API
 * refuses overrides for them; hiding them in the editor is not enough.
 */
export const EDITABLE_NAMESPACES: ReadonlySet<string> = new Set([
    'home',
    'about',
    'yucayeke',
    'yucayekeMap',
    'services',
    'community',
    'contact',
    'support',
    'footer',
    'nav',
    'metadata',
]);

export function isEditableKeyPath(keyPath: string): boolean {
    return EDITABLE_NAMESPACES.has(keyPath.split('.')[0]);
}

/**
 * ICU arguments (`{name}`, `{count, plural, …}`) and next-intl rich-text tags
 * (`<highlight>`), which `t.rich` maps to React components.
 *
 * Both are load-bearing. next-intl throws when a message declares an argument
 * that is not supplied, and a dropped tag breaks the render — so an override
 * must carry exactly the same set as the default it replaces. `home.hero.title`
 * is `Welcome to <highlight>…</highlight>`, which is both the most edited
 * string on the site and the easiest one to break.
 */
export function extractPlaceholders(value: string): string[] {
    const tokens = new Set<string>();

    for (const match of value.matchAll(/\{\s*(\w+)/g)) {
        tokens.add(`{${match[1]}}`);
    }

    for (const match of value.matchAll(/<(\w+)>/g)) {
        tokens.add(`<${match[1]}>`);
    }

    return [...tokens].sort();
}

/**
 * True when both strings declare the same placeholders, in any order.
 */
export function placeholdersMatch(a: string, b: string): boolean {
    const left = extractPlaceholders(a);
    const right = extractPlaceholders(b);

    return (
        left.length === right.length
        && left.every((token, index) => token === right[index])
    );
}

export type CatalogLeaf = {
    keyPath: string;
    value: string;
    isArrayLeaf: boolean;
};

/**
 * Flatten a message catalog to dotted paths — the SAME shape as
 * `collectKeyPaths` in `apps/web/src/i18n/messages.test.ts`, so the registry
 * and the parity test agree on what a key is.
 *
 * Array entries become numeric segments (`yucayeke.welcome.paragraphs.0`) and
 * are flagged: the merge on the web side has to write back into a real Array,
 * because assigning `obj["0"]` would turn it into an object and break every
 * `.map()` over it.
 */
export function flattenCatalog(
    value: unknown,
    prefix = '',
    insideArray = false,
): CatalogLeaf[] {
    if (Array.isArray(value)) {
        return value.flatMap((child, index) =>
            flattenCatalog(
                child,
                prefix ? `${prefix}.${index}` : String(index),
                true,
            ),
        );
    }

    if (typeof value === 'object' && value !== null) {
        return Object.entries(value as Record<string, unknown>).flatMap(
            ([key, child]) =>
                flattenCatalog(child, prefix ? `${prefix}.${key}` : key, false),
        );
    }

    return [
        {
            keyPath: prefix,
            value: String(value),
            isArrayLeaf: insideArray,
        },
    ];
}
