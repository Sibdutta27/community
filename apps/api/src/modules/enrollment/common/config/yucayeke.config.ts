/**
 * OFFICIAL_YUCAYEKES — the single source of truth for the yucayeke select
 * (step 1). Served to the frontends via GET /enrollment/yucayekes and enforced
 * on the step-1 DTOs, so swapping this list updates validation + UI together.
 *
 * Source of truth: data/naming/yucayeke-names/ — the naming table delivered by
 * BTF at the 2026-07-20 sync, adopting Arawakan corrections over the
 * Spanish-inflected spellings. Values are the Nation's LEGAL names
 * ("Yukayeke <Name>"), because enrollment is the legal artifact; the map and
 * directory render the bare corrected name.
 *
 * NOTE: ancestry (steps 2/3) yucayeke fields intentionally stay free text —
 * grandparents' historical yucayekes may not appear on an official list.
 */
export const OFFICIAL_YUCAYEKES: readonly string[] = [
    'Yukayeke Aymako',
    'Yukayeke Abakoa',
    'Yukayeke Sibuko',
    'Yukayeke Toa',
    'Yukayeke Bayamon',
    'Yukayeke Wainabo',
    'Yukayeke Aimanio',
    'Yukayeke Kainabon',
    'Yukayeke Dawao',
    'Yukayeke Bieke',
    'Yukayeke Makao',
    'Yukayeke Wayanei',
    'Yukayeke Wayama',
    'Yukayeke Turabo',
    'Yukayeke Atiboniku',
    'Yukayeke Otoao',
    'Yukayeke Wainia',
    'Yukayeke Yawekax',
    // Not on the client's register of 18, but retained and still selectable —
    // members may already hold them and nothing is being eliminated. Pending
    // BTF's answer (see data/naming/yucayeke-names/README.md).
    'Guajataca',
    'Hayuya',
    'Loquillo',
];

/**
 * Superseded spellings that must still VALIDATE on write.
 *
 * `@IsIn` runs on every step-1 save, including draft saves of untouched
 * fields. Without these, a member whose enrollment already holds "Guaynía"
 * would get a 400 the next time they saved step 1 — a hard failure on a field
 * they never touched. Never served to the UI; accepted, then canonicalized.
 */
export const LEGACY_YUCAYEKES: readonly string[] = [
    'Abacoa',
    'Aymaco',
    'Arasibo',
    'Canóbana',
    'Caguax',
    'Daguao',
    'Guamaní',
    'Guaraca',
    'Guarionex (Otoao)',
    'Guayama',
    'Guaynía',
    'Humacao',
    'Mabodamaca',
    'Orocobix',
    'Urayoán (Yagüeca)',
    'Yuisa (Jaymanío)',
];

/** What `@IsIn` validates against: current list plus everything superseded. */
export const ACCEPTED_YUCAYEKE_VALUES: readonly string[] = [
    ...OFFICIAL_YUCAYEKES,
    ...LEGACY_YUCAYEKES,
];

/** Diacritic/case-insensitive key, mirroring the web `normalizeTerritoryName`. */
function normalizeYucayeke(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Superseded value -> current official value. Keyed by normalized spelling so
 * "guaynia" and "Guaynía" both land. Kept beside the lists above so the three
 * stay visibly in step.
 */
const CANONICAL_BY_LEGACY: ReadonlyMap<string, string> = new Map(
    Object.entries({
        Abacoa: 'Yukayeke Abakoa',
        Arasibo: 'Yukayeke Abakoa',
        Aymaco: 'Yukayeke Aymako',
        Canóbana: 'Yukayeke Kainabon',
        Caguax: 'Yukayeke Turabo',
        Daguao: 'Yukayeke Dawao',
        Guamaní: 'Yukayeke Wayama',
        Guaraca: 'Yukayeke Wayanei',
        'Guarionex (Otoao)': 'Yukayeke Otoao',
        Guayama: 'Yukayeke Wayama',
        Guaynía: 'Yukayeke Wainia',
        Humacao: 'Yukayeke Makao',
        Mabodamaca: 'Guajataca',
        Orocobix: 'Yukayeke Atiboniku',
        'Urayoán (Yagüeca)': 'Yukayeke Yawekax',
        'Yuisa (Jaymanío)': 'Yukayeke Aimanio',
    }).map(([legacy, current]) => [normalizeYucayeke(legacy), current]),
);

/**
 * Resolve any accepted spelling to the current official one.
 *
 * Applied on write AND on read. The read path is not cosmetic: the step-1
 * form feeds the stored value into a <select> whose options come from
 * OFFICIAL_YUCAYEKES, so an un-canonicalized legacy value matches nothing,
 * renders blank, and the member silently loses their declared yucayeke on the
 * next save.
 *
 * Unrecognized values pass through untouched — free text predating the
 * official list is not ours to rewrite or discard.
 */
export function canonicalizeYucayeke<T extends string | null | undefined>(
    value: T,
): T | string {
    if (!value) return value;

    const trimmed = value.trim();
    if (!trimmed) return value;

    return CANONICAL_BY_LEGACY.get(normalizeYucayeke(trimmed)) ?? trimmed;
}
