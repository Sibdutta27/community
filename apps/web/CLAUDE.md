# apps/web — Next.js member app

Next.js 16 (App Router) + React 19, Tailwind v4, shadcn/ui (+ Radix), TanStack Query, axios,
react-hook-form + Zod, framer-motion. Full map: [`../../docs/architecture/frontend.md`](../../docs/architecture/frontend.md).
**Design language: [`../../docs/design-system.md`](../../docs/design-system.md) — read before building UI.**

## Layout

```
src/
  app/                         # App Router
    (public)/ (auth)/ (protected)/   # route groups
    api/                       # route handlers (BFF: auth, enrollment, events, …)
    layout.tsx globals.css
  features/<domain>/           # auth, enrollment, dashboard, profile, community,
                               #   services, yucayeke, contact, about, home, protected
    components/ lib/ hooks/ api/ styles/ types/ constants/
  components/
    ui/                        # shadcn ("new-york" style) — button, input, form, dialog, …
    layout/ shared/
  lib/                         # utils.ts (cn()), auth.ts, auth-session.ts, motion.ts
  services/http/               # client.ts (axios), apis.ts (endpoints), fetcher.ts
  styles/                      # tokens.css, fonts.ts, scss/abstracts/_breakpoints.scss
  config/                      # site.ts, env.ts
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

## Auth

- JWT lives in the **`community_auth_token` cookie**. `middleware.ts` guards `/dashboard` and
  `/my-profile` (redirects to `/sign-in?next=…`) and bounces authed users away from `/sign-in`,
  `/sign-up`.
- Server components read the session via `src/lib/auth-session.ts` —
  `getSessionUser()` (React `cache`) / `getRequiredSessionUser()` (redirects if absent).
  JWT decode helpers in `src/lib/auth.ts`.

## Styling tokens (see design-system.md for the full story)

CSS vars in `src/styles/tokens.css`, exposed to Tailwind v4 via `@theme inline`. Fonts in
`src/styles/fonts.ts`: **Cinzel** (`--font-display`), **Montserrat** (`--font-body`),
**Lato** (`--font-body-alt`). SCSS modules use the `@include up(<bp>)` mixin from
`styles/scss/abstracts/_breakpoints.scss` (sm 40 / md 48 / lg 64 / xl 80 / 2xl 96 rem).

## Run

```bash
pnpm dev        # next dev
pnpm build
pnpm typecheck  # tsc --noEmit
pnpm lint
```

Env: `NEXT_PUBLIC_API_BASE_URL` (validated in `src/config/env.ts` — throws if missing).
