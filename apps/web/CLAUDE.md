# apps/web — Next.js member app

Next.js 16 (App Router) + React 19, Tailwind v4, shadcn/ui (+ Radix), TanStack Query, axios,
react-hook-form + Zod, framer-motion, next-intl (en/es), Vitest.
Full map: [`../../docs/architecture/frontend.md`](../../docs/architecture/frontend.md).
**Design language: [`../../docs/design-system.md`](../../docs/design-system.md) — read before building UI.
Two distinct design systems in this repo: never pull `apps/admin` (dark MUI) tokens or components in here, or vice-versa.**

## Layout

```
middleware.ts                  # app root, NOT src/ — auth guard
messages/{en,es}.json          # next-intl catalogs (locale from a cookie, no URL prefix)
src/
  app/                         # App Router
    (public)/ (auth)/ (protected)/   # route groups
    api/                       # route handlers (BFF: auth, enrollment, consent, feedback, …)
    layout.tsx globals.css     # mounts AppProviders + the FeedbackWidget
  features/<domain>/           # auth, enrollment, dashboard, profile, community, services,
                               #   yucayeke, contact, about, home, protected, brand-kit, feedback
    components/ lib/ hooks/ api/ config/ content/ styles/ types/ constants/
  components/                  # ui/ (shadcn "new-york"), layout/ (navbar-chrome.ts +
                               #   public/protected navbars, site-shell), shared/
  lib/                         # utils.ts (cn()), auth.ts, auth-session.ts, motion.ts
  services/http/               # client.ts (axios), apis.ts (endpoints), fetcher.ts
  i18n/ styles/ config/        # request.ts+config.ts / tokens.css+fonts.ts / site.ts+env.ts
```

## Conventions

- **Feature-first:** domain code lives under `features/<domain>/`; only truly shared primitives go
  in top-level `components/ui` (shadcn) and `components/{layout,shared}`.
- **Class merging:** always use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge). Component
  variants via `class-variance-authority` (see `components/ui/button.tsx`).
- **Data fetching:** axios `apiClient` in `services/http/client.ts` (base `NEXT_PUBLIC_API_BASE_URL`);
  endpoint strings centralized in `services/http/apis.ts`. Use TanStack Query — per-feature
  `lib/*-queries.ts` / `*-mutations.ts` with **typed query keys**. Browser→Next API routes use the
  `requestJson` / `requestMultipart` helpers in `services/http/fetcher.ts`.
- **Forms:** Zod schema + helpers per feature in `features/*/lib/*-form.ts`
  (schema, `get…DefaultValues`, `map…FormToPayload`). Render with shadcn `Form*` wrappers.
- **Motion:** shared variants in `src/lib/motion.ts` (staggered `fadeInUp`); use
  `whileInView` with `viewport={{ once: true }}`.
- **i18n:** all copy through `next-intl`; locale comes from the `community_locale` **cookie**
  (`src/i18n/request.ts`), never a URL segment.

## Gotchas (read before touching the areas they cover)

- **Public pages must use `useOptionalProfileInfoQuery`** (`features/profile/lib/profile-queries.ts`),
  not `useProfileInfoQuery`. `requestJson`'s default 401 handler hard-redirects to `/sign-in`,
  which would bounce every signed-out visitor off `/yucayeke` and `/yucayeke/[slug]`. Separate
  cache keys on purpose.
- **Consent is asked once**, on the enrollment intro `/enrollment/start` (step 0), via the
  presentational `ConsentChecklist`. No dashboard consent dialog; step 5 shows a read-only
  `EnrollmentConsentSummary`. `fetcher.ts` maps a 403 "Consent not accepted" back to
  `/enrollment/start`.
- **"Yukayeke" is copy; `yucayeke` is an identifier.** Member-facing text uses the client's
  Arawakan spelling _Yukayeke_, while routes (`/yucayeke/**`), i18n **keys**, the feature folder
  and the `yucayeke`/`yucayekeMap` namespaces keep the old spelling on purpose. Translate values,
  never keys — do not "fix" the identifiers.
- **`/yucayeke` is the public interactive territory map** (+ `/yucayeke/[slug]` reading pages);
  `/yucayeke/map` is a permanent redirect kept for old links.

## Auth

- JWT lives in the **`community_auth_token` cookie**. **`middleware.ts` sits at the app root**
  (not under `src/`) and guards **only `/dashboard` and `/my-profile`** (redirects to
  `/sign-in?next=…`), treats an expired token as no session and clears the stale cookie, and
  bounces authed users away from `/sign-in`, `/sign-up`.
- Server components read the session via `src/lib/auth-session.ts` —
  `getSessionUser()` (React `cache`) / `getRequiredSessionUser()` (redirects if absent).
  JWT decode helpers in `src/lib/auth.ts`.

## Styling tokens (see design-system.md for the full story)

CSS vars in `src/styles/tokens.css`, exposed to Tailwind v4 via `@theme inline` — currently the
**azul-led Puerto-Rican-flag palette** (`--primary` deep azul, `--emphasis` restrained flag red).
Fonts in `src/styles/fonts.ts`: **Inter** for everything (the `cinzel`/`montserrat`/`lato`
exports are compatibility aliases that resolve to Inter). Navbar chrome is centralized in
`components/layout/navbar-chrome.ts` — a slender flush civic bar with underline tabs (not a
floating pill, not button pills); both navbars must consume it so they can't drift. SCSS modules
use `@include up(<bp>)` from `styles/scss/abstracts/_breakpoints.scss` (sm 40 / md 48 / lg 64 /
xl 80 / 2xl 96 rem).

## Run

```bash
pnpm dev | build | lint          # next dev / next build / eslint
pnpm typecheck                   # tsc --noEmit
pnpm test                        # vitest run (jsdom); *.test.tsx sits next to its subject
```

Env: `NEXT_PUBLIC_API_BASE_URL` (validated in `src/config/env.ts` — throws if missing).
