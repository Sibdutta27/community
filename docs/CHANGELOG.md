# Changelog

All notable changes to the Community monorepo are recorded here, categorized by
`[app/domain]` (see `docs/architecture/categories.yaml`). Maintained by the
`change-router` skill (`/change-router log <description>`). Format follows
[Keep a Changelog](https://keepachangelog.com/).

`app` ∈ `backend | web | admin`. `domain` ∈ the keys in `categories.yaml`
(`auth`, `enrollment`, `consent`, `documents`, `services`, `events`, `profile`,
`cultural-connection`, `admin-management`, `marketing-content`).

## [Unreleased]

### Added
- [repo/docs] App→Domain categorization map — docs/architecture/categories.yaml
- [repo/docs] As-built product PRD — docs/product/PRD.md
- [repo/docs] Admin design-system doc — docs/design-system-admin.md
- [repo/tooling] Knowledge/maintenance skills: create-prd (global), style-guide (global),
  change-router (project), community-kb upgrade — .claude/skills
- [repo/tooling] Playwright behavior-parity E2E suite (web + admin) — e2e/

### Changed
- [repo/tooling] Restructured into a pnpm + Turborepo monorepo: CommunityBackend→apps/api,
  CommunityFrontend→apps/web, communityAdminPanel→apps/admin; added root package.json,
  pnpm-workspace.yaml, turbo.json, tsconfig.base.json; single root pnpm-lock.yaml
- [repo/tooling] Scaffolded apps/pwa + apps/mobile placeholders and packages/ (planned shared pkgs)
- [repo/tooling] Hoisted husky/commitlint/lint-staged to the repo root
- [repo/docs] Repointed all docs/skills references to the apps/* layout

### Fixed
- [backend/infra] apps/api/.gitignore now correctly ignores /src/generated/prisma (was /generated/prisma)

### Removed
- [repo/tooling] Per-app npm/pnpm lockfiles (consolidated into one root pnpm-lock.yaml)
- [backend/infra] Stopped tracking the generated Prisma client (apps/api/src/generated/prisma — build artifact)
