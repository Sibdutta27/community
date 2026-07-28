---
name: yucayeke-map
description: >-
  Builds and extends the Yucayeke map experience in apps/web: an interactive map of the
  ancestral yucayeke territories of Borikén (hover/tap a territory to read about it) and
  a "My Yucayeke" view that highlights the member's assigned territory from their
  enrollment. Knows where the GIS data lives (data/gis/yucayekeno-ecological-communities),
  which GeoJSON exports to use, the canonical-naming and confirmed/unconfirmed caveats,
  and the frontend design-system constraints. Use when asked to build/extend the yucayeke
  map, territory view, "show my yucayeke", or hover-to-read territory info.
when_to_use: >-
  "yucayeke map", "territory map", "my yucayeke view", "interactive map of yucayekes",
  "hover over territories", "assign yucayeke on the map", "map of Borikén"
argument-hint: "[what to build or change in the map experience]"
disable-model-invocation: false
user-invocable: true
---

# yucayeke-map

Guide for building the member-facing Yucayeke map in **apps/web** (Next.js 16 + React 19,
Tailwind v4 + shadcn). Never build this in apps/admin without being asked; if an admin
variant is requested, restyle to the dark MUI theme per `docs/design-system-admin.md`.

## Data sources (implemented — extend, don't duplicate)

1. **Canonical territory table** — `apps/web/src/features/yucayeke/content/territories.ts`
   is the single source of truth: it reconciles the backend `OFFICIAL_YUCAYEKES` names,
   the GeoJSON `yucayeque` keys, and the display spellings, plus cacique, municipalities,
   and `confirmed`/`oralTradition` status. Resolve any recorded enrollment value with
   `resolveTerritory()` — never string-compare yucayeke names directly.
2. **Static geometry** — `apps/web/public/geo/yucayeke-boundaries.json` (simplified,
   101 KB), fetched via `useYucayekeGeometryQuery()` and projected by
   `lib/geometry.ts#buildTerritoryShapes` (pure Web-Mercator, no map library).
   Source exports live in `data/gis/yucayekeno-ecological-communities/geojson/`; read
   that folder's README.md before touching the data — it lists the caveats that shape
   UI decisions.
3. **Member assignment** — `profileResponse.enrollment.personalInfo.yucayeke` (+
   `yucayekeUnknown`) via `useProfileInfoQuery()`. A backend `Yucayeke` table
   (kanban S3-list) will eventually replace the placeholder constant; the table's
   `apiNames` field is the migration key.

## Non-negotiable data caveats (surface them in UI)

- **Naming**: spellings differ across sources (Canaibón/Cayniabón/…). The GeoJSON
  `yucayeque` property is the join key — the canonical _display_ name must come from one
  content table (API or a single `yucayeke-content.ts`), never from mixed sources.
- **Status**: 18 territories are historically confirmed; others (e.g. Guajataca, which IS
  drawn on the map) are unconfirmed/oral-tradition. Show a status distinction (e.g. badge
  or muted styling), don't present all boundaries as equally established.
- **Bieque**: 9 separate island polygons share the name "Bieque" — treat them as one
  logical territory (group by name before hover/selection logic).
- Boundaries are interpretive reconstructions, not legal/survey lines — keep the
  disclaimer visible near the map.

## Map stack (implemented: token-colored SVG, no map library)

The map is `components/boriken-map.tsx`: an inline SVG rendered from
`buildTerritoryShapes()` (pure Web-Mercator projection in `lib/geometry.ts`) — chosen
over maplibre because no basemap/tiles are wanted, 27 polygons is trivially SVG-scale,
paths are real DOM (hover/tap/keyboard a11y, jsdom-testable with zero stubs), and it
avoids GDB ring-winding hazards in spherical pipelines. Two variants:
`interactive` (tabIndex/role=button paths, `data-territory` e2e hooks) and `preview`
(decorative, `aria-hidden`, used in the profile card).

- Hover/tap/focus → `TerritoryInfoCard` (name, cacique, municipalities, description
  from the `yucayekeMap` i18n namespace, status badge). Keyboard/touch parity via
  `TerritoryList`, a focusable list synced both ways with the map.
- Oral-tradition territories get dashed borders (non-color status cue).
- Reach for **maplibre-gl** only if a real basemap/zoom experience is later required.

## "My Yucayeke" view

- Source of truth: `enrollment.yucayeke` (+ `yucayekeUnknown`). Not assigned → show the
  exploration map with a CTA to complete enrollment; unknown → show "help me find it"
  framing, never an empty error state.
- Assigned → highlight that polygon (fill emphasis + dim others), auto-fly/zoom to it,
  and show its info card expanded by default.

## Design system (apps/web — azul/Inter, NOT admin dark)

Follow `docs/design-system.md` (azul-led Puerto-Rican-flag palette, 60-30-10, Inter
only). Map fills derive strictly from tokens: base `--surface-muted` with `--border`
strokes, hover/selected `--secondary` fill + `--accent` stroke, the member's own
territory `--primary`, focus ring `--ring`. Labels `--muted-foreground` (white
`--primary-foreground` on the highlighted territory). No hardcoded hex, no default
library blues, red stays reserved for emphasis CTAs/errors. Reuse `SurfaceCard`,
pill `Button` variants, and `src/lib/motion.ts` fadeInUp variants. Run
`/style-guide check web` after building UI.

## Placement & conventions

- Feature code in `apps/web/src/features/yucayeke/` (components/hooks/content), route
  under the authenticated app for "My Yucayeke"; a public exploration page is optional
  and must degrade without auth.
- Client-only map component (`"use client"` + dynamic import with `ssr: false`); provide
  a loading skeleton sized to the map to avoid layout shift.
- Bilingual: all territory copy goes through the existing en/es message structure.
- Tests per repo convention: RTL for the info card/list interactions, Playwright e2e for
  "map loads + assigned territory highlighted".

## Definition of done

Map renders from static GeoJSON; hover/tap + keyboard list both open info cards; assigned
yucayeke highlights from real enrollment data; confirmed/unconfirmed distinction visible;
styling passes `/style-guide check web`; tests green; changelog logged via
`/change-router log`.
