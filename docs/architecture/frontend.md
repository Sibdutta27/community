# Frontend Architecture — apps/web

Next.js 16 App Router + React 19. See [`../design-system.md`](../design-system.md) for the visual
language and [`../../apps/web/CLAUDE.md`](../../apps/web/CLAUDE.md) for the quick reference.

> **Two distinct design systems — do not cross-pollinate.** `apps/web` is the warm/civic
> member-facing language documented in [`../design-system.md`](../design-system.md); `apps/admin`
> is a dark MUI theme documented in [`../design-system-admin.md`](../design-system-admin.md).
> Never copy tokens or components between them.

## Naming: "Yukayeke" (copy) vs `yucayeke` (identifiers)

Member-facing **copy** says **"Yukayeke"** — the client's Arawakan-correct spelling. Every
**identifier** deliberately keeps the older `yucayeke` spelling:

- routes: `/yucayeke`, `/yucayeke/[slug]`, `/yucayeke/map`
- i18n namespaces and message **keys**: `yucayeke`, `yucayekeMap`, `nav.yucayeke`,
  `profile.yucayekeCard`, …
- feature folder, files, components, query keys, GeoJSON keys, backend/enrollment field names

This split is intentional, not a leftover. Renaming the identifiers would break URLs, the
enrollment payload contract and the GIS join. Only translate **values** in
`messages/{en,es}.json` — never the keys. (Territory `legalName`s in `content/territories.ts`
are the Nation's official legal names and already read `Yukayeke <Name>`.)

## Routing

Route groups under `src/app/`:

- **`(public)`** — `/`, `about`, `community`, `contact`, `services`, `enrollment` (marketing),
  `yucayeke` (+ `yucayeke/[slug]`, `yucayeke/map`), `brand-kit`, `components`, plus policy pages
  (cookie/privacy/terms). Wrapped in `SiteShell`, which renders `ProtectedNavbar` when a session
  cookie is present and `PublicNavbar` otherwise, plus `PublicFooter`.
- **`(auth)`** — `sign-in`, `sign-up`.
- **`(protected)`** — `dashboard`, `enrollment/start` (intro/consent), `enrollment/step-1..5`,
  `enrollment/success`, `my-profile`, `profile` (same `ProfilePageContent`). The layout calls
  `getRequiredSessionUser()` and renders `ProtectedNavbar` + `PublicFooter`.
- **`api/`** — Next route handlers acting as a BFF (auth, account/info, enrollment, consent,
  documents, events, services, profile, feedback) that forward to the NestJS backend.

`middleware.ts` (at the **app root**, `apps/web/middleware.ts` — not under `src/`):

- Protects `/dashboard` and `/my-profile` only → redirect to `/sign-in?next=…` when there is no
  valid `community_auth_token` cookie. **The yucayeke map is public and is no longer guarded.**
- Treats an **expired** token as unauthenticated and clears the stale cookie, so a member holding
  a dead token isn't trapped away from `/sign-in`.
- Redirects authed users away from `/sign-in`, `/sign-up` → `DEFAULT_POST_LOGIN_PATH`.
- `matcher: ["/dashboard/:path*", "/my-profile/:path*", "/sign-in", "/sign-up"]`.

## Yucayeke territory map (`features/yucayeke/`)

**`/yucayeke` IS the interactive territory map**, and it is **public**. The old member-only route
`(protected)/yucayeke/map` is gone; `(public)/yucayeke/map/page.tsx` is now a
`permanentRedirect("/yucayeke")` kept only so old links and bookmarks resolve.

- `(public)/yucayeke/page.tsx` → `YucayekePageContent` = `YucayekeMapPageContent` (map + synced
  list + reading panel) over `YucayekeDirectorySection` (all 21 territories, linking into the
  reading pages) and `YucayekeConnectSection`.
- `(public)/yucayeke/[slug]/page.tsx` — per-territory reading page. `generateStaticParams()` over
  `TERRITORY_SLUGS` (21 slugs) prerenders them all; unknown slugs `notFound()`. `generateMetadata`
  falls back to the `yucayekeMap` blurb when a territory has no recorded cacique.
- `content/territories.ts` — canonical territory table: single source of truth joining the backend
  `OFFICIAL_YUCAYEKES` names, the GeoJSON `yucayeque` keys, the official `Yukayeke <Name>` legal
  names and display spellings, with cacique, municipalities, and `confirmed`/`oralTradition`
  status. Resolve enrollment values with `resolveTerritory()` (diacritic/case-insensitive); never
  string-compare names.
- `content/longform.ts` — explicit allow-list of slugs that have hand-written long-form history in
  the message catalog (currently only `guania`). Deliberately not inferred: inventing pre-colonial
  narrative to fill gaps would be fabricating heritage.
- `lib/geometry.ts` — pure Web-Mercator projection + path building (no map library);
  `buildTerritoryShapes()` merges the nine "Bieque" island polygons into one territory.
- `lib/yucayeke-map-queries.ts` — fetches the static asset `public/geo/yucayeke-boundaries.json`
  (simplified contractor GeoJSON, cached forever client-side).
- `components/` — `BorikenMap` (token-colored SVG, `interactive`/`preview` variants,
  keyboard-accessible paths with `data-territory` hooks), `TerritoryInfoCard`, `TerritoryList`
  (focusable peer of the map), `YucayekeMapPageContent`, `TerritoryDetailContent`,
  `YourYucayekeCard` (profile card; degrades assigned → unknown → unassigned → unmapped).
- **Signed-out safety:** every client component on these public routes reads the session through
  `useOptionalProfileInfoQuery` (see _Data layer_), never `useProfileInfoQuery`.
- i18n namespace `yucayekeMap` in `messages/{en,es}.json` (territory descriptions per slug).
- Source GIS data + caveats: `data/gis/yucayekeno-ecological-communities/README.md`.

## Enrollment & consent (`features/enrollment/`)

Five form steps plus a pre-flight introduction:

- `config/enrollment-steps.ts` — `enrollmentStepDefinitions` (1 Demographics, 2 Maternal Kinship,
  3 Paternal Kinship, 4 Documents, 5 Confirmation) is the single source for titles, hrefs, icons
  and the dashboard/stepper rendering. `enrollmentOverviewStep = 0` /
  `enrollmentOverviewHref = "/enrollment/start"` describe the intro, which is deliberately **not**
  a step definition (no form, no completion state, no folder tab).
  Navigation is free-jump (`isEnrollmentStepNavigable` always true); completion only drives
  styling and gates the final submit. Step 5 is derived as complete once the enrollment status is
  non-`DRAFT`.
- `components/enrollment-step-layout.tsx` — manila-folder shell shared by the intro and all five
  steps. `step={0}` renders the "Overview" label instead of "Step N of 5" and a stepper with no
  active tab. Also provides `EnrollmentSaveDraftContext` so a step form can register its
  "Save & finish later" handler and have the utility row mirror it.
- `components/enrollment-intro.tsx` (`/enrollment/start`) — who you're enrolling with, what the
  application asks for, what documents you'll need, how it works. The steps band is **derived**
  from `enrollmentStepDefinitions` and the documents band from the step-4 upload-slot configs, so
  neither can drift.

**Consent is asked exactly once (T4).** `dashboard-consent-dialog.tsx` no longer exists.

- `components/consent-checklist.tsx` — the checkbox list extracted from that deleted dialog, now
  purely **presentational** (no selection state, no mutation, no navigation). Rendered by the
  enrollment intro as its last band, and only when something is still pending: no consent on
  record, or a newly published required consent. Backend copy (`GET /consent/active`) renders
  verbatim; only the chrome is translated.
- On accept the intro starts an enrollment if needed (guarded — `startEnrollment` resets a
  non-`DRAFT` enrollment back to `DRAFT`), posts `/consent/accept`, invalidates the account and
  active-consent queries, then pushes `/enrollment/step-1`.
- **Step 5 has no consent checkboxes.** It shows an accuracy declaration plus
  `components/enrollment-consent-summary.tsx` — a read-only record (title, required/optional,
  version, acceptance timestamp) sourced from `/account/info`, mirroring the admin panel's
  `ConsentReview`. It renders no inputs and never blocks submission; an empty list degrades to a
  quiet link back to `/enrollment/start`.
- The **dashboard** no longer asks for consent: `dashboard-enrollment-section.tsx` only ensures an
  enrollment exists, then routes to `/enrollment/start`, which decides whether anything is still
  pending. Members past step 1 skip the introduction.
- `services/http/fetcher.ts` closes the loop: a **403 whose message is exactly "Consent not
  accepted"** (the backend `ConsentAcceptedGuard`'s wording) redirects to `/enrollment/start`
  rather than dead-ending, covering a required consent published mid-flow. Deliberately narrow —
  any other 403 still surfaces as an error.

## Profile identity deck (`features/profile/`)

The tribal ID card and the yucayeke card are **two faces of one flip deck**, not two stacked
panels: `components/identity-card-deck.tsx` renders `TribalIdentificationCard` and
`YucayekeIdentityCard` in the same grid cell with `preserve-3d` + `rotateY(180deg)`, so the deck
takes the height of the taller face and never jumps mid-flip. The face turned away stays mounted
(it holds the height and keeps the ID's export ref alive) but is `inert`, keeping its links out of
the tab order and off screen readers. A dot `tablist` under the deck signals and switches faces.
`yucayeke-identity-card.tsx` intentionally duplicates the ID card's gradient, glow, border, radius
and padding — keep the two in sync if either is restyled.

## Navigation chrome (`components/layout/`)

- `navbar-chrome.ts` — the shared class set both navbars consume so the signed-out and signed-in
  headers can never drift. The old floating rounded pill is gone: the bar is a **slender, flush
  civic header** — edge-to-edge translucent surface, hairline bottom rule (no radius, no ambient
  shadow), fixed 56/60px height. Nav items are **document-tab underlines**, not pills: azul
  (`primary`) marks the active section; red stays reserved for the Enroll CTA.
- `public-navbar.tsx` — signed-out: `publicNavigation` (`src/constants/navigation.ts`) is just
  About Us + Enrollment, plus the language switcher, Sign in and the emphasis Enroll CTA.
- `protected-navbar.tsx` — signed-in: Dashboard, **Yukayeke** (`/yucayeke`), and a **"Programs"
  dropdown** grouping Community + Services. **"My Profile" is deliberately absent from the bar** —
  it lives in the account menu under the member's own name. Grouped menus dismiss on outside
  click or Escape, like the account menu.
- `site-shell.tsx` picks the navbar from the session; the `(protected)` layout always uses
  `ProtectedNavbar`.

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
- `lib/feedback-config.ts` — attachment policy (JPEG/PNG/WebP/PDF, 10 MB, 4000-char message) kept
  in step with the API's `feedback/config.ts`; browser validation is a courtesy, the backend is
  the authority.
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
  client code calling the Next `/api/*` routes). Two global behaviours live here:
  - **401 → hard redirect to `/sign-in?next=…`** (after `POST /api/auth/logout`, because the auth
    cookie is httpOnly and can only be cleared server-side). Opt out per call with
    `redirectOnUnauthorized: false`.
  - **403 "Consent not accepted" → redirect to `/enrollment/start`** (see _Enrollment & consent_).
- **TanStack Query** configured in `providers/app-providers.tsx`
  (`refetchOnWindowFocus: false`, `retry: 1`, mutations `retry: 0`). Per-feature hooks in
  `features/*/lib/*-queries.ts` & `*-mutations.ts` with typed query-key objects
  (e.g. `profileQueryKeys.info`).

### ⚠️ Public pages must use `useOptionalProfileInfoQuery`

`features/profile/lib/profile-queries.ts` exports **two** profile hooks, and picking the wrong one
is a real footgun:

| Hook                          | Key                             | 401 behaviour                                   | Use on           |
| ----------------------------- | ------------------------------- | ----------------------------------------------- | ---------------- |
| `useProfileInfoQuery`         | `["profile","info"]`            | default → hard redirect to `/sign-in`           | protected pages  |
| `useOptionalProfileInfoQuery` | `["profile","info","optional"]` | `redirectOnUnauthorized: false`, `retry: false` | **public** pages |

On a public route a 401 just means "nobody is signed in" — with the default hook every signed-out
visitor to `/yucayeke` or `/yucayeke/[slug]` would be bounced to sign-in. The error state _is_ the
"no session" signal, so callers render their signed-out variant when `isSuccess` is false. The two
hooks use **separate cache keys on purpose**: sharing one would let whichever mounted first decide
the redirect behaviour for the other.

## Forms

Zod schema + helpers per feature in `features/*/lib/*-form.ts`. Example
(`enrollment-step-one-form.ts`): nested schema (legalName, birthInfo, gender, contact,
current/mailing address, emergencyContact, additionalInfo) with shared validators
(`requiredString`, `requiredDateString`, `createRequiredSelectionSchema`), an
`infer`-ed `FormValues` type, `get…DefaultValues()` (prefill), and `map…FormToPayload()`
(outbound). UI via shadcn `Form/FormField/FormItem/FormLabel/FormControl/FormMessage`.

## Localization

`next-intl`, wired via `createNextIntlPlugin` in `next.config.ts`. The locale comes from the
**`community_locale` cookie** (`src/i18n/request.ts` + `config.ts`), **not** from a URL prefix —
there are no `/en` / `/es` segments. `app/layout.tsx` resolves it server-side and wraps the tree in
`NextIntlClientProvider`; `generateMetadata` is translated too. Catalogs live in
`messages/{en,es}.json`; `components/shared/language-switcher.tsx` + `src/i18n/locale-actions.ts`
set the cookie. See _Naming_ above before touching any `yucayeke*` key.

## Auth

- JWT in `community_auth_token` cookie. Decode helpers + types (`AuthUser`,
  `AuthLoginRequest`, `AuthSessionResponse`) in `src/lib/auth.ts`.
- Server session: `src/lib/auth-session.ts` — `getSessionUser()` (`React.cache`),
  `getRequiredSessionUser()` (redirects to sign-in).
- Login flow: form → `/api/auth/login` → `{ accessToken }` → cookie set → middleware unlocks
  protected routes.

## Build / run / test

`pnpm dev | build | start | typecheck | lint | format`, plus `pnpm test` (**Vitest**, jsdom +
Testing Library — `vitest.config.ts` / `vitest.setup.ts`; specs sit next to their subject as
`*.test.ts(x)`). Env: `NEXT_PUBLIC_API_BASE_URL` (validated in `src/config/env.ts`).
`next.config.ts` sets `allowedDevOrigins` and registers the next-intl plugin.
