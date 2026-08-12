import type { Territory, TerritoryStatus } from "../content/territories";

/**
 * One territory's published override, as `GET /content/messages` carries it.
 *
 * Only the five editable fields exist here. There is deliberately no
 * `slug`/`geometryKey`/`legalName`/`apiNames`/`legacyNames` — see
 * `applyTerritoryOverride` for why that is a safety property and not a
 * convenience.
 */
export type TerritoryOverride = Readonly<{
  displayName?: string | null;
  cacique?: string | null;
  altNames?: readonly string[] | null;
  municipalities?: readonly string[] | null;
  status?: string | null;
}>;

export type TerritoryOverrideMap = Readonly<
  Record<string, TerritoryOverride | undefined>
>;

export const NO_TERRITORY_OVERRIDES: TerritoryOverrideMap = {};

/**
 * Layer a Website Studio override over one territory record — the whole of the
 * override feature on the web side, and a pure function on purpose.
 *
 * APPLY THIS AT THE RENDER BOUNDARY AND NOWHERE ELSE. `buildLookup()` in
 * `territories.ts` indexes every territory by its slug, legal name, display
 * name, geometry key, apiNames, altNames and legacyNames, and silently keeps
 * the FIRST territory on a normalized collision. Feed it override data and an
 * editor who types an alias another yucayeke already answers to would
 * re-route that yucayeke's members — with no error anywhere. Names that
 * RESOLVE come from git; names that are DISPLAYED may come from here.
 *
 * So this function is defined by what it refuses:
 *
 * - the five locked fields are copied from `territory`, never from `override`,
 *   which makes the invariant structural rather than a rule to remember;
 * - `override` is typed `unknown` because it arrives from the network — every
 *   value is type-checked before it is used;
 * - blank text and empty lists mean "not set", never "erase". Prisma defaults
 *   the list columns to `[]`, so a row created to change one field arrives
 *   with empty lists, and a territory with no display name has no heading;
 * - a `status` outside the two-value union is dropped: the site draws a badge
 *   from it and asks next-intl for `status.<value>`, so a third value takes
 *   the page down rather than merely looking wrong;
 * - the record is never mutated. The objects in `TERRITORIES` are the very
 *   objects the lookup table holds.
 *
 * Returns the original record when nothing effectively changes, so an unedited
 * territory stays referentially stable across renders.
 */
export function applyTerritoryOverride(
  territory: Territory,
  override: unknown,
): Territory {
  if (
    typeof override !== "object" ||
    override === null ||
    Array.isArray(override)
  ) {
    return territory;
  }

  const patch = override as Record<string, unknown>;

  const displayName = readText(patch.displayName) ?? territory.displayName;
  const cacique = readText(patch.cacique) ?? territory.cacique;
  const altNames = readList(patch.altNames) ?? territory.altNames;
  const municipalities =
    readList(patch.municipalities) ?? territory.municipalities;
  const status = readStatus(patch.status) ?? territory.status;

  const unchanged =
    displayName === territory.displayName &&
    cacique === territory.cacique &&
    status === territory.status &&
    sameList(altNames, territory.altNames) &&
    sameList(municipalities, territory.municipalities);

  if (unchanged) {
    return territory;
  }

  return {
    // Spreading the record — never the override — is what keeps slug,
    // geometryKey, legalName, apiNames and legacyNames out of reach.
    ...territory,
    displayName,
    cacique,
    altNames,
    municipalities,
    status,
  };
}

/** The same rule over the whole catalog, for list surfaces. */
export function applyTerritoryOverrides(
  territories: readonly Territory[],
  overrides: TerritoryOverrideMap,
): readonly Territory[] {
  return territories.map((territory) =>
    applyTerritoryOverride(territory, overrides[territory.slug]),
  );
}

function readText(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

function readList(value: unknown): readonly string[] | null {
  if (!Array.isArray(value)) return null;

  const entries = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");

  return entries.length === 0 ? null : entries;
}

function readStatus(value: unknown): TerritoryStatus | null {
  return value === "confirmed" || value === "oralTradition" ? value : null;
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((entry, index) => entry === b[index]);
}
