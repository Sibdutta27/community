# Changelog

All notable changes to the Community monorepo are recorded here, categorized by
`[app/domain]` (see `docs/architecture/categories.yaml`). Maintained by the
`change-router` skill (`/change-router log <description>`). Format follows
[Keep a Changelog](https://keepachangelog.com/).

`app` ∈ `backend | web | admin`. `domain` ∈ the keys in `categories.yaml`
(`auth`, `enrollment`, `consent`, `documents`, `services`, `events`, `profile`,
`cultural-connection`, `feedback`, `admin-management`, `marketing-content`).

## [Unreleased]

### Added

- [backend+web/feedback] In-app feedback / work-order widget for the closed-beta focus groups: floating launcher on every page (public + auth + protected) opening a compact, keyboard-trapped panel that takes a plain-language note plus an optional screenshot and auto-captures the page URL, locale and browser agent; new `POST /feedback` (multipart, `OptionalJwtAuthGuard` so signed-out testers can report) storing a `Feedback` row with the attachment in the private S3 bucket; the support section's dead "chat" button now opens the same panel; `feedback` i18n namespace in en + es — apps/api/src/modules/feedback, apps/web/src/features/feedback
- [repo/docs] 2026-07-08 BTF x Stable sync transcript imported + change requests recorded as kanban cards S0–S6 — docs/product/transcripts/2026-07-08-btf-sync.md
- [backend+web/enrollment] Yucayeke official-names dropdown: `OFFICIAL_YUCAYEKES` config (placeholder pending BTF list) served via `GET /enrollment/yucayekes`, enforced with `@IsIn` on step-1 DTOs, select in the step-1 form — apps/api/src/modules/enrollment/common/config/yucayeke.config.ts
- [backend+web/documents] 2-of-3 proof-of-identity documents (STATE_ID / BIRTH_CERTIFICATE / SOCIAL_SECURITY_CARD): new single-file slots + policies, step-4 section with counter, enforced in step-4 next AND enrollment complete (`missing_identity_documents`) — apps/api/src/modules/enrollment/step4
- [backend+admin+web/enrollment] Admin-attested ancestry verification (`UNVERIFIED`/`VERIFIED_DNA`/`VERIFIED_GENEALOGY` + audit fields): admin select per kinship card, member edits that change a row reset it, positive badges on the profile lineage view — apps/api/src/modules/admin/adminEnrollment
- [admin/enrollment] Consent review panel on the approval step (`GET /admin/enrollment/consents/:id`) — apps/admin/src/pages/Enrollments/components/ConsentReview
- [web/profile] Interactive Yucayeke territory map at protected `/yucayeke/map`: token-colored SVG of Borikén (pure Web-Mercator, no map library), synced focusable territory list + reading panel (cacique, municipalities, en/es descriptions, confirmed vs oral-tradition badges), member's declared territory highlighted/pre-selected; canonical territory table reconciles `OFFICIAL_YUCAYEKES` ↔ contractor GeoJSON names; `yucayekeMap` i18n namespace; Playwright spec — apps/web/src/features/yucayeke
- [web/profile] Profile yucayeke tab recut around the new "Your Yucayeke" card (mini-map preview + identity + status + explore CTA); enrollment-progress metrics/family-circle/rhythm sections dropped as duplicates of other tabs — apps/web/src/features/profile/components/profile-yucayeke-panel.tsx
- [repo/docs] Contractor GIS package (yucayeke ecological communities) imported, unpacked, and reviewed under `data/gis/` (untracked pending LFS/prune decision): canonical June-2026 FileGDB + clean WGS84 GeoJSON exports + README documenting layers, historical basis, and QA findings (nationwide-TIGER bloat, 9 cacique seat points in neighboring polygons) — data/gis/yucayekeno-ecological-communities/README.md
- [web/enrollment] Introduction inside the enrollment flow (T3, client 2026-07-20): new protected `/enrollment/start` page rendered through the step layout at `step={0}` ("Overview" label, stepper visible with no active tab) — who you are enrolling with, the five steps mapped from `enrollmentStepDefinitions`, the step-4 upload slots with Required/Optional pills, and how the process works; dashboard sends first-timers there and returning members straight to step 1. **`enrollment.intro.nation.*` is PLACEHOLDER copy adapted from `about.story` and needs BTF's authoritative wording** — apps/web/src/features/enrollment/components/enrollment-intro.tsx

### Fixed (2026-07-20 sync)

- [web/marketing-content] Stale 4-step, maternal-only enrollment process copy corrected everywhere: the `/enrollment` + home process cards now map `enrollmentStepDefinitions` (5 cards incl. Paternal Kinship, "Create Account" demoted to a prerequisite line), and the lineage-records checklist, eligibility/benefits FAQ, sign-up panel, enrollment hero subtitle and the root CLAUDE.md domain summary all name maternal AND paternal kinship / five steps. Anti-drift regression test asserts card count + titles equal `enrollmentStepDefinitions` — apps/web/src/features/home/components/home-enrollment-process-section.tsx

### Changed (2026-07-20 sync)

- [backend+web+admin/documents] Government ID mandatory at enrollment: `STATE_ID` is now required _in addition to_ the 2-distinct-types minimum (valid = government ID + birth certificate or social security card). New `REQUIRED_IDENTITY_DOCUMENT_TYPES` + `getMissingIdentityDocumentError` return the specific `missing_state_id` code from step-4 next AND `completeEnrollment`; web mirrors the rule (asterisk on the ID card, Next gated, step-5 submit errors localized with a link back to step 4); admin Step-4 review gets Required chips + warning alerts. Admin **approval** gating intentionally left on the old rule so already-submitted applications are not hard-blocked — apps/api/src/modules/enrollment/step4/step4.utils.ts
- [backend/documents] One-off manual backfill reopens step 4 on DRAFT enrollments already marked complete without a `STATE_ID`, so those members are not stranded on a 400 at submit (not wired into `seed.ts`) — apps/api/prisma/scripts/reopen-step4-without-state-id.ts

### Changed (2026-07-08 sync)

- [backend+web/enrollment] Sex options per client spec: Female / Male / Intersex (optional field covers "prefer not to say"); existing `PREFER_NOT_TO_SAY` rows → NULL — apps/api/prisma/schema.prisma
- [backend+web/enrollment] Gender options per client spec: Woman / Man / Two-Spirit / Self-describe (+ `genderSelfDescribe` text, Arawak Two-Spirit term pending); `MALE→MAN`, `FEMALE→WOMAN` backfill — apps/api/prisma/schema.prisma
- [backend+web/consent] Consent-once: `/account/info` now returns `consentAccepted` + consent summary; dashboard only re-prompts for pending required active consents — apps/web/src/features/dashboard/components/dashboard-enrollment-section.tsx
- [repo/tooling] Package identities renamed to yucayekeconnect (`yucayekeconnect-monorepo`, `yucayekeconnect-server`, `yucayekeconnect-web`, `@yucayekeconnect/*`); cookies + domain strings unchanged; Render dashboard filter commands must follow — package.json
- [repo/tooling] apps/api + apps/admin get their own lint-staged blocks (root fallback had no eslint config and blocked commits; api code files are a documented no-op) — apps/api/package.json

### Fixed (2026-07-08 sync)

- [web/auth] Expired/invalid sessions now log out and redirect to /sign-in instead of rendering "unauthorized — showing fallback profile values": middleware treats an expired JWT cookie as unauthenticated and clears it; the fetcher logs out on any 401 from authenticated calls (auth forms opt out) — apps/web/middleware.ts

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

- [web/marketing-content] Azul-led Puerto-Rican-flag palette (60-30-10, WCAG AA): cool clean
  base, deep azul `#0a56a8` primary/ring, celeste `#4ea6dc` highlights, flag-red `#c42032`
  `--emphasis` (new Button `emphasis` variant on the "Enroll Today" + hero CTAs) and
  `--destructive` error token; swept all teal/`red-*` hardcodes — apps/web tokens.css,
  globals.css, ui/*, navbars, hero, auth/profile/enrollment styles
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
