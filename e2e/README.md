# Community E2E — behavior-parity suite

Playwright end-to-end tests covering the member frontend (`web`) and admin panel
(`admin`). Its job: **prove the apps still behave the same before and after the monorepo
migration** (and catch regressions generally).

This suite is intentionally standalone (its own `package.json`) and lives at the repo
root so it survives the `apps/*` restructure unchanged.

## Setup

```bash
cd e2e
pnpm install          # or npm install
pnpm install:browsers # playwright install --with-deps
cp .env.example .env  # set base URLs + (optional) test credentials
```

You need the apps running and reachable at the URLs in `.env`:
- **web** (Next.js) — `next dev`, default `http://localhost:3000`
- **admin** (Vite) — `vite`, default `http://localhost:5173`
- the **backend** (NestJS) + Postgres/MinIO must be up for authenticated flows
  (`cd apps/api && docker compose -f compose.yaml up -d && npm run start:dev`).

> Note: the repo has a pre-existing port ambiguity (frontend README references the backend
> on `:4000/api`; admin `.env` points at `:3000`). Set `WEB_BASE_URL` / `ADMIN_BASE_URL`
> and the apps' own env to whatever you actually run — this suite doesn't assume.

## Capture the baseline (BEFORE the migration)

On the current `main` (pre-migration), with the apps running:

```bash
pnpm test --update-snapshots   # seeds visual baselines in ./snapshots
pnpm test                      # full run — must be green
```

Commit the green run's `snapshots/` as the baseline. Keep the HTML report
(`pnpm report`) as the recorded "results" of how the app works today.

## Verify parity (AFTER each migration stage)

With the migrated apps running at the same URLs:

```bash
pnpm test        # must still be green; visual diffs flag any drift
pnpm report      # inspect failures / screenshots / traces
```

A green run = the app does what it used to. Investigate any diff before proceeding.

## Credential-gated flows

Authenticated tests (member dashboard/enrollment; admin CRUD pages) **skip** unless you
set `TEST_MEMBER_EMAIL/PASSWORD` and `TEST_ADMIN_EMAIL/PASSWORD` in `.env`. Use seeded
accounts (see `apps/api/prisma/seed/`). They assert pages load and forms render;
they do not submit data that would mutate state.

## Layout

```
e2e/
  playwright.config.ts     # two projects: web, admin (per-project baseURL)
  fixtures/auth.ts         # login helpers (accessible selectors — adjust if labels differ)
  tests/web/               # public pages (+ visual baseline), auth, enrollment
  tests/admin/             # login, protected redirects, authed routes, data table
  snapshots/               # committed visual baselines
```

## Adjusting selectors

The login helpers and form assertions use accessible roles/labels (`getByLabel(/email/i)`,
`getByRole('button', { name: /sign in/i })`). If a real label/button text differs, update
`fixtures/auth.ts` (single source) and the few `*.spec.ts` assertions — these are the only
app-specific couplings.
