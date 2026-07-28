import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildTerritoryShapes,
  MAP_VIEWBOX,
  type TerritoryFeatureCollection,
} from "./geometry";

const geojson = JSON.parse(
  readFileSync(
    join(process.cwd(), "public/geo/yucayeke-boundaries.json"),
    "utf8",
  ),
) as TerritoryFeatureCollection;

describe("buildTerritoryShapes", () => {
  const shapes = buildTerritoryShapes(geojson);

  it("returns one shape per logical territory (Bieque merged)", () => {
    expect(shapes.length).toBe(19);
    expect(
      shapes.filter((shape) => shape.geometryKey === "Bieque").length,
    ).toBe(1);
  });

  it("produces non-empty closed path strings", () => {
    for (const shape of shapes) {
      expect(shape.d.startsWith("M"), shape.geometryKey).toBe(true);
      expect(shape.d.endsWith("Z"), shape.geometryKey).toBe(true);
    }
  });

  it("keeps every label point inside the viewBox", () => {
    for (const shape of shapes) {
      const [x, y] = shape.labelPoint;
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(MAP_VIEWBOX.width);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(MAP_VIEWBOX.height);
    }
  });

  it("links each shape to its canonical territory", () => {
    for (const shape of shapes) {
      expect(shape.territory, shape.geometryKey).not.toBeNull();
    }
    expect(
      shapes.find((shape) => shape.geometryKey === "Guanía")?.territory
        ?.cacique,
    ).toBe("Agüeybaná");
  });

  it("puts the Bieque label on the largest island (east of the mainland)", () => {
    const bieque = shapes.find((shape) => shape.geometryKey === "Bieque");
    const mainlandEasternmost = Math.max(
      ...shapes
        .filter((shape) => shape.geometryKey !== "Bieque")
        .map((shape) => shape.labelPoint[0]),
    );

    expect(bieque).toBeDefined();
    expect(bieque!.labelPoint[0]).toBeGreaterThan(mainlandEasternmost);
  });
});
