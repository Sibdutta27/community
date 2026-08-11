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

- [backend+admin/events+services] Event calendar + registrant rosters for staff (2026-08-11): new read endpoints behind `JwtAuthGuard + AdminAuthGuard` — `GET /admin/event/calendar?from&to&categoryId` (every event starting in the window, deliberately **unpaginated** so a month cell shows all of a day's events, capped at 500 `EVENT_CALENDAR_MAX`, declared before `@Get(':id')` so the literal path is not swallowed), `GET /admin/event/:id/registrations` and `GET /admin/service/:id/registrations` (paginated `{ event, data, count }` with search over member name/email/publicId, same page/limit contract as adminEnrollment/adminFeedback; the service rows also carry the per-registration `status` and take `registeredAt` from `ServiceRegistration.date`, which has no `createdAt`) plus `…/registrations/export` CSV twins written through the new `common/utils/csv.util.ts` (every field quoted, quotes doubled, UTF-8 BOM for Excel, `= + - @` defused against formula injection). **No schema change and no migration** — counts were already exposed via `_count.registrations`. Admin panel gains `/events/:id/registrations` + `/services/:id/registrations` (shared `components/Registrants/RegistrantsTable`: debounced search, server pagination, export button — the browser cannot read `Content-Disposition` across CORS, so `utils/downloadFile.util.js` names the file), an Events page that is Calendar (default) or List via `?view=calendar|list` with the month grid built from native `Date` math over CSS grid (**no calendar dependency**; a day → `/events/create?date=YYYY-MM-DD` prefilled, an event → edit, whose header now carries a **Registrants** button; each chip shows its count inline), and new `components/SectionNav` chrome — a slender flush bar with underline-style active markers (the member navbar paradigm rebuilt natively in MUI) exporting `SectionNav` (route links) + `ViewToggle`, which puts each surface's categories on the same bar as the surface and let the Sidebar's "Service Directory"/"Event Directory" submenus flatten to single Programs/Events entries (`alsoActiveOn` keeps the rail lit). Services read as "Programs" in copy only (routes unchanged) and ServiceList gained a Status filter + chips; both lists are typographic now instead of disabled `TextareaAutosize` cells — apps/api/src/modules/admin/{adminEvent,adminService}, apps/admin/src/pages/{Events,Services}
- [backend+admin/feedback] Staff surface for the feedback the widget collects (T7) — the `Feedback` table shipped write-only. New `FeedbackStatus` triage enum (`NEW`/`IN_REVIEW`/`RESOLVED`/`DECLINED`, default `NEW`, `[status, createdAt]` index) + migration `20260811210000_add_feedback_triage_status`; new admin sub-module behind `JwtAuthGuard + AdminAuthGuard` with `GET /admin/feedback` (paginated, newest first, optional status filter, message preview, submitter joined and anonymous rows flagged `isAnonymous`), `GET /admin/feedback/status-counts`, `GET /admin/feedback/:id` (full message + presigned attachment URL — storage keys never leave the API) and `PATCH /admin/feedback/:id/status` (any lane to any lane, so a "resolved" report can be reopened); admin panel gets a Feedback nav item, a filterable queue table and a detail view showing the message, page, locale, browser and attachment preview — apps/api/src/modules/admin/adminFeedback, apps/admin/src/pages/Feedback
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

### Changed (2026-07-20 sync, cont.)

- [backend+web/consent] **Consent asked ONCE** (T4, client 2026-07-20): the three separate asks collapse to one. `/enrollment/start` is now the single consent surface — the checkbox list extracted out of the deleted `dashboard-consent-dialog.tsx` into the presentational `ConsentChecklist` and rendered as a band on the enrollment introduction that precedes step 1; the dashboard just ensures an enrollment exists and routes there. Step 5 stops asking: `agreeToSubmit`/`agreeToTerms` are gone from the schema, defaults, payload and UI, replaced by a declaration paragraph (rich `<terms>`/`<privacy>` links, same pattern as sign-up) above the e-signature plus the new read-only `EnrollmentConsentSummary` — title, Required/Optional, version, `Accepted {date}` — sourced from `accountInfo.enrollment.consent` (no new endpoint) and mirroring admin's `ConsentReview`. Backend `completeEnrollment` DERIVES and persists `agreedToTerms: true` from a valid e-signature + the already-running all-required-consents check instead of trusting a client boolean (`agreedToTerms` relaxed to `@IsOptional()` for deploy skew); the redundant `consentAccepted: true` write dropped as a provable no-op behind `ConsentAcceptedGuard`. A required consent published mid-flow 403s "Consent not accepted", which the fetcher now maps to a redirect back to `/enrollment/start`. `ConsentAcceptedGuard` untouched. **The declaration + consent-summary copy is legal text needing BTF/counsel review before it reaches members** — apps/web/src/features/enrollment/components/enrollment-intro.tsx, apps/api/src/modules/enrollment/enrollment.service.ts

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
