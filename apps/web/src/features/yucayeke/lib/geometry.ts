import {
  getTerritoryByGeometryKey,
  type Territory,
} from "../content/territories";

/**
 * Pure planar geometry for the Borikén territory map.
 *
 * The GeoJSON (WGS84 lon/lat) is projected with a plain Web-Mercator
 * formula and fitted to a fixed viewBox — no d3/maplibre dependency, and
 * no spherical-winding hazards from the GDB-exported ring orientation.
 * Everything here is deterministic math so it runs (and is tested) in
 * jsdom without stubs.
 */

export type Position = readonly [number, number];
export type Ring = readonly Position[];
export type PolygonCoordinates = readonly Ring[];

export type TerritoryFeature = Readonly<{
  type: "Feature";
  properties: Readonly<{ yucayeque: string }>;
  geometry: Readonly<
    | { type: "Polygon"; coordinates: PolygonCoordinates }
    | { type: "MultiPolygon"; coordinates: readonly PolygonCoordinates[] }
  >;
}>;

export type TerritoryFeatureCollection = Readonly<{
  type: "FeatureCollection";
  features: readonly TerritoryFeature[];
}>;

export type TerritoryShape = Readonly<{
  geometryKey: string;
  territory: Territory | null;
  d: string;
  labelPoint: Position;
}>;

export const MAP_VIEWBOX = { width: 960, height: 480 } as const;

const MERCATOR_RADIUS = 6378137;

function project(position: Position): Position {
  const [lon, lat] = position;
  const x = (lon * Math.PI * MERCATOR_RADIUS) / 180;
  const y =
    MERCATOR_RADIUS * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  // Flip y: SVG grows downward, latitude grows upward.
  return [x, -y];
}

function collectPolygons(
  feature: TerritoryFeature,
): readonly PolygonCoordinates[] {
  return feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;
}

/** Planar area + centroid of a single ring (shoelace formula). */
function ringAreaAndCentroid(ring: readonly Position[]): {
  area: number;
  centroid: Position;
} {
  let doubleArea = 0;
  let centroidX = 0;
  let centroidY = 0;

  for (let index = 0; index < ring.length; index += 1) {
    const [x0, y0] = ring[index];
    const [x1, y1] = ring[(index + 1) % ring.length];
    const cross = x0 * y1 - x1 * y0;
    doubleArea += cross;
    centroidX += (x0 + x1) * cross;
    centroidY += (y0 + y1) * cross;
  }

  if (doubleArea === 0) {
    const [x, y] = ring[0] ?? [0, 0];
    return { area: 0, centroid: [x, y] };
  }

  return {
    area: Math.abs(doubleArea / 2),
    centroid: [centroidX / (3 * doubleArea), centroidY / (3 * doubleArea)],
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Project, fit, and flatten the feature collection into one drawable shape
 * per logical territory. Features sharing a `yucayeque` value (the nine
 * "Bieque" island polygons) merge into a single shape/path. The label
 * point is the centroid of each territory's largest outer ring, so
 * Bieque's label lands on Vieques rather than mid-ocean.
 */
export function buildTerritoryShapes(
  collection: TerritoryFeatureCollection,
  width: number = MAP_VIEWBOX.width,
  height: number = MAP_VIEWBOX.height,
  padding = 12,
): readonly TerritoryShape[] {
  const grouped = new Map<string, PolygonCoordinates[]>();

  for (const feature of collection.features) {
    const key = feature.properties.yucayeque;
    const polygons = grouped.get(key) ?? [];
    polygons.push(...collectPolygons(feature));
    grouped.set(key, polygons);
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const projected = new Map<string, PolygonCoordinates[]>();

  for (const [key, polygons] of grouped) {
    const projectedPolygons = polygons.map((polygon) =>
      polygon.map((ring) =>
        ring.map((position) => {
          const point = project(position);
          minX = Math.min(minX, point[0]);
          minY = Math.min(minY, point[1]);
          maxX = Math.max(maxX, point[0]);
          maxY = Math.max(maxY, point[1]);
          return point;
        }),
      ),
    );
    projected.set(key, projectedPolygons);
  }

  const scale = Math.min(
    (width - padding * 2) / (maxX - minX),
    (height - padding * 2) / (maxY - minY),
  );
  const offsetX = (width - (maxX - minX) * scale) / 2 - minX * scale;
  const offsetY = (height - (maxY - minY) * scale) / 2 - minY * scale;

  const toView = ([x, y]: Position): Position => [
    round(x * scale + offsetX),
    round(y * scale + offsetY),
  ];

  const shapes: TerritoryShape[] = [];

  for (const [key, polygons] of projected) {
    const pathParts: string[] = [];
    let largestArea = -Infinity;
    let labelPoint: Position = [0, 0];

    for (const polygon of polygons) {
      for (const [ringIndex, ring] of polygon.entries()) {
        const viewRing = ring.map(toView);
        pathParts.push(`M${viewRing.map(([x, y]) => `${x},${y}`).join("L")}Z`);

        if (ringIndex === 0) {
          const { area, centroid } = ringAreaAndCentroid(viewRing);
          if (area > largestArea) {
            largestArea = area;
            labelPoint = [round(centroid[0]), round(centroid[1])];
          }
        }
      }
    }

    shapes.push({
      geometryKey: key,
      territory: getTerritoryByGeometryKey(key),
      d: pathParts.join(""),
      labelPoint,
    });
  }

  return shapes;
}
