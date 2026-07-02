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
- [web/enrollment] Confirmation/e-signature step + success screen + jump-to-visited-section navigation
- [backend/enrollment] Unified `Ancestry` model (maternal + paternal kinship), `Sex` enum, e-signature fields
- [backend/consent] Evergreen-collective-memory consent + reworded communication consent
- [repo/tooling] 6.031 principled-code-review skill (global) — used as the quality gate

### Changed
- [repo/tooling] Restructured into a pnpm + Turborepo monorepo: CommunityBackend→apps/api,
  CommunityFrontend→apps/web, communityAdminPanel→apps/admin; added root package.json,
  pnpm-workspace.yaml, turbo.json, tsconfig.base.json; single root pnpm-lock.yaml
- [repo/tooling] Scaffolded apps/pwa + apps/mobile placeholders and packages/ (planned shared pkgs)
- [repo/tooling] Hoisted husky/commitlint/lint-staged to the repo root
- [repo/docs] Repointed all docs/skills references to the apps/* layout
- [web+backend/enrollment] Rebuilt the enrollment form to Brittany Gene's Figma: Demographics →
  Maternal Kinship → Paternal Kinship → Documents → Confirmation; trimmed demographics; new
  document types (genealogical/kinship/oral-history/DNA)
- [web/marketing-content] Minimal Inter/black-&-white design system + landing copy →
  "Taíno Nation of Borikén" brand ("Enroll Today", Sovereign Data/Community Help rewrites, phone removed)
- [web/marketing-content] Replaced logo + favicon with the new brand seal (optimized)
- [web/profile] Profile surfaces a Kinship & Ancestry section; document buckets updated to new types
- [admin/enrollment] Admin enrollment detail renders maternal/paternal kinship + trimmed demographics + e-signature

### Fixed
- [backend/infra] apps/api/.gitignore now correctly ignores /src/generated/prisma (was /generated/prisma)
- [backend/enrollment] step1 sex/gender/marital-status enum validation (bad value now 400, was 500);
  marital status no longer silently defaults to SINGLE when unselected
- [backend/consent] "Enrollment not found" → 404 and "required consents" → 400 (were 500)
- [web/enrollment] Clear `hasMinorChildren` when "has children" flips to No (was a stale write);
  step-4 completion now calls the backend (previously never marked complete)

### Removed
- [repo/tooling] Per-app npm/pnpm lockfiles (consolidated into one root pnpm-lock.yaml)
- [backend/infra] Stopped tracking the generated Prisma client (apps/api/src/generated/prisma — build artifact)
- [backend/enrollment] Dropped `MaternalLineage` (5-generation), `Address`, `EmergencyContact`, the
  cultural-connection enrollment step, and unused demographic columns (pronouns/education/languages/
  skills/middle-&-maternal-&-preferred-name) — superseded by the Figma rebuild
