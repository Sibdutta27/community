import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type { TerritoryFeatureCollection } from "../lib/geometry";
import {
  normalizeTerritoryName,
  resolveTerritory,
  TERRITORIES,
} from "./territories";

/**
 * The SUPERSEDED official list, as it stood before the client's 2026-07-20
 * Arawakan corrections. Retained deliberately: these values are still held by
 * real `Enrollment.yucayeke` rows, so every one of them must keep resolving.
 * The current list is asserted against the client's CSV further down.
 */
const LEGACY_OFFICIAL_YUCAYEKES = [
  "Abacoa",
  "Aymaco",
  "Arasibo",
  "Canóbana",
  "Caguax",
  "Daguao",
  "Guamaní",
  "Guaraca",
  "Guarionex (Otoao)",
  "Guayama",
  "Guaynía",
  "Hayuya",
  "Humacao",
  "Loquillo",
  "Mabodamaca",
  "Orocobix",
  "Urayoán (Yagüeca)",
  "Yuisa (Jaymanío)",
] as const;

/**
 * Fixture copy of the contractor's cacique seat points
 * (data/gis/yucayekeno-ecological-communities/geojson/caciques.geojson,
 * untracked GIS drop) — each must fall inside its territory's polygon,
 * which mechanically proves every cross-vocabulary name join.
 */
const CACIQUE_SEATS: readonly {
  yucayeque: string;
  cacique: string;
  lonLat: readonly [number, number];
}[] = [
  { yucayeque: "Aymaco", cacique: "Aymamon", lonLat: [-67.155521, 18.36918] },
  { yucayeque: "Yagueca", cacique: "Urayoan", lonLat: [-66.97017, 18.228009] },
  {
    yucayeque: "Guajataca",
    cacique: "Mabodamaca",
    lonLat: [-66.854952, 18.314282],
  },
  {
    yucayeque: "Guaynia",
    cacique: "Agueybana",
    lonLat: [-66.788007, 18.076116],
  },
  { yucayeque: "Abacoa", cacique: "Arasibo", lonLat: [-66.708994, 18.414123] },
  { yucayeque: "Otoao", cacique: "Guarionex", lonLat: [-66.57055, 18.229739] },
  { yucayeque: "Sibuco", cacique: "Guacabo", lonLat: [-66.374497, 18.37696] },
  {
    yucayeque: "Jatibonico",
    cacique: "Orocobix",
    lonLat: [-66.301404, 18.222818],
  },
  { yucayeque: "Toa", cacique: "Aramana", lonLat: [-66.225123, 18.413259] },
  { yucayeque: "Guaynabo", cacique: "Mabo", lonLat: [-66.198938, 18.252446] },
  { yucayeque: "Bayamon", cacique: "Majagua", lonLat: [-66.124478, 18.380201] },
  { yucayeque: "Turabo", cacique: "Caguax", lonLat: [-66.065503, 18.214166] },
  { yucayeque: "Guayama", cacique: "Guamani", lonLat: [-66.174118, 18.101224] },
  {
    yucayeque: "Cayniabon",
    cacique: "Canobana",
    lonLat: [-65.994232, 18.334384],
  },
  {
    yucayeque: "Guayaney",
    cacique: "Guaraca",
    lonLat: [-65.938217, 18.117023],
  },
  { yucayeque: "Jaymanio", cacique: "Yuisa", lonLat: [-65.869223, 18.418228] },
  { yucayeque: "Macao", cacique: "Humacao", lonLat: [-65.881746, 18.228874] },
  { yucayeque: "Daguao", cacique: "Daguao", lonLat: [-65.738065, 18.29569] },
];

const geojson = JSON.parse(
  readFileSync(
    join(process.cwd(), "public/geo/yucayeke-boundaries.json"),
    "utf8",
  ),
) as TerritoryFeatureCollection;

/** Planar ray-cast point-in-polygon — immune to ring winding order. */
function ringContains(
  ring: readonly (readonly [number, number])[],
  [x, y]: readonly [number, number],
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function territoryContains(
  geometryKey: string,
  point: readonly [number, number],
): boolean {
  return geojson.features
    .filter((feature) => feature.properties.yucayeque === geometryKey)
    .some((feature) => {
      const polygons =
        feature.geometry.type === "Polygon"
          ? [feature.geometry.coordinates]
          : feature.geometry.coordinates;
      return polygons.some((polygon) =>
        ringContains(
          polygon[0] as readonly (readonly [number, number])[],
          point,
        ),
      );
    });
}

describe("territories content table", () => {
  it("has unique slugs", () => {
    const slugs = TERRITORIES.map((territory) => territory.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves every OFFICIAL_YUCAYEKES value", () => {
    for (const apiName of LEGACY_OFFICIAL_YUCAYEKES) {
      expect(resolveTerritory(apiName), apiName).not.toBeNull();
    }
  });

  it("maps every geometryKey to a geojson territory name and vice versa", () => {
    const geojsonNames = new Set(
      geojson.features.map((feature) => feature.properties.yucayeque),
    );
    const tableKeys = new Set(
      TERRITORIES.flatMap((territory) =>
        territory.geometryKey ? [territory.geometryKey] : [],
      ),
    );

    expect([...tableKeys].sort()).toEqual([...geojsonNames].sort());
  });

  it("groups the nine Bieque island polygons under one territory", () => {
    const biequeFeatures = geojson.features.filter(
      (feature) => feature.properties.yucayeque === "Bieque",
    );
    const biequeTerritories = TERRITORIES.filter(
      (territory) => territory.geometryKey === "Bieque",
    );

    expect(biequeFeatures.length).toBe(9);
    expect(biequeTerritories.length).toBe(1);
  });

  it("resolves diacritic- and case-insensitively", () => {
    expect(resolveTerritory("Guaynía")?.slug).toBe("guania");
    expect(resolveTerritory("guaynia")?.slug).toBe("guania");
    expect(resolveTerritory("GUANÍA")?.slug).toBe("guania");
    expect(resolveTerritory("  Otoao ")?.slug).toBe("otao");
    expect(resolveTerritory("Yagüeca")?.slug).toBe("yaguecax");
    expect(resolveTerritory("Jaymanío")?.slug).toBe("hamanio");
    expect(resolveTerritory("not-a-territory")).toBeNull();
    expect(resolveTerritory("")).toBeNull();
    expect(resolveTerritory(null)).toBeNull();
  });

  it("normalizes names by stripping diacritics and collapsing spaces", () => {
    expect(normalizeTerritoryName("  Yagüecax ")).toBe("yaguecax");
    expect(normalizeTerritoryName("Canóbana")).toBe("canobana");
  });

  /**
   * Contractor data QA snapshot: 9 of the 18 cacique seat points sit in a
   * NEIGHBORING polygon in both the full and simplified boundary layers
   * (label positions offset for readability, e.g. the narrow north-coast
   * slivers Sibuco/Toa/Bayamón). The name joins are still authoritative —
   * they come from the contractor's own Caciques attribute table. This
   * test pins the current geometric reality so a corrected re-delivery
   * (or a regression) surfaces loudly. Flagged back to the contractor.
   */
  const SEATS_OUTSIDE_THEIR_POLYGON = new Set([
    "Mabodamaca", // Guajataca seat lands in Otao
    "Guacabo", // Sibuco seat lands in Toa
    "Orocobix", // Jatibonicu seat lands in Turabo
    "Aramana", // Toa seat lands in Bayamón
    "Mabo", // Guaynabo seat lands in Turabo
    "Majagua", // Bayamón seat lands in Guaynabo
    "Guamani", // Guayama seat lands in Turabo
    "Guaraca", // Guayaney seat lands in Macao
    "Yuisa", // Hamanío seat lands in Canaibón
  ]);

  it("resolves every cacique seat name join and pins seat/polygon containment", () => {
    for (const seat of CACIQUE_SEATS) {
      const territory = resolveTerritory(seat.yucayeque);
      expect(territory, seat.yucayeque).not.toBeNull();
      expect(territory?.geometryKey, seat.yucayeque).not.toBeNull();
      expect(
        territoryContains(territory!.geometryKey!, seat.lonLat),
        `${seat.cacique} seat containment vs ${territory?.displayName}`,
      ).toBe(!SEATS_OUTSIDE_THEIR_POLYGON.has(seat.cacique));
    }
  });

  it("marks unmapped official territories for graceful UI fallback", () => {
    expect(resolveTerritory("Hayuya")?.geometryKey).toBeNull();
    expect(resolveTerritory("Loquillo")?.geometryKey).toBeNull();
  });
});

/** Minimal RFC-4180 reader — the client's notes column contains commas and newlines. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows;
  return body
    .filter((r) => r.some((c) => c !== ""))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const namingCsv = parseCsv(
  readFileSync(
    join(process.cwd(), "../../data/naming/yucayeke-names/yucayeke-names.csv"),
    "utf8",
  ),
).filter((r) => r.slug !== "_generic");

describe("client naming sheet parity", () => {
  it("covers every territory the client's sheet names", () => {
    expect(namingCsv).toHaveLength(18);

    for (const row of namingCsv) {
      const territory = TERRITORIES.find((t) => t.slug === row.slug);
      expect(
        territory,
        `no territory for CSV slug "${row.slug}"`,
      ).toBeDefined();
      expect(territory?.legalName).toBe(row.legalName);
      // The rule: primary display name is the legal name minus the prefix.
      expect(territory?.displayName).toBe(
        row.legalName.replace("Yukayeke ", "").trim(),
      );
    }
  });

  it("leaves territories absent from the sheet without a legal name", () => {
    const offRegister = TERRITORIES.filter((t) => t.legalName === null).map(
      (t) => t.slug,
    );

    // Retained on purpose — see data/naming/yucayeke-names/README.md.
    expect(offRegister).toEqual(["guajataca", "hayuya", "loquillo"]);
  });
});

describe("alias resolution safety", () => {
  // `buildLookup` keeps the FIRST territory on a normalized-key collision and
  // says nothing, so a duplicated spelling would silently route one
  // territory's members to another. This turns that into a red test.
  it("never lets two territories claim the same normalized alias", () => {
    const owners = new Map<string, string>();
    const clashes: string[] = [];

    for (const territory of TERRITORIES) {
      const candidates = [
        territory.slug,
        territory.legalName ?? "",
        territory.displayName,
        territory.geometryKey ?? "",
        ...territory.apiNames,
        ...territory.altNames,
        ...territory.legacyNames,
      ].filter(Boolean);

      for (const candidate of new Set(candidates.map(normalizeTerritoryName))) {
        const owner = owners.get(candidate);
        if (owner && owner !== territory.slug) {
          clashes.push(
            `"${candidate}" claimed by ${owner} and ${territory.slug}`,
          );
        }
        owners.set(candidate, territory.slug);
      }
    }

    expect(clashes).toEqual([]);
  });

  it("still resolves every superseded official spelling", () => {
    for (const name of LEGACY_OFFICIAL_YUCAYEKES) {
      expect(
        resolveTerritory(name),
        `"${name}" no longer resolves`,
      ).not.toBeNull();
    }
  });
});
