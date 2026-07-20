# Kanban — Enrollment redesign + client changes

Source of truth for parallel-agent execution. Sources: **Figma** `2XOuH00zOvYyfPoZyvTxfn` (baseline
structure/style/copy) + **client changes** (`client-change-requests.md`, overrides on top). Each card
is independently executable: scope · files · tests · deps · category. Categories per
`docs/architecture/categories.yaml`.

## Definition of Done (loop stop condition)

All cards Done · `turbo build|typecheck|lint` green · backend jest + web Vitest green · Playwright e2e
(parity + new) green · deployed to btf-testing + live smoke green.

## Rules

Parallel within a phase; sequential across phases. Phase 0 (F2 design + F4 schema) lands before
Phase 1 feature cards. Concurrent writers use git worktrees + integration merge. Keep Zod ↔ mappers ↔
DTOs ↔ types ↔ BFF in sync.

## Board

- **Blocked (needs Brittany Gene Figma):** E2•, E3•, E4• (field/label specifics only)
- **Ready (Phase 0):** F1, F2, F3, F4
- **Backlog (Phase 1, after F2+F4):** L1–L5, E1, E5, E6, E7, E8, E9, B1, B2, B3, C1, A1
- **Backlog (Phase 2):** V (integrate/verify/deploy)
- **Blocked (2026-07-08 sync, needs client input):** S3• (official yucayeke list + map from BTF), S2• (Arawak Two-Spirit term from Priscilla — ship extensible without it)
- **Ready (2026-07-08 sync):** S1, S2, S3 (mechanism w/ placeholder list), S4, S5, S6
- **In progress:** F1
- **Done:** S0

---

## Cards

### Phase 0 — Foundation

- **F1** [infra] Branch + kanban + Vercel git. Files: (repo) branch `btf-testing`, `docs/product/*`; connect btf-testing/-admin/-api Vercel to branch. Tests: deploy smoke. Deps: —.
- **F2** [web/design-system] Inter + B&W tokens (`apps/web/src/styles/tokens.css`, `fonts.ts`, `app/globals.css`); restyle `apps/web/src/components/ui/{button,input,select,checkbox,radio-group,textarea,form}.tsx`, `components/layout/{public-navbar,public-footer}.tsx`, `components/shared/brand-mark.tsx`; `/style-guide refresh frontend`. Tests: RTL per primitive. Deps: F3 (for tests).
- **F3** [web/tooling] Vitest + Testing Library in `apps/web`; `test` script + `turbo test`. Tests: sample. Deps: —.
- **F4** [backend/data-model] `apps/api/prisma/schema.prisma`: `MaritalStatus += DOMESTIC_PARTNERSHIP`; paternal+maternal lineage (`RelationType`, rename `MaternalLineage`→`Lineage`); `Yucayeke` select + `Identity` enum (Arawak/Kalinago/Garifuna/Taíno) + has-children + e-sign/terms fields; evergreen-memory `Consent` (seed). One migration → btf-testing Supabase (session pooler) + seed + regen. Tests: jest schema/enum + migration smoke. Deps: —.

### Phase 1 — Landing copy [web/marketing-content] (file-partitioned, parallel)

- **L1** brand+CTAs: `config/site.ts`, `components/shared/brand-mark.tsx`, `layout/public-navbar.tsx`, `public-footer.tsx` (Taíno Nation→Taíno Nation of Borikén; Apply Now→Enroll Today). Tests: RTL.
- **L2** hero: `features/home/components/home-hero.tsx` (heading/paragraph; 5M+→"Tribal Citizens" placeholder). Tests: RTL.
- **L3** heritage: `home-heritage-section.tsx` (mission, Sovereign Data, Community Help rewrites). Tests: RTL.
- **L4** member services: `home-member-services-section.tsx` (Comprehensive Support rewrite; remove phone `Call: 109 02001`) + footer phone. Tests: RTL (no phone).
- **L5** yucayeke+FAQ: `home-yucayeke-overview-section.tsx` (12→18 TODO), `home-enrollment-faq-section.tsx`, `home-enrollment-process-section.tsx`. Tests: RTL.

### Phase 1 — Enrollment [web/enrollment] (deps F2, F4)

- **E1** pre-app landing (Figma 17:50): restyle public `/enrollment` + copy. Tests: RTL + e2e loads.
- **E2** • demographics+yucayeke (17:66): step-1 restyle + yucayeke select + has-children + identity + domestic partnership; sex/gender per Brittany Gene. Tests: RTL + e2e. Blocked: field specifics.
- **E3** • ancestry maternal (17:134): rename Maternal→Ancestry; restyle; per-ancestor yucayeke. Tests: RTL + e2e. Blocked: labels.
- **E4** • ancestry paternal (17:205): NEW paternal step. Tests: RTL + e2e. Blocked: labels.
- **E5** documents (17:242): restyle step-4 + doc types (genealogical/kinship/oral/DNA; Add Record). Tests: RTL + e2e.
- **E6** confirmation/e-sign (17:373): NEW sign+terms→submit. Tests: RTL + e2e.
- **E7** success (17:349): NEW. Tests: RTL + e2e.
- **E8** jump nav: relax `features/enrollment/config/enrollment-steps.ts` gating + progress → started/visited only. Tests: unit + e2e.
- **E9** hero/progress/section restyle to Figma. Tests: RTL.

### Phase 1 — Backend [backend/*] (deps F4)

- **B1** step1 DTO/service/mapper (`modules/enrollment/step1/step1.utils.ts`): marital+identity+has-children. Tests: jest.
- **B2** step2 service/DTO: bidirectional ancestry + per-ancestor yucayeke. Tests: jest.
- **B3** confirmation/e-sign persistence + submit transition. Tests: jest.
- **C1** [backend+web/consent] add evergreen-memory consent (`prisma/seed/consent.seed.ts` + `dashboard-consent-dialog.tsx`); reword communication consent. Tests: jest + RTL.

### Phase 1 — Admin [admin/enrollment]

- **A1** show new fields (paternal, yucayeke, identity, e-sign) in `apps/admin` enrollment detail. Tests: manual/e2e.

### Phase 2 — Integration + verify

- **V** merge → `turbo build typecheck lint` → jest + Vitest → Playwright e2e (parity + new) → migrate/seed + deploy btf-testing → live smoke → DoD.

### 2026-07-08 sync (transcript: `transcripts/2026-07-08-btf-sync.md`)

Schema for S2/S4/S5 lands as ONE migration (`client_features_gender_ancestry_verification_identity_docs`).

- **S0** [web/auth] 401/expired-cookie fix — logout+redirect instead of fallback profile values. Files: `apps/web/middleware.ts`, `services/http/fetcher.ts`, `features/auth/lib/auth-mutations.ts`. Tests: e2e expired-session. Deps: —. **Done** (commit d7cfe24).
- **S1** [backend+web/enrollment+admin] consent-once: return `consentAccepted`+consent summary from `/account/info` (`account.service.ts`); dashboard opens consent dialog only for pending required active consents (`dashboard-enrollment-section.tsx`); admin `GET /admin/enrollment/consents/:enrollmentId` + ConsentReview in `EnrollmentApproval.jsx`. Tests: jest account shape · Vitest dialog gating · e2e no re-prompt. Deps: —.
- **S2** • [backend+web/enrollment] sex/gender reshape: `Sex {FEMALE,MALE,INTERSEX}`, `Gender {WOMAN,MAN,TWO_SPIRIT,SELF_DESCRIBE}` + `genderSelfDescribe` (extensible for pending Arawak term). Files: schema, step1 DTOs/service/utils, `enrollment-step-one-form.{ts,tsx}`, types, en/es messages, admin `Step1Review.jsx`. Tests: jest DTO · Vitest form+i18n parity · e2e options. Deps: migration.
- **S3** • [backend+web/enrollment] yucayeke official-names dropdown: `yucayeke.config.ts` `OFFICIAL_YUCAYEKES` (placeholder until BTF list), `@IsIn` in step1 DTOs, `GET /enrollment/yucayekes` + BFF route + query, select in step-1 form; ancestry steps stay free-text. Tests: jest DTO · Vitest dropdown · e2e select. Deps: —.
- **S4** [backend+web/enrollment] 2-of-3 identity docs: `document/config.ts` += STATE_ID, SOCIAL_SECURITY_CARD, BIRTH_CERTIFICATE (policies+SINGLE_FILE_TYPES); `step4.utils.ts` `IDENTITY_DOCUMENT_TYPES`+min-2 rule enforced in `step4.service.ts` AND `completeEnrollment`; web step-4 identity slot section + gating + i18n. Tests: jest 0/1/2-of-3 matrix · Vitest gating · e2e upload+submit. Deps: migration.
- **S5** [backend+admin+web/profile] verified-ancestry: `Ancestry.verificationStatus {UNVERIFIED,VERIFIED_DNA,VERIFIED_GENEALOGY}`+verifiedAt/byUserId; member edit resets to UNVERIFIED; admin `PATCH /admin/enrollment/:id/ancestry/:relation/verification` + Select in `KinshipReview.jsx`; badge in `profile-kinship-panel.tsx` (positive badges only). Tests: jest service+reset · Vitest badge · e2e admin sets→member sees. Deps: migration.
- **S6** [infra] merge btf-testing→main (fast-forward) + prod reconciliation: pg_dump prod DB → `prisma migrate deploy` → prod Vercel env (`NEXT_PUBLIC_API_BASE_URL`, `S3_*`→Supabase Storage, `VITE_API_URL`) → prod smoke. Deps: S1–S5 green.
