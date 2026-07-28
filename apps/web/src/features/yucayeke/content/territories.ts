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
  displayName: string;
  cacique: string | null;
  apiNames: readonly string[];
  altNames: readonly string[];
  municipalities: readonly string[];
  status: TerritoryStatus;
}>;

export const TERRITORIES: readonly Territory[] = [
  {
    slug: "aymaco",
    geometryKey: "Aymaco",
    displayName: "Aymaco",
    cacique: "Aymamón",
    apiNames: ["Aymaco"],
    altNames: ["Aymamon"],
    municipalities: ["Aguadilla", "Aguada", "Moca", "Rincón"],
    status: "confirmed",
  },
  {
    slug: "abacoa",
    geometryKey: "Abacoa",
    displayName: "Abacoa",
    cacique: "Arasibo",
    apiNames: ["Abacoa", "Arasibo"],
    altNames: [],
    municipalities: ["Arecibo", "Hatillo", "Camuy", "Barceloneta"],
    status: "confirmed",
  },
  {
    slug: "sibuco",
    geometryKey: "Sibuco",
    displayName: "Sibuco",
    cacique: "Guacabo",
    apiNames: [],
    altNames: ["Cibuco", "Sebuco", "Sibuko"],
    municipalities: ["Vega Baja", "Manatí"],
    status: "confirmed",
  },
  {
    slug: "toa",
    geometryKey: "Toa",
    displayName: "Toa",
    cacique: "Aramaná",
    apiNames: [],
    altNames: ["Aramana"],
    municipalities: ["Vega Alta", "Dorado"],
    status: "confirmed",
  },
  {
    slug: "bayamon",
    geometryKey: "Bayamón",
    displayName: "Bayamón",
    cacique: "Majagua",
    apiNames: [],
    altNames: ["Majagua"],
    municipalities: ["Bayamón", "Toa Alta", "Toa Baja", "Cataño"],
    status: "confirmed",
  },
  {
    slug: "guaynabo",
    geometryKey: "Guaynabo",
    displayName: "Guaynabo",
    cacique: "Mabó",
    apiNames: [],
    altNames: ["Mabo"],
    municipalities: ["Guaynabo"],
    status: "oralTradition",
  },
  {
    slug: "hamanio",
    geometryKey: "Hamanio",
    displayName: "Hamanío",
    cacique: "Yuisa",
    apiNames: ["Yuisa (Jaymanío)"],
    altNames: ["Haimanio", "Jaymanio", "Haymanio"],
    municipalities: ["Loíza"],
    status: "confirmed",
  },
  {
    slug: "canaibon",
    geometryKey: "Canaibón",
    displayName: "Canaibón",
    cacique: "Canóbana",
    apiNames: ["Canóbana"],
    altNames: ["Caynaibon", "Cayniabon"],
    municipalities: ["Canóvanas", "Río Grande"],
    status: "confirmed",
  },
  {
    slug: "dacuao",
    geometryKey: "Dacuao",
    displayName: "Daguao",
    cacique: "Daguao",
    apiNames: ["Daguao"],
    altNames: ["Yuquibo", "Yukibo"],
    municipalities: ["Naguabo", "Fajardo", "Ceiba"],
    status: "confirmed",
  },
  {
    slug: "macao",
    geometryKey: "Macao",
    displayName: "Macao",
    cacique: "Humacao",
    apiNames: ["Humacao"],
    altNames: ["Jumaca", "Jamacao"],
    municipalities: ["Humacao", "Yabucoa", "Las Piedras"],
    status: "confirmed",
  },
  {
    slug: "guayaney",
    geometryKey: "Guayaney",
    displayName: "Guayaney",
    cacique: "Guaraca",
    apiNames: ["Guaraca"],
    altNames: ["Guanaca"],
    municipalities: ["Patillas", "Maunabo"],
    status: "confirmed",
  },
  {
    slug: "guayama",
    geometryKey: "Guayama",
    displayName: "Guayama",
    cacique: "Guamaní",
    apiNames: ["Guayama", "Guamaní"],
    altNames: [],
    municipalities: ["Guayama", "Salinas", "Arroyo"],
    status: "confirmed",
  },
  {
    slug: "guania",
    geometryKey: "Guanía",
    displayName: "Guanía",
    cacique: "Agüeybaná",
    apiNames: ["Guaynía"],
    altNames: ["Guainia", "Agueybana"],
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
    displayName: "Yagüecax",
    cacique: "Urayoán",
    apiNames: ["Urayoán (Yagüeca)"],
    altNames: ["Yagueca", "Jaguecas"],
    municipalities: ["Mayagüez", "Añasco", "Hormigueros"],
    status: "confirmed",
  },
  {
    slug: "otao",
    geometryKey: "Otao",
    displayName: "Otoao",
    cacique: "Guarionex",
    apiNames: ["Guarionex (Otoao)"],
    altNames: ["Otao"],
    municipalities: ["Utuado", "Lares", "San Sebastián", "Adjuntas"],
    status: "confirmed",
  },
  {
    slug: "guajataca",
    geometryKey: "Guajataca",
    displayName: "Guajataca",
    cacique: "Mabodamaca",
    apiNames: ["Mabodamaca"],
    altNames: ["Guajataka"],
    municipalities: ["Quebradillas", "Isabela", "San Sebastián"],
    status: "oralTradition",
  },
  {
    slug: "jatobonico",
    geometryKey: "Jatobonico",
    displayName: "Jatibonicu",
    cacique: "Orocobix",
    apiNames: ["Orocobix"],
    altNames: ["Atibonico", "Jatibonico", "Jatobonico"],
    municipalities: ["Orocovis", "Barranquitas", "Coamo", "Aibonito"],
    status: "confirmed",
  },
  {
    slug: "turabo",
    geometryKey: "Turabo",
    displayName: "Turabo",
    cacique: "Caguax",
    apiNames: ["Caguax"],
    altNames: [],
    municipalities: ["Caguas", "San Lorenzo", "Gurabo"],
    status: "confirmed",
  },
  {
    slug: "bieque",
    geometryKey: "Bieque",
    displayName: "Bieque",
    cacique: "Cacimar",
    apiNames: [],
    altNames: ["Bieke", "Vieques"],
    municipalities: ["Vieques", "Culebra"],
    status: "confirmed",
  },
  {
    slug: "hayuya",
    geometryKey: null,
    displayName: "Hayuya",
    cacique: "Hayuya",
    apiNames: ["Hayuya"],
    altNames: ["Jayuya", "Coabey"],
    municipalities: ["Jayuya"],
    status: "oralTradition",
  },
  {
    slug: "loquillo",
    geometryKey: null,
    displayName: "Loquillo",
    cacique: "Loquillo",
    apiNames: ["Loquillo"],
    altNames: ["Luquillo"],
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
      territory.displayName,
      territory.geometryKey ?? "",
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
