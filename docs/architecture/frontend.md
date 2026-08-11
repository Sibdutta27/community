# Frontend Architecture — apps/web

Next.js 16 App Router + React 19. See [`../design-system.md`](../design-system.md) for the visual
language and [`../../apps/web/CLAUDE.md`](../../apps/web/CLAUDE.md) for the quick reference.

## Routing

Route groups under `src/app/`:

- **`(public)`** — `/`, `about`, `community`, `contact`, `services`, `yucayeke`, plus policy pages
  (cookie/privacy/terms, enrollment). Wrapped in `SiteShell` (PublicNavbar + PublicFooter).
- **`(auth)`** — `sign-in`, `sign-up`.
- **`(protected)`** — `dashboard`, `enrollment/step-1..4`, `my-profile`, `profile`,
  `yucayeke/map` (interactive territory map).
- **`api/`** — Next route handlers acting as a BFF (auth, enrollment, events, services, documents,
  profile, consent, feedback) that forward to the NestJS backend.

`middleware.ts` (`src/middleware.ts`):

- Protects `/dashboard`, `/my-profile`, `/yucayeke/map` → redirect to `/sign-in?next=…` if no
  `community_auth_token` cookie.
- Redirects authed users away from `/sign-in`, `/sign-up` → `DEFAULT_POST_LOGIN_PATH`.
- `matcher: ["/dashboard/:path*", "/my-profile/:path*", "/yucayeke/map/:path*", "/yucayeke/map",
"/sign-in", "/sign-up"]`.

## Yucayeke territory map (`features/yucayeke/`)

The feature folder serves BOTH the public marketing page (`(public)/yucayeke`) and the
protected member map (`(protected)/yucayeke/map` + the profile "Your Yucayeke" card):

- `content/territories.ts` — canonical territory table: single source of truth joining the
  backend `OFFICIAL_YUCAYEKES` names, the GeoJSON `yucayeque` keys, and display spellings,
  with cacique, municipalities, and `confirmed`/`oralTradition` status. Resolve enrollment
  values with `resolveTerritory()` (diacritic/case-insensitive); never string-compare names.
- `lib/geometry.ts` — pure Web-Mercator projection + path building (no map library);
  `buildTerritoryShapes()` merges the nine "Bieque" island polygons into one territory.
- `lib/yucayeke-map-queries.ts` — fetches the static asset `public/geo/yucayeke-boundaries.json`
  (simplified contractor GeoJSON, cached forever client-side).
- `components/` — `BorikenMap` (token-colored SVG, `interactive`/`preview` variants,
  keyboard-accessible paths with `data-territory` hooks), `TerritoryInfoCard`,
  `TerritoryList` (focusable peer of the map), `YucayekeMapPageContent`,
  `YourYucayekeCard` (profile card; degrades assigned → unknown → unassigned → unmapped).
- i18n namespace `yucayekeMap` in `messages/{en,es}.json` (territory descriptions per slug).
- Source GIS data + caveats: `data/gis/yucayekeno-ecological-communities/README.md`.

## Feedback widget (`features/feedback/`)

A floating launcher mounted once in `app/layout.tsx` (inside `AppProviders`, the only tree shared
by all three route groups), so members and closed-beta testers can report an issue from any page:

- `components/feedback-widget.tsx` — launcher + disclosure panel (no scrim, not a modal
  takeover): `aria-haspopup="dialog"`/`aria-expanded`, Tab trapped inside the open panel, Escape
  and outside-click close, focus returned to the launcher. Icon-only on mobile so it never covers
  a primary action.
- `components/feedback-panel.tsx` — the note (required), an optional screenshot/PDF, and the
  auto-captured page URL + locale shown back to the member. Confirmation and recoverable-error
  states.
- `lib/feedback-mutations.ts` — `requestMultipart` → `/api/feedback` with
  **`redirectOnUnauthorized: false`** (the widget is reachable signed-out; the default 401 handler
  would bounce visitors to /sign-in).
- `lib/feedback-widget-events.ts` — a window CustomEvent bus so any surface can open the panel
  without threading a provider; used by `components/shared/support-feedback-button.tsx` to wire
  the support section's report card.
- i18n namespace `feedback` in `messages/{en,es}.json`.

## Data layer

- `services/http/client.ts` — axios `apiClient` (base `NEXT_PUBLIC_API_BASE_URL`, 300s timeout,
  JSON default headers); `apiConnector<T>()` generic request helper; `getApiErrorMessage()`.
- `services/http/apis.ts` — `endpoints` object grouping all paths (ACCOUNT, AUTH, CONSENT,
  ENROLLMENT, EVENTS, SERVICES, PROFILE, DOCUMENT).
- `services/http/fetcher.ts` — `requestJson` / `requestMultipart` (native fetch wrappers used by
  client code calling the Next `/api/*` routes).
- **TanStack Query** configured in `providers/app-providers.tsx`
  (`refetchOnWindowFocus: false`, `retry: 1`, mutations `retry: 0`). Per-feature hooks in
  `features/*/lib/*-queries.ts` & `*-mutations.ts` with typed query-key objects
  (e.g. `profileQueryKeys.info`).

## Forms

Zod schema + helpers per feature in `features/*/lib/*-form.ts`. Example
(`enrollment-step-one-form.ts`): nested schema (legalName, birthInfo, gender, contact,
current/mailing address, emergencyContact, additionalInfo) with shared validators
(`requiredString`, `requiredDateString`, `createRequiredSelectionSchema`), an
`infer`-ed `FormValues` type, `get…DefaultValues()` (prefill), and `map…FormToPayload()`
(outbound). UI via shadcn `Form/FormField/FormItem/FormLabel/FormControl/FormMessage`.

## Auth

- JWT in `community_auth_token` cookie. Decode helpers + types (`AuthUser`,
  `AuthLoginRequest`, `AuthSessionResponse`) in `src/lib/auth.ts`.
- Server session: `src/lib/auth-session.ts` — `getSessionUser()` (`React.cache`),
  `getRequiredSessionUser()` (redirects to sign-in).
- Login flow: form → `/api/auth/login` → `{ accessToken }` → cookie set → middleware unlocks
  protected routes.

## Build / run

`npm run dev | build | start | typecheck | lint | format`. Env: `NEXT_PUBLIC_API_BASE_URL`
(validated in `src/config/env.ts`). `next.config.ts` sets `allowedDevOrigins`.
