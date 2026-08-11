/**
 * Canonical table of the ancestral yucayeke territories of Borikén.
 *
 * Single source of truth joining three vocabularies that DO NOT agree on
 * spelling (see data/gis/yucayekeno-ecological-communities/README.md):
 *
 * - `geometryKey` — the exact `yucayeque` property value in
 *   `public/geo/yucayeke-boundaries.json` (contractor GIS, 27 features:
 *   18 named territories + 9 island polygons all named "Bieque" that form
 *   ONE logical territory). `null` = no polygon delivered yet.
 * - `apiNames` — the values of the backend's `OFFICIAL_YUCAYEKES` list
 *   (apps/api/src/modules/enrollment/common/config/yucayeke.config.ts),
 *   i.e. what `Enrollment.yucayeke` may contain. Largely cacique-flavored.
 * - `displayName` — the canonical member-facing spelling.
 *
 * Boundaries are interpretive reconstructions from historical and oral
 * sources — not survey lines. `status` distinguishes the 18 historically
 * documented territories from oral-tradition/unconfirmed ones per the
 * signed Yucayekeno Report (May 2025).
 */

export type TerritoryStatus = "confirmed" | "oralTradition";

export const TERRITORY_SLUGS = [
  "aymaco",
  "abacoa",
  "sibuco",
  "toa",
  "bayamon",
  "guaynabo",
  "hamanio",
  "canaibon",
  "dacuao",
  "macao",
  "guayaney",
  "guayama",
  "guania",
  "yaguecax",
  "otao",
  "guajataca",
  "jatobonico",
  "turabo",
  "bieque",
  "hayuya",
  "loquillo",
] as const;

export type TerritorySlug = (typeof TERRITORY_SLUGS)[number];

export type Territory = Readonly<{
  slug: TerritorySlug;
  geometryKey: string | null;
  /**
   * The Nation's official legal name, `Yukayeke <Name>`, from
   * `data/naming/yucayeke-names/`. `null` for the territories that are not on
   * the client's official register (see that README's open questions).
   */
  legalName: string | null;
  displayName: string;
  cacique: string | null;
  apiNames: readonly string[];
  /** Alternate spellings — RENDERED PUBLICLY as "Also known as". */
  altNames: readonly string[];
  /**
   * Superseded spellings kept ONLY so values already stored in
   * `Enrollment.yucayeke` keep resolving. Never rendered — that is the whole
   * point of splitting them out of `altNames`.
   */
  legacyNames: readonly string[];
  municipalities: readonly string[];
  status: TerritoryStatus;
}>;

export const TERRITORIES: readonly Territory[] = [
  {
    slug: "aymaco",
    geometryKey: "Aymaco",
    legalName: "Yukayeke Aymako",
    displayName: "Aymako",
    cacique: "Aymamón",
    apiNames: ["Aymaco"],
    altNames: ["Aimako"],
    legacyNames: ["Aymamon"],
    municipalities: ["Aguadilla", "Aguada", "Moca", "Rincón"],
    status: "confirmed",
  },
  {
    slug: "abacoa",
    geometryKey: "Abacoa",
    legalName: "Yukayeke Abakoa",
    displayName: "Abakoa",
    cacique: "Arasibo",
    apiNames: ["Abacoa", "Arasibo"],
    altNames: [],
    legacyNames: ["Arasibo"],
    municipalities: ["Arecibo", "Hatillo", "Camuy", "Barceloneta"],
    status: "confirmed",
  },
  {
    slug: "sibuco",
    geometryKey: "Sibuco",
    legalName: "Yukayeke Sibuko",
    displayName: "Sibuko",
    cacique: "Guacabo",
    apiNames: [],
    altNames: ["Cebuco"],
    legacyNames: ["Cibuco", "Sebuco", "Guacabo"],
    municipalities: ["Vega Baja", "Manatí"],
    status: "confirmed",
  },
  {
    slug: "toa",
    geometryKey: "Toa",
    legalName: "Yukayeke Toa",
    displayName: "Toa",
    cacique: "Aramaná",
    apiNames: [],
    altNames: [],
    legacyNames: ["Aramana"],
    municipalities: ["Vega Alta", "Dorado"],
    status: "confirmed",
  },
  {
    slug: "bayamon",
    geometryKey: "Bayamón",
    legalName: "Yukayeke Bayamon",
    displayName: "Bayamon",
    cacique: "Majagua",
    apiNames: [],
    altNames: ["Baiamon"],
    legacyNames: ["Majagua"],
    municipalities: ["Bayamón", "Toa Alta", "Toa Baja", "Cataño"],
    status: "confirmed",
  },
  {
    slug: "guaynabo",
    geometryKey: "Guaynabo",
    legalName: "Yukayeke Wainabo",
    displayName: "Wainabo",
    cacique: "Mabó",
    apiNames: [],
    altNames: ["Waynabo"],
    legacyNames: ["Mabo"],
    municipalities: ["Guaynabo"],
    status: "confirmed",
  },
  {
    slug: "hamanio",
    geometryKey: "Hamanio",
    legalName: "Yukayeke Aimanio",
    displayName: "Aimanio",
    cacique: "Yuisa",
    apiNames: ["Yuisa (Jaymanío)"],
    altNames: [],
    legacyNames: [
      "Yuisa (Jaymanío)",
      "Haimanio",
      "Jaymanio",
      "Haymanio",
      "Yuisa",
    ],
    municipalities: ["Loíza"],
    status: "confirmed",
  },
  {
    slug: "canaibon",
    geometryKey: "Canaibón",
    legalName: "Yukayeke Kainabon",
    displayName: "Kainabon",
    cacique: "Canóbana",
    apiNames: ["Canóbana"],
    altNames: ["Kainaibon", "Caynaibon", "Canaibon"],
    legacyNames: ["Canóbana", "Cayniabon"],
    municipalities: ["Canóvanas", "Río Grande"],
    status: "confirmed",
  },
  {
    slug: "dacuao",
    geometryKey: "Dacuao",
    legalName: "Yukayeke Dawao",
    displayName: "Dawao",
    cacique: "Daguao",
    apiNames: ["Daguao"],
    altNames: ["Dacuao"],
    legacyNames: ["Daguao", "Yuquibo", "Yukibo"],
    municipalities: ["Naguabo", "Fajardo", "Ceiba"],
    status: "confirmed",
  },
  {
    slug: "macao",
    geometryKey: "Macao",
    legalName: "Yukayeke Makao",
    displayName: "Makao",
    cacique: "Humacao",
    apiNames: ["Humacao"],
    altNames: [],
    legacyNames: ["Humacao", "Jumaca", "Jamacao"],
    municipalities: ["Humacao", "Yabucoa", "Las Piedras"],
    status: "confirmed",
  },
  {
    slug: "guayaney",
    geometryKey: "Guayaney",
    legalName: "Yukayeke Wayanei",
    displayName: "Wayanei",
    cacique: "Guaraca",
    apiNames: ["Guaraca"],
    altNames: ["Waianei"],
    legacyNames: ["Guaraca", "Guanaca"],
    municipalities: ["Patillas", "Maunabo"],
    status: "confirmed",
  },
  {
    slug: "guayama",
    geometryKey: "Guayama",
    legalName: "Yukayeke Wayama",
    displayName: "Wayama",
    cacique: "Guamaní",
    apiNames: ["Guayama", "Guamaní"],
    altNames: ["Waiama", "Wayamo"],
    legacyNames: ["Guamaní"],
    municipalities: ["Guayama", "Salinas", "Arroyo"],
    status: "confirmed",
  },
  {
    slug: "guania",
    geometryKey: "Guanía",
    legalName: "Yukayeke Wainia",
    displayName: "Wainia",
    cacique: "Agüeybaná",
    apiNames: ["Guaynía"],
    altNames: ["Wania", "Guainia"],
    legacyNames: ["Guaynía", "Agueybana"],
    municipalities: [
      "Cabo Rojo",
      "Guánica",
      "Yauco",
      "Guayanilla",
      "Peñuelas",
      "Ponce",
    ],
    status: "confirmed",
  },
  {
    slug: "yaguecax",
    geometryKey: "Yagüecax",
    legalName: "Yukayeke Yawekax",
    displayName: "Yawekax",
    cacique: "Urayoán",
    apiNames: ["Urayoán (Yagüeca)"],
    altNames: ["Yaweka", "Yagueca"],
    legacyNames: ["Urayoán (Yagüeca)", "Jaguecas", "Urayoán"],
    municipalities: ["Mayagüez", "Añasco", "Hormigueros"],
    status: "confirmed",
  },
  {
    slug: "otao",
    geometryKey: "Otao",
    legalName: "Yukayeke Otoao",
    displayName: "Otoao",
    cacique: "Guarionex",
    apiNames: ["Guarionex (Otoao)"],
    altNames: ["Utuao"],
    legacyNames: ["Guarionex (Otoao)", "Guarionex"],
    municipalities: ["Utuado", "Lares", "San Sebastián", "Adjuntas"],
    status: "confirmed",
  },
  {
    slug: "guajataca",
    geometryKey: "Guajataca",
    legalName: null,
    displayName: "Guajataca",
    cacique: "Mabodamaca",
    apiNames: ["Mabodamaca"],
    altNames: ["Guajataka"],
    legacyNames: ["Mabodamaca"],
    municipalities: ["Quebradillas", "Isabela", "San Sebastián"],
    status: "oralTradition",
  },
  {
    slug: "jatobonico",
    geometryKey: "Jatobonico",
    legalName: "Yukayeke Atiboniku",
    displayName: "Atiboniku",
    cacique: "Orocobix",
    apiNames: ["Orocobix"],
    altNames: ["Hatiboniku", "Jatibonicu", "Jatobonico"],
    legacyNames: ["Orocobix", "Atibonico", "Jatibonico"],
    municipalities: ["Orocovis", "Barranquitas", "Coamo", "Aibonito"],
    status: "confirmed",
  },
  {
    slug: "turabo",
    geometryKey: "Turabo",
    legalName: "Yukayeke Turabo",
    displayName: "Turabo",
    cacique: "Caguax",
    apiNames: ["Caguax"],
    altNames: [],
    legacyNames: ["Caguax"],
    municipalities: ["Caguas", "San Lorenzo", "Gurabo"],
    status: "confirmed",
  },
  {
    slug: "bieque",
    geometryKey: "Bieque",
    legalName: "Yukayeke Bieke",
    displayName: "Bieke",
    cacique: "Cacimar",
    apiNames: [],
    altNames: ["Byeke"],
    legacyNames: ["Vieques", "Cacimar"],
    municipalities: ["Vieques", "Culebra"],
    status: "confirmed",
  },
  {
    slug: "hayuya",
    geometryKey: null,
    legalName: null,
    displayName: "Hayuya",
    cacique: "Hayuya",
    apiNames: ["Hayuya"],
    altNames: ["Jayuya", "Coabey"],
    legacyNames: [],
    municipalities: ["Jayuya"],
    status: "oralTradition",
  },
  {
    slug: "loquillo",
    geometryKey: null,
    legalName: null,
    displayName: "Loquillo",
    cacique: "Loquillo",
    apiNames: ["Loquillo"],
    altNames: ["Luquillo"],
    legacyNames: [],
    municipalities: ["Luquillo"],
    status: "oralTradition",
  },
];

/** Diacritic/case-insensitive normalization shared by every lookup path. */
export function normalizeTerritoryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function buildLookup(): ReadonlyMap<string, Territory> {
  const lookup = new Map<string, Territory>();

  for (const territory of TERRITORIES) {
    const candidates = [
      territory.slug,
      territory.legalName ?? "",
      territory.displayName,
      territory.geometryKey ?? "",
      ...territory.legacyNames,
      ...territory.apiNames,
      ...territory.altNames,
      // "Guarionex (Otoao)" should also match as "Guarionex" and "Otoao".
      ...territory.apiNames.flatMap((name) =>
        name.includes("(")
          ? [
              name.replace(/\s*\(.*\)\s*/, ""),
              ...(/\(([^)]+)\)/.exec(name)?.slice(1) ?? []),
            ]
          : [],
      ),
    ];

    for (const candidate of candidates) {
      const key = normalizeTerritoryName(candidate);
      if (key) lookup.set(key, lookup.get(key) ?? territory);
    }
  }

  return lookup;
}

const TERRITORY_LOOKUP = buildLookup();

/**
 * Resolve any recorded yucayeke value (API name, display spelling, GeoJSON
 * key, or documented variant) to its canonical territory. Returns `null`
 * for unknown/empty values — callers must render a graceful fallback.
 */
export function resolveTerritory(
  value: string | null | undefined,
): Territory | null {
  if (!value) return null;
  return TERRITORY_LOOKUP.get(normalizeTerritoryName(value)) ?? null;
}

export function getTerritoryByGeometryKey(
  geometryKey: string,
): Territory | null {
  return (
    TERRITORIES.find((territory) => territory.geometryKey === geometryKey) ??
    null
  );
}

export function getTerritoryBySlug(slug: string): Territory | null {
  return TERRITORIES.find((territory) => territory.slug === slug) ?? null;
}
