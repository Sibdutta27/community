/**
 * The 21 ancestral yucayeke territories, mirrored for the Website Studio.
 *
 * SOURCE OF TRUTH: `apps/web/src/features/yucayeke/content/territories.ts`.
 * That file stays authoritative — it is what the public site renders, and what
 * `resolveTerritory` indexes. This is a read-only copy, kept here for exactly
 * two jobs the API cannot do without it:
 *
 * 1. Refusing an override keyed on a slug the site does not have. A row the
 *    code cannot match is invisible forever: never rendered, never found
 *    again. Same idea as `ACCEPTED_YUCAYEKE_VALUES` in the enrollment module.
 * 2. Giving the Studio the values it is overriding — the locked identity
 *    facts it must display, and the shipped values it pre-fills the editor
 *    with. The admin panel is a separate app with no import path into
 *    apps/web, so the alternative is a second mirror over there.
 *
 * Drift is contained by design: only `slug` is load-bearing (it gates writes),
 * and everything else is display material for one internal screen. If the web
 * table changes, the site is right and this is merely stale.
 */

/** The two editorial judgements the Nation owns; the site can draw no others. */
export const TERRITORY_STATUSES = ['confirmed', 'oralTradition'] as const;

export type TerritoryStatus = (typeof TERRITORY_STATUSES)[number];

export interface CatalogTerritory {
    slug: string;
    geometryKey: string | null;
    legalName: string | null;
    displayName: string;
    cacique: string | null;
    apiNames: readonly string[];
    altNames: readonly string[];
    legacyNames: readonly string[];
    municipalities: readonly string[];
    status: TerritoryStatus;
}

export const TERRITORY_CATALOG: readonly CatalogTerritory[] = [
    {
        slug          : 'aymaco',
        geometryKey   : 'Aymaco',
        legalName     : 'Yukayeke Aymako',
        displayName   : 'Aymako',
        cacique       : 'Aymamón',
        apiNames      : ['Aymaco'],
        altNames      : ['Aimako'],
        legacyNames   : ['Aymamon'],
        municipalities: ['Aguadilla', 'Aguada', 'Moca', 'Rincón'],
        status        : 'confirmed',
    },
    {
        slug          : 'abacoa',
        geometryKey   : 'Abacoa',
        legalName     : 'Yukayeke Abakoa',
        displayName   : 'Abakoa',
        cacique       : 'Arasibo',
        apiNames      : ['Abacoa', 'Arasibo'],
        altNames      : [],
        legacyNames   : ['Arasibo'],
        municipalities: ['Arecibo', 'Hatillo', 'Camuy', 'Barceloneta'],
        status        : 'confirmed',
    },
    {
        slug          : 'sibuco',
        geometryKey   : 'Sibuco',
        legalName     : 'Yukayeke Sibuko',
        displayName   : 'Sibuko',
        cacique       : 'Guacabo',
        apiNames      : [],
        altNames      : ['Cebuco'],
        legacyNames   : ['Cibuco', 'Sebuco', 'Guacabo'],
        municipalities: ['Vega Baja', 'Manatí'],
        status        : 'confirmed',
    },
    {
        slug          : 'toa',
        geometryKey   : 'Toa',
        legalName     : 'Yukayeke Toa',
        displayName   : 'Toa',
        cacique       : 'Aramaná',
        apiNames      : [],
        altNames      : [],
        legacyNames   : ['Aramana'],
        municipalities: ['Vega Alta', 'Dorado'],
        status        : 'confirmed',
    },
    {
        slug          : 'bayamon',
        geometryKey   : 'Bayamón',
        legalName     : 'Yukayeke Bayamon',
        displayName   : 'Bayamon',
        cacique       : 'Majagua',
        apiNames      : [],
        altNames      : ['Baiamon'],
        legacyNames   : ['Majagua'],
        municipalities: ['Bayamón', 'Toa Alta', 'Toa Baja', 'Cataño'],
        status        : 'confirmed',
    },
    {
        slug          : 'guaynabo',
        geometryKey   : 'Guaynabo',
        legalName     : 'Yukayeke Wainabo',
        displayName   : 'Wainabo',
        cacique       : 'Mabó',
        apiNames      : [],
        altNames      : ['Waynabo'],
        legacyNames   : ['Mabo'],
        municipalities: ['Guaynabo'],
        status        : 'confirmed',
    },
    {
        slug          : 'hamanio',
        geometryKey   : 'Hamanio',
        legalName     : 'Yukayeke Aimanio',
        displayName   : 'Aimanio',
        cacique       : 'Yuisa',
        apiNames      : ['Yuisa (Jaymanío)'],
        altNames      : [],
        legacyNames   : [
            'Yuisa (Jaymanío)',
            'Haimanio',
            'Jaymanio',
            'Haymanio',
            'Yuisa',
        ],
        municipalities: ['Loíza'],
        status        : 'confirmed',
    },
    {
        slug          : 'canaibon',
        geometryKey   : 'Canaibón',
        legalName     : 'Yukayeke Kainabon',
        displayName   : 'Kainabon',
        cacique       : 'Canóbana',
        apiNames      : ['Canóbana'],
        altNames      : ['Kainaibon', 'Caynaibon', 'Canaibon'],
        legacyNames   : ['Canóbana', 'Cayniabon'],
        municipalities: ['Canóvanas', 'Río Grande'],
        status        : 'confirmed',
    },
    {
        slug          : 'dacuao',
        geometryKey   : 'Dacuao',
        legalName     : 'Yukayeke Dawao',
        displayName   : 'Dawao',
        cacique       : 'Daguao',
        apiNames      : ['Daguao'],
        altNames      : ['Dacuao'],
        legacyNames   : ['Daguao', 'Yuquibo', 'Yukibo'],
        municipalities: ['Naguabo', 'Fajardo', 'Ceiba'],
        status        : 'confirmed',
    },
    {
        slug          : 'macao',
        geometryKey   : 'Macao',
        legalName     : 'Yukayeke Makao',
        displayName   : 'Makao',
        cacique       : 'Humacao',
        apiNames      : ['Humacao'],
        altNames      : [],
        legacyNames   : ['Humacao', 'Jumaca', 'Jamacao'],
        municipalities: ['Humacao', 'Yabucoa', 'Las Piedras'],
        status        : 'confirmed',
    },
    {
        slug          : 'guayaney',
        geometryKey   : 'Guayaney',
        legalName     : 'Yukayeke Wayanei',
        displayName   : 'Wayanei',
        cacique       : 'Guaraca',
        apiNames      : ['Guaraca'],
        altNames      : ['Waianei'],
        legacyNames   : ['Guaraca', 'Guanaca'],
        municipalities: ['Patillas', 'Maunabo'],
        status        : 'confirmed',
    },
    {
        slug          : 'guayama',
        geometryKey   : 'Guayama',
        legalName     : 'Yukayeke Wayama',
        displayName   : 'Wayama',
        cacique       : 'Guamaní',
        apiNames      : ['Guayama', 'Guamaní'],
        altNames      : ['Waiama', 'Wayamo'],
        legacyNames   : ['Guamaní'],
        municipalities: ['Guayama', 'Salinas', 'Arroyo'],
        status        : 'confirmed',
    },
    {
        slug          : 'guania',
        geometryKey   : 'Guanía',
        legalName     : 'Yukayeke Wainia',
        displayName   : 'Wainia',
        cacique       : 'Agüeybaná',
        apiNames      : ['Guaynía'],
        altNames      : ['Wania', 'Guainia'],
        legacyNames   : ['Guaynía', 'Agueybana'],
        municipalities: [
            'Cabo Rojo',
            'Guánica',
            'Yauco',
            'Guayanilla',
            'Peñuelas',
            'Ponce',
        ],
        status: 'confirmed',
    },
    {
        slug          : 'yaguecax',
        geometryKey   : 'Yagüecax',
        legalName     : 'Yukayeke Yawekax',
        displayName   : 'Yawekax',
        cacique       : 'Urayoán',
        apiNames      : ['Urayoán (Yagüeca)'],
        altNames      : ['Yaweka', 'Yagueca'],
        legacyNames   : ['Urayoán (Yagüeca)', 'Jaguecas', 'Urayoán'],
        municipalities: ['Mayagüez', 'Añasco', 'Hormigueros'],
        status        : 'confirmed',
    },
    {
        slug          : 'otao',
        geometryKey   : 'Otao',
        legalName     : 'Yukayeke Otoao',
        displayName   : 'Otoao',
        cacique       : 'Guarionex',
        apiNames      : ['Guarionex (Otoao)'],
        altNames      : ['Utuao'],
        legacyNames   : ['Guarionex (Otoao)', 'Guarionex'],
        municipalities: ['Utuado', 'Lares', 'San Sebastián', 'Adjuntas'],
        status        : 'confirmed',
    },
    {
        slug          : 'guajataca',
        geometryKey   : 'Guajataca',
        legalName     : null,
        displayName   : 'Guajataca',
        cacique       : 'Mabodamaca',
        apiNames      : ['Mabodamaca'],
        altNames      : ['Guajataka'],
        legacyNames   : ['Mabodamaca'],
        municipalities: ['Quebradillas', 'Isabela', 'San Sebastián'],
        status        : 'oralTradition',
    },
    {
        slug          : 'jatobonico',
        geometryKey   : 'Jatobonico',
        legalName     : 'Yukayeke Atiboniku',
        displayName   : 'Atiboniku',
        cacique       : 'Orocobix',
        apiNames      : ['Orocobix'],
        altNames      : ['Hatiboniku', 'Jatibonicu', 'Jatobonico'],
        legacyNames   : ['Orocobix', 'Atibonico', 'Jatibonico'],
        municipalities: ['Orocovis', 'Barranquitas', 'Coamo', 'Aibonito'],
        status        : 'confirmed',
    },
    {
        slug          : 'turabo',
        geometryKey   : 'Turabo',
        legalName     : 'Yukayeke Turabo',
        displayName   : 'Turabo',
        cacique       : 'Caguax',
        apiNames      : ['Caguax'],
        altNames      : [],
        legacyNames   : ['Caguax'],
        municipalities: ['Caguas', 'San Lorenzo', 'Gurabo'],
        status        : 'confirmed',
    },
    {
        slug          : 'bieque',
        geometryKey   : 'Bieque',
        legalName     : 'Yukayeke Bieke',
        displayName   : 'Bieke',
        cacique       : 'Cacimar',
        apiNames      : [],
        altNames      : ['Byeke'],
        legacyNames   : ['Vieques', 'Cacimar'],
        municipalities: ['Vieques', 'Culebra'],
        status        : 'confirmed',
    },
    {
        slug          : 'hayuya',
        geometryKey   : null,
        legalName     : null,
        displayName   : 'Hayuya',
        cacique       : 'Hayuya',
        apiNames      : ['Hayuya'],
        altNames      : ['Jayuya', 'Coabey'],
        legacyNames   : [],
        municipalities: ['Jayuya'],
        status        : 'oralTradition',
    },
    {
        slug          : 'loquillo',
        geometryKey   : null,
        legalName     : null,
        displayName   : 'Loquillo',
        cacique       : 'Loquillo',
        apiNames      : ['Loquillo'],
        altNames      : ['Luquillo'],
        legacyNames   : [],
        municipalities: ['Luquillo'],
        status        : 'oralTradition',
    },
];

export const TERRITORY_SLUGS: readonly string[] = TERRITORY_CATALOG.map(
    (territory) => territory.slug,
);

const BY_SLUG = new Map(
    TERRITORY_CATALOG.map((territory) => [territory.slug, territory]),
);

export function getCatalogTerritory(slug: string): CatalogTerritory | null {
    return BY_SLUG.get(slug) ?? null;
}

export function isTerritoryStatus(value: unknown): value is TerritoryStatus {
    return TERRITORY_STATUSES.includes(value as TerritoryStatus);
}
