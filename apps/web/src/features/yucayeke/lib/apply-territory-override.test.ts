import { describe, expect, it } from "vitest";

import {
  getTerritoryBySlug,
  resolveTerritory,
  TERRITORIES,
  type Territory,
} from "../content/territories";
import { applyTerritoryOverride } from "./apply-territory-override";

/**
 * The fields the Nation may edit in the Website Studio. Everything else on a
 * territory record is an identity fact the code owns.
 */
const EDITABLE_FIELDS = [
  "displayName",
  "cacique",
  "altNames",
  "municipalities",
  "status",
] as const;

/**
 * The fields that MUST survive any override untouched.
 *
 * `slug` and `geometryKey` are join keys (URLs, GeoJSON features); `legalName`
 * is the Nation's register entry; `apiNames` are the literal values stored in
 * `Enrollment.yucayeke`; `legacyNames` are superseded spellings kept only so
 * those stored values keep resolving. An override that reached any of them
 * would break a lookup, not a label.
 */
const LOCKED_FIELDS = [
  "slug",
  "geometryKey",
  "legalName",
  "apiNames",
  "legacyNames",
] as const;

/** Deterministic PRNG — a failing seed is reproducible, unlike Math.random. */
function makeRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
}

/**
 * Values chosen to hit every branch a careless implementation might have:
 * wrong primitive types, empty and blank strings, arrays of the wrong element
 * type, near-miss status strings, and prototype-shaped junk.
 */
const FUZZ_VALUES: readonly unknown[] = [
  "Hacked",
  "Aymako",
  "",
  "   ",
  "confirmed",
  "oralTradition",
  "Confirmed",
  "ORALTRADITION",
  "unconfirmed",
  "Bieque",
  "aymaco",
  "Yukayeke Nowhere",
  null,
  undefined,
  0,
  1,
  -1,
  Number.NaN,
  true,
  false,
  [],
  [""],
  ["   "],
  ["Solo"],
  ["Uno", "Dos", "Tres"],
  [null],
  [1, 2],
  [{ nope: true }],
  ["Mixed", 7, null, "Valid"],
  {},
  { nested: { deep: true } },
  () => "callable",
  Symbol.iterator.toString(),
];

const FUZZ_KEYS: readonly string[] = [
  ...LOCKED_FIELDS,
  ...EDITABLE_FIELDS,
  "__proto__",
  "constructor",
  "prototype",
  "toString",
  "unknownField",
];

function makeFuzzedOverride(random: () => number): Record<string, unknown> {
  const override: Record<string, unknown> = {};

  for (const key of FUZZ_KEYS) {
    // Roughly half the keys present on any given object, so partial overrides
    // (the common real shape) are exercised alongside saturated ones.
    if (random() < 0.5) continue;

    const value = FUZZ_VALUES[Math.floor(random() * FUZZ_VALUES.length)];

    // A computed key defines an own property rather than setting the
    // prototype, which is exactly the payload shape we want to be immune to.
    Object.defineProperty(override, key, {
      value,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }

  return override;
}

/** Every name any caller could plausibly hand to `resolveTerritory`. */
const RESOLVER_PROBES: readonly string[] = [
  ...TERRITORIES.flatMap((territory) => [
    territory.slug,
    territory.displayName,
    territory.legalName ?? "",
    territory.geometryKey ?? "",
    ...territory.apiNames,
    ...territory.altNames,
    ...territory.legacyNames,
  ]).filter(Boolean),
  "GUANÍA",
  "  Otoao ",
  "not-a-territory",
];

function snapshotResolver() {
  return RESOLVER_PROBES.map((probe) => ({
    probe,
    resolved: structuredClone(resolveTerritory(probe)),
  }));
}

describe("applyTerritoryOverride — the locked-field invariant", () => {
  /**
   * THE load-bearing test.
   *
   * `buildLookup()` indexes every territory by its slug, legal name, display
   * name, geometry key, apiNames, altNames and legacyNames, and silently keeps
   * the FIRST territory on a collision. If override data ever reached that
   * table — or mutated the records it holds — one yucayeke's members would
   * start resolving to another's, and nothing would say so.
   */
  it("never changes a locked field, whatever the override contains", () => {
    const random = makeRandom(20_260_812);
    const violations: string[] = [];

    for (let iteration = 0; iteration < 500; iteration += 1) {
      const override = makeFuzzedOverride(random);

      for (const territory of TERRITORIES) {
        const result = applyTerritoryOverride(territory, override);

        for (const field of LOCKED_FIELDS) {
          const before = territory[field];
          const after = result[field];

          const same = Array.isArray(before)
            ? Array.isArray(after) &&
              before.length === after.length &&
              before.every((entry, index) => entry === after[index])
            : before === after;

          if (!same) {
            violations.push(
              `${territory.slug}.${field}: ${JSON.stringify(before)} → ${JSON.stringify(after)} (override ${JSON.stringify(override)})`,
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  // A `status` outside the two-value union renders an unknown badge and throws
  // a missing-message error out of next-intl, taking the page down.
  it("only ever yields one of the two known statuses", () => {
    const random = makeRandom(7);
    const seen = new Set<unknown>();

    for (let iteration = 0; iteration < 500; iteration += 1) {
      const override = makeFuzzedOverride(random);

      for (const territory of TERRITORIES) {
        seen.add(applyTerritoryOverride(territory, override).status);
      }
    }

    expect([...seen].sort()).toEqual(["confirmed", "oralTradition"]);
  });

  // Mutating in place would be the easy implementation and the worst one: the
  // objects in TERRITORIES are the very objects held by the lookup table.
  it("leaves the catalog itself untouched", () => {
    const before = structuredClone(TERRITORIES) as Territory[];
    const random = makeRandom(99);

    for (let iteration = 0; iteration < 500; iteration += 1) {
      const override = makeFuzzedOverride(random);

      for (const territory of TERRITORIES) {
        applyTerritoryOverride(territory, override);
      }
    }

    expect(TERRITORIES).toEqual(before);
  });

  it("resolves every name to the same record after every override is applied", () => {
    const before = snapshotResolver();
    const random = makeRandom(31_337);

    for (let iteration = 0; iteration < 500; iteration += 1) {
      const override = makeFuzzedOverride(random);

      for (const territory of TERRITORIES) {
        applyTerritoryOverride(territory, override);
      }
    }

    expect(snapshotResolver()).toEqual(before);
  });
});

describe("applyTerritoryOverride — what an editor can actually change", () => {
  const aymaco = getTerritoryBySlug("aymaco") as Territory;

  it("applies every editable field", () => {
    const result = applyTerritoryOverride(aymaco, {
      displayName: "Aymamón",
      cacique: "Cacique Aymamón",
      altNames: ["Aimako", "Aymaco"],
      municipalities: ["Aguadilla"],
      status: "oralTradition",
    });

    expect(result.displayName).toBe("Aymamón");
    expect(result.cacique).toBe("Cacique Aymamón");
    expect(result.altNames).toEqual(["Aimako", "Aymaco"]);
    expect(result.municipalities).toEqual(["Aguadilla"]);
    expect(result.status).toBe("oralTradition");
  });

  it("trims whitespace rather than rendering it", () => {
    const result = applyTerritoryOverride(aymaco, {
      displayName: "  Aymamón  ",
      altNames: [" Aimako ", "", "   "],
    });

    expect(result.displayName).toBe("Aymamón");
    expect(result.altNames).toEqual(["Aimako"]);
  });

  // A blank field in the Studio means "I did not set this", never "erase the
  // shipped name" — a territory with no display name has no heading at all.
  it("keeps the code's value for a blank string", () => {
    const result = applyTerritoryOverride(aymaco, {
      displayName: "   ",
      cacique: "",
    });

    expect(result.displayName).toBe(aymaco.displayName);
    expect(result.cacique).toBe(aymaco.cacique);
  });

  // Prisma defaults both list columns to `[]`, so a row created to change only
  // the cacique arrives with empty lists. Treating that as "erase" would wipe
  // the municipalities off the site as a side effect of an unrelated edit.
  it("keeps the code's list for an empty list", () => {
    const result = applyTerritoryOverride(aymaco, {
      cacique: "Nuevo",
      altNames: [],
      municipalities: [],
    });

    expect(result.altNames).toEqual(aymaco.altNames);
    expect(result.municipalities).toEqual(aymaco.municipalities);
  });

  it("drops non-string list entries instead of rendering them", () => {
    const result = applyTerritoryOverride(aymaco, {
      municipalities: ["Moca", 7, null, { name: "Rincón" }, "Aguada"],
    });

    expect(result.municipalities).toEqual(["Moca", "Aguada"]);
  });

  it("ignores a status the site cannot render", () => {
    expect(
      applyTerritoryOverride(aymaco, { status: "unconfirmed" }).status,
    ).toBe(aymaco.status);
  });

  it("ignores an override that is not an object", () => {
    for (const junk of [null, undefined, "confirmed", 42, [], () => {}]) {
      expect(applyTerritoryOverride(aymaco, junk)).toBe(aymaco);
    }
  });

  // Referential stability keeps the render boundary cheap: an unedited
  // territory must not become a new object on every render.
  it("returns the very same record when nothing effectively changes", () => {
    expect(applyTerritoryOverride(aymaco, {})).toBe(aymaco);

    expect(
      applyTerritoryOverride(aymaco, {
        displayName: aymaco.displayName,
        status: aymaco.status,
        municipalities: [...aymaco.municipalities],
      }),
    ).toBe(aymaco);
  });
});
