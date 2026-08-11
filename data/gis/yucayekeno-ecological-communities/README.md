# Yucayekeno Ecological Communities — GIS Package

Contractor deliverable (received 2026-07-27) mapping the ancestral Taíno **yucayekes**
(village territories) and **caciques** (chiefs) of Borikén (Puerto Rico + Vieques/Culebra/Mona).
Produced for the Taíno Nation of the Boriken / Borikua Taino Foundation by
Francisco Javier Nolla (archaeologist), Brooke Rodriguez, Miguel David, and Joe Delgado (GIS).

## Folder layout

```
GIS Files/
  19_06_2026_Yucayeques.gdb    ← CANONICAL geodatabase (Esri FileGDB, June 19 2026)
  Yucayeques_v1.gdb            ← earlier draft; its 2 layers are byte-identical subsets of the above
geojson/                       ← exports generated from the canonical GDB (WGS84 / EPSG:4326)
Geograpghic Output Maps/       ← contractor-rendered PDF maps ("Geograpghic" sic, as delivered)
Source Documentation/          ← research reports backing the boundaries
```

The original nested `.zip`s were deleted after extraction (fully redundant).

## Layers in `19_06_2026_Yucayeques.gdb`

| Layer                                          | Geometry     | Features | CRS       | What it is                                                                                                                                                  |
| ---------------------------------------------- | ------------ | -------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Yucayeques_Boundaries_Joe_Delgado_19_06_2026` | MultiPolygon | 27       | EPSG:3857 | **Primary product.** 18 named yucayeke territories + 9 separate "Bieque" polygons (Vieques, Culebra, and offshore cays). Attribute: `Yucayeques_Name`.      |
| `Caciques_Joe_Delgado_19_06_2026`              | Point        | 18       | EPSG:3857 | Seat/label point per yucayeke with `Caciques_Name` (territory) and `Chief` (cacique).                                                                       |
| `Histopedia4_Boundary_19_06_2026`              | MultiPolygon | 19       | EPSG:3857 | Alternative boundary set traced from histopediadepuertorico.com source map; includes `Chief_Name`. Two duplicate BIEKE rows.                                |
| `BorikenTianoIsland_6_19_06_2026`              | MultiPolygon | 20       | EPSG:3857 | Second alternative source ("Boriken Taino Island" map) with chief + village names; includes Amoná (Mona I.).                                                |
| `Histopedia5_Boundary_Final_19_06_2026`        | MultiPolygon | 3,235    | EPSG:4269 | US Census **TIGER counties for the entire USA** — used as tracing reference. Only the 78 PR municipios matter; the rest is dead weight (~90 % of GDB size). |

`Yucayeques_v1.gdb` contains only `Yucayeques_Boundaries` + `Caciques`, geometrically
identical to the Joe Delgado layers above. Kept for provenance; safe to delete.

## GeoJSON exports (`geojson/`)

All re-projected to **EPSG:4326** (except municipios, already NAD83 ≈ WGS84 at this scale),
generated with GDAL/pyogrio + shapely. Property names normalized to lowercase.

| File                                               | Use                                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `yucayeque-boundaries.geojson` (548 KB)            | Full-detail primary territories (`yucayeque` prop)                                                                              |
| `yucayeque-boundaries.simplified.geojson` (101 KB) | 50 m-simplified copy — **use this in the web/admin frontends**                                                                  |
| `caciques.geojson` (3 KB)                          | Label points: `label`, `yucayeque`, `cacique`                                                                                   |
| `histopedia-boundaries.geojson` (511 KB)           | Alt source #1, with cacique names + municipality notes                                                                          |
| `boriken-taino-island-boundaries.geojson` (517 KB) | Alt source #2                                                                                                                   |
| `pr-municipios-tiger.geojson` (2.9 MB)             | The 78 PR municipios extracted from the TIGER layer (`geoid`, `municipio`) — useful for joining member addresses to territories |

## Historical basis (from `Source Documentation/`)

- **Yucayekeno Report** (May 2025, signed): affirms **18 confirmed yucayekes**
  (Aymaco, Abacoa, Sibuco/Cibuco, Toa, Bayamón, Guaynabo*, Hamanio, Canaibón, Dacuao/Daguao,
  Bieke, Macao, Guayaney, Guayama, Turabo, Jatobonico, Otao/Otoao, Guanía, Yagüecax)
  plus **7 unconfirmed sites** needing research (Guaynabo, Culebra, Guajataca, Guama,
  Abeyno, Coabey, Cayeco). Each is mapped to modern municipalities
  (e.g. Turabo = Caguas; Guanía = Cabo Rojo–Ponce).
- **Boriken Geo-Anthropologic Review**: source compilation — Rouse (1992), PNAS Taíno-genetics
  paper (2018), Smithsonian 1901 caciques map, plus informal web sources
  (proyectosalonhogar.com, histopedia, Reddit/Instagram map reproductions). Ends with a
  territory → cacique → modern-municipalities table.
- The two "Output Maps" PDFs render the primary layer over satellite imagery and overlay the
  competing source names (yucayeke names vs. cacique/chiefdom names, e.g. Otao/Guarionex).

## Known caveats

1. **Boundaries are interpretive**, digitized from small-scale educational/secondary maps and
   aligned to modern municipio lines — not survey data. The three boundary layers disagree with
   each other in places; the Joe Delgado layer is the contractor's reconciled pick.
2. "Bieque" appears as 9 separate unlabeled island polygons (no distinction
   Vieques/Culebra/cays); the report suggests merging Culebra into Bieke.
3. Guajataca appears as a territory in the primary layer even though the report lists it
   as _unconfirmed_ — flag territory status in any UI (confirmed vs. oral-tradition).
4. Mona/Amoná is in the report + alt layer but **not** in the primary boundaries layer.
5. Diacritics/spellings vary between layers (Canaibón/Cayniabón/CAYNABON…). The report's
   "Suggested Spelling" table is incomplete. **Resolved 2026-07-20:** the canonical naming
   table is now `data/naming/yucayeke-names/` (BTF's official Arawakan corrections), joined
   to these layers via `geometryKey` in
   `apps/web/src/features/yucayeke/content/territories.ts`. Note the GeoJSON `yucayeque`
   values are deliberately left as delivered — the client corrected names, not the GIS export.
6. No licensing/metadata shipped with the GDB; TIGER data is public domain.
7. **Cacique seat points vs boundaries (contractor QA item):** 9 of the 18 `Caciques`
   points fall inside a _neighboring_ territory polygon in both boundary layers
   (Guajataca→Otao, Sibuco→Toa, Jatibonicu→Turabo, Toa→Bayamón, Guaynabo→Turabo,
   Bayamón→Guaynabo, Guayama→Turabo, Guayaney→Macao, Hamanío→Canaibón) — label
   placements, not seat locations. Pinned by
   `apps/web/src/features/yucayeke/content/territories.test.ts`; flag to the contractor.

## Integration notes (Community platform)

**Shipped (2026-07-28):** `yucayeque-boundaries.simplified.geojson` is copied to
`apps/web/public/geo/yucayeke-boundaries.json` and rendered as a token-colored inline SVG
(no map library — pure Web-Mercator projection in
`apps/web/src/features/yucayeke/lib/geometry.ts`) at the protected `/yucayeke/map` route
and in the profile "Your Yucayeke" card. Territory names are reconciled with the backend's
`OFFICIAL_YUCAYEKES` list in `apps/web/src/features/yucayeke/content/territories.ts` —
resolve any recorded value through `resolveTerritory()`, never by string comparison.

Still open:

- Territory affiliation: point-in-polygon of a member's address (or municipio centroid via
  `pr-municipios-tiger.geojson` join) → yucayeke, to auto-suggest an `Enrollment` value.
- If boundaries become queryable server-side ("which yucayeke am I in?"), load the GeoJSON
  into Postgres/PostGIS or do point-in-polygon in Node (`@turf/boolean-point-in-polygon`).
- Repo-size: this folder is committed as-is (~60 MB; one 48 MB `.gdbtable` inside the
  canonical GDB is the nationwide TIGER layer). If history weight becomes a problem, the
  prune candidates are `Yucayeques_v1.gdb` and that TIGER layer — `geojson/` already
  preserves everything the app needs.
