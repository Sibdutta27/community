# packages/

Shared workspace packages consumed by the apps. Empty for now — the structural migration
deliberately deferred extraction to keep it a pure move (build parity).

Planned (each its own follow-up vertical slice, verified independently):
- **`packages/types`** — shared API/domain types + Prisma-derived enums (highest value:
  `apps/admin` is plain JS and currently has no shared types).
- **`packages/api-client`** — shared axios factory + endpoint catalog, with per-app auth
  injection (web = httpOnly cookie via BFF; admin = localStorage bearer).
- **`packages/config`** — shared base `tsconfig`/eslint/prettier; apps opt-in via `extends`.

NOT planned: a shared `ui` package — the member frontend (Tailwind/shadcn) and admin
(MUI) are deliberately separate design systems and must not be coupled.

When adding a package, register it in `docs/architecture/categories.yaml` via
`/community-kb refresh`.
