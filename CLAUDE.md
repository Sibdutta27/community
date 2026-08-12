# Community — Monorepo Guide

Indigenous-heritage **community enrollment & engagement** platform. A **pnpm + Turborepo
monorepo**: the three apps live under `apps/*` and share one root install. Run `pnpm install`
once at the root; drive tasks with Turborepo (`pnpm build|dev|lint|typecheck`, or
`pnpm --filter <app> <script>`). Shared packages go under `packages/*`.

| App                                     | Stack                                                      | Role                                       |
| --------------------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| [`apps/api/`](./apps/api/CLAUDE.md)     | NestJS 11 + Prisma 7 (Postgres), JWT, S3/MinIO             | REST API — the single source of truth      |
| [`apps/web/`](./apps/web/CLAUDE.md)     | Next.js 16 (App Router) + React 19, Tailwind v4, shadcn/ui | Member-facing app (public + authenticated) |
| [`apps/admin/`](./apps/admin/CLAUDE.md) | Vite 6 + React 19, MUI v9                                  | Internal admin dashboard                   |

Both frontends talk to the same backend API.

## Deeper docs

- [`docs/architecture/backend.md`](./docs/architecture/backend.md) — modules, endpoints, guards
- [`docs/architecture/frontend.md`](./docs/architecture/frontend.md) — routes, data layer, auth
- [`docs/architecture/admin-panel.md`](./docs/architecture/admin-panel.md) — pages, routing, tables
- [`docs/data-model.md`](./docs/data-model.md) — Prisma models, relations, enums
- [`docs/design-system.md`](./docs/design-system.md) — **frontend** visual language (palette, fonts, motion)
- [`docs/design-system-admin.md`](./docs/design-system-admin.md) — **admin** visual language (dark MUI theme)
- [`docs/product/PRD.md`](./docs/product/PRD.md) — as-built product requirements
- [`docs/architecture/categories.yaml`](./docs/architecture/categories.yaml) — App→Domain→paths map (change routing)
- [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) — categorized change log

## ⚠️ Two distinct design systems — do not cross-pollinate

- **apps/web** = warm, earthy, Indigenous-inspired (sand/brown/red, Cinzel + Montserrat,
  Tailwind + shadcn, `rounded-full` buttons). See [`docs/design-system.md`](./docs/design-system.md).
- **apps/admin** = dark purple/blue admin theme, MUI defaults + inline `sx`. See
  [`docs/design-system-admin.md`](./docs/design-system-admin.md).

When building UI, match the design system of the app you're in. Never copy frontend tokens into the
admin panel or vice-versa.

## Shared conventions across both frontends

- **Data fetching:** axios client (per-app) + **TanStack React Query** (queries/mutations).
- **Forms:** **react-hook-form + Zod** (`@hookform/resolvers/zodResolver`).
- **Auth:** backend issues a JWT (`{ sub, email, role, publicId, name }`, 1h expiry).
  - Frontend stores it in a `community_auth_token` **cookie** (middleware-guarded routes).
  - Admin panel stores it in **localStorage** (`token`) and attaches it via axios interceptor.

## Domain model in one breath

A `User` has one `Enrollment` (status `DRAFT → SUBMITTED → APPROVED/REJECTED`). Enrollment is a
5-step flow — demographics → maternal kinship → paternal kinship → documents → confirmation
(review, sign, submit); an introduction page at `/enrollment/start` precedes step 1. The steps are
declared once in `apps/web/src/features/enrollment/config/enrollment-steps.ts` — derive from it
rather than restating the flow. Consent must be accepted (gated by `ConsentAcceptedGuard`) before
document/enrollment writes. Users also register for `Service`s and `Event`s. Files live in S3/MinIO as `Document`s.

## Working on a change request

1. **`/change-router locate <request>`** — pinpoint the App→Domain section(s) and exact files
   to touch (reads `docs/architecture/categories.yaml`). Backend is the source of truth — change
   the API/DTO before the frontends.
2. Make the change. For UI, **`/style-guide check <app>`** to stay brand-aligned.
3. **`/community-kb refresh [area]`** — update the architecture docs + `categories.yaml`.
4. **`/change-router log <description>`** — append a categorized entry to `docs/CHANGELOG.md`.
5. Optionally **`/community-kb record`** — capture non-obvious gotchas/preferences to private memory.

## Skills (where each lives)

| Skill            | Scope                        | Purpose                                                                                          |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `community-kb`   | project (`.claude/skills/`)  | refresh architecture docs + `categories.yaml`; `drift` flags stale docs/PRD; `record` to memory  |
| `website-studio` | project                      | the admin-panel CMS: content overrides, yukayeke fields, media slots — read before touching i18n |
| `change-router`  | project                      | `locate` a change to files; `log` it to the changelog                                            |
| `create-prd`     | global (`~/.claude/skills/`) | author a vertical-slice PRD (used for `docs/product/PRD.md`)                                     |
| `style-guide`    | global                       | `check`/`refresh` the design-system docs (owns `docs/design-system*.md`)                         |

Rule of thumb: durable, shareable facts → these in-repo docs; run-specific gotchas/preferences →
private memory. Design-system docs are owned by `style-guide`; the PRD by `create-prd`; the
changelog by `change-router`; everything else by `community-kb`.
