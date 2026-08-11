# Backend Architecture — apps/api

NestJS 11 + Prisma 7 (Postgres via `@prisma/adapter-pg`). See also
[`../data-model.md`](../data-model.md) and [`../../apps/api/CLAUDE.md`](../../apps/api/CLAUDE.md).

## Module map (`src/`)

| Path                           | Responsibility                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main.ts`                      | Bootstrap; `enableCors()` + global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`                                               |
| `app.module.ts`                | Root module; imports all feature modules + `ConfigModule.forRoot({ isGlobal: true })`                                                             |
| `health.controller.ts`         | Health check                                                                                                                                      |
| `database/database.service.ts` | `DatabaseService extends PrismaClient` with `OnModuleInit/Destroy`; builds the `PrismaPg` adapter (see **Database lane** below)                   |
| `config/s3.config.ts`          | `S3Client` factory (AWS virtual-host or MinIO path-style)                                                                                         |
| `common/decorators/`           | `@CurrentUser()`, `@CurrentEnrollment()`                                                                                                          |
| `common/s3/s3.service.ts`      | put / delete / signed-url (AWS SDK v3)                                                                                                            |
| `common/utils/`                | `password.util.ts` (bcrypt, 12 rounds), `csv.util.ts` (every field quoted, UTF-8 BOM, `= + - @` defused), formatters                              |
| `modules/auth/`                | register / login / admin-login, JWT strategy, `guards/{auth,optionalAuth}.guard.ts`                                                               |
| `modules/user/`                | user lookup, profile photo upload, `guard/activity.guard.ts`                                                                                      |
| `modules/enrollment/`          | `step1`–`step4` submodules + `common/` (config, guards, services, utils); `EnrollmentStepService` tracks completion                               |
| `modules/document/`            | upload / presigned direct upload / list / delete (S3 + DB, transactional); `config.ts` holds the per-slot policy                                  |
| `modules/consent/`             | active consent templates, accept consents, `guards/consentAccepted.guard.ts`                                                                      |
| `modules/service/`             | services + categories + registrations                                                                                                             |
| `modules/event/`               | events + categories + registrations                                                                                                               |
| `modules/account/`             | account info, community metadata                                                                                                                  |
| `modules/profile/`             | user profile with documents                                                                                                                       |
| `modules/feedback/`            | in-app feedback / work orders (`POST /feedback`, optional attachment, optional auth)                                                              |
| `modules/admin/`               | `adminUser`, `adminEnrollment`, `adminConsent`, `adminCulturalConnection`, `adminService`, `adminEvent`, `adminFeedback` + `guard/AdminAuthGuard` |

Per-module files: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/*.ts`, `guards/*.ts`,
`interfaces/*.ts`.

## Database lane (`DATABASE_SCHEMA`)

Prisma schema-qualifies every generated query, so neither `?schema=` in the URL nor a
role-level `search_path` can redirect it — the adapter has to be told explicitly.
`DatabaseService` reads **`DATABASE_SCHEMA`** from config and passes it to `PrismaPg`
(unset => `public`, i.e. unchanged). `prisma/seed/seed.ts` and the one-off scripts in
`prisma/scripts/` honour the same variable, so a seed or backfill aimed at another lane
cannot silently land in `public`.

`onModuleInit` connects and pings (`SELECT 1`) but deliberately **does not rethrow**: on
serverless a cold/bad connection would otherwise fail Nest init and 500 every route,
including `/health`.

## Auth

- `auth.service.ts`: bcrypt verify → sign JWT `{ sub: user.id, email, role, publicId, name }`,
  expiry **1h**. `adminLogin()` additionally requires `role === ADMIN`. Updates `lastActiveAt`.
- `jwt.strategy.ts`: extracts bearer token, re-loads user by `payload.sub`, throws
  `UnauthorizedException` if missing.
- Guards:
  - `JwtAuthGuard` — `AuthGuard('jwt')`.
  - `AdminAuthGuard` — checks `user.role === 'ADMIN'`.
  - `ConsentAcceptedGuard` — loads enrollment, requires `consentAccepted === true`, attaches
    `req.enrollment` (read with `@CurrentEnrollment()`). Gates **every** enrollment write
    (`step1..4` upsert/save-draft, `step4/next`, `/enrollment/complete`) and the whole
    `/document` controller.
  - `EnrollmentEditable` — requires `status === DRAFT`; also attaches `req.enrollment`.
    **Currently wired nowhere**: its only reference is a commented-out entry on the `/document`
    controller. Draft-only enforcement lives inside the services instead.
  - `ActivityGuard` — throttled `lastActiveAt` bump (~1 min).
  - `OptionalJwtAuthGuard` — bearer auth that never blocks: a valid token attaches the user,
    anything else leaves `req.user` null (used by `POST /feedback`, which must serve signed-out
    visitors). Passport reports "no credentials" as `user === false`, so the guard uses a
    falsy check rather than `??`.

## Endpoint surface (representative)

| Method & path                                                                                               | Guards                                      | Notes                                                                                           |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `POST /auth/register`                                                                                       | —                                           | name, email, password                                                                           |
| `POST /auth/login`                                                                                          | —                                           | → `{ accessToken }`                                                                             |
| `POST /auth/admin-login`                                                                                    | —                                           | role-checked                                                                                    |
| `POST /user/upload-profile-photo`                                                                           | Jwt, Activity, FileInterceptor              | single file                                                                                     |
| `POST /enrollment/start`                                                                                    | Jwt, Activity                               | creates the enrollment + step rows 1–4 (idempotent; re-drafts a non-DRAFT enrollment)           |
| `GET /enrollment/yucayekes`                                                                                 | Jwt, Activity                               | `{ yucayekes }` — `OFFICIAL_YUCAYEKES`, the single source of truth for the step-1 select        |
| `GET /enrollment/step{1,2,3}`, `POST …/upsert`, `POST …/save-draft`                                         | Jwt, Activity (+ ConsentAccepted on writes) | step 1 = personal/contact/yucayeke; steps 2 & 3 = maternal / paternal kinship (`Ancestry`)      |
| `POST /enrollment/step4/next`                                                                               | Jwt, Activity, ConsentAccepted              | validates uploads and marks step 4 complete                                                     |
| `POST /enrollment/complete`                                                                                 | Jwt, Activity, ConsentAccepted              | e-signature + submit (see **Enrollment completion**)                                            |
| `POST /document/upload`                                                                                     | Jwt, ConsentAccepted, FileInterceptor       | per-slot mime/size policy                                                                       |
| `POST /document/presign-upload`, `POST /document/confirm`                                                   | Jwt, ConsentAccepted                        | direct-to-storage: presigned PUT, then record the `Document` (policy + ownership re-validated)  |
| `GET /document/list`, `POST /document/:id` (delete)                                                         | Jwt, ConsentAccepted                        |                                                                                                 |
| `GET /consent/active`, `POST /consent/accept`                                                               | — / Jwt, Activity                           | accepting all required consents is what sets `Enrollment.consentAccepted`                       |
| `GET /services`, `/services/categories`, `POST /services/register[-list]`                                   | — / Jwt                                     |                                                                                                 |
| `GET /events`, `/events/previous`, `/events/categories`, `POST /events/register[-list]`                     | — / Jwt                                     |                                                                                                 |
| `GET /account/info`, `/account/community-meta`                                                              | Jwt, Activity / —                           |                                                                                                 |
| `GET /profile`                                                                                              | Jwt, Activity                               | profile + documents                                                                             |
| `POST /feedback`                                                                                            | OptionalJwt, FileInterceptor(`attachment`)  | multipart: message, pageUrl, locale, userAgent? + optional file (jpeg/png/webp/pdf ≤10MB)       |
| `GET /admin/feedback`, `/admin/feedback/status-counts`, `/admin/feedback/:id`                               | Jwt, AdminAuthGuard                         | triage queue (page/limit/status, newest first), per-lane counts, detail + signed attachment URL |
| `PATCH /admin/feedback/:id/status`                                                                          | Jwt, AdminAuthGuard                         | `{ status: FeedbackStatus }` — any lane to any lane                                             |
| `GET /admin/enrollment[/submitted\|approved\|rejected\|status-counts]`, `/step-{1..4}/:id`, `/consents/:id` | Jwt, AdminAuthGuard                         | review queues + per-step detail                                                                 |
| `PATCH /admin/enrollment/:id/verify`, `/:id/ancestry/:relation/verification`, `/documents/:id/verify`       | Jwt, AdminAuthGuard                         | approve/reject enrollment, attest ancestry, verify a document                                   |
| `/admin/{user,consent,cultural-connection,service,event}/*`                                                 | Jwt, AdminAuthGuard                         | management CRUD                                                                                 |
| `GET /admin/event/calendar?from&to&categoryId`                                                              | Jwt, AdminAuthGuard                         | **unpaginated** window, cap 500 (`EVENT_CALENDAR_MAX`); declared before `@Get(':id')`           |
| `GET /admin/event/:id/registrations`, `…/registrations/export`                                              | Jwt, AdminAuthGuard                         | paginated roster `{ event, data, count }` (search name/email/publicId) + the full roster as CSV |
| `GET /admin/service/:id/registrations`, `…/registrations/export`                                            | Jwt, AdminAuthGuard                         | same shape + per-row `status`; `registeredAt` = `ServiceRegistration.date` (no `createdAt`)     |

## Enrollment completion & consent

`EnrollmentService.completeEnrollment()` (POST `/enrollment/complete`) checks, in order:
DRAFT status → **all required consents accepted** → steps 1–4 all present _and_ completed
(`Array.every` is vacuously true on an empty array, so the expected step numbers are
enumerated explicitly) → required documents re-validated → non-empty `signatureName` and a
parseable `signatureDate`. Only then does it write `status: SUBMITTED`, the signature, and
`agreedToTerms: true`.

Two deliberate properties:

- **`agreedToTerms` is derived, never echoed.** Consent is collected once, at the start of the
  flow, so a valid e-signature over an enrollment whose required consents are all accepted _is_
  the terms attestation. `CompleteEnrollmentDto.agreedToTerms` is `@IsOptional()` and ignored —
  kept only so a browser running the previous bundle mid-deploy is not 400'd by
  `forbidNonWhitelisted`. This row remains the platform's only stored ToS record; sign-up
  persists none.
- **`consentAccepted: true` is not written here.** The route sits behind `ConsentAcceptedGuard`,
  which 403s unless the flag is already true, and nothing in the method can clear it — the
  write could only restate what the guard proved. `consent.service.acceptConsents()` is the
  single writer of that flag.

## Proof-of-identity rule

`enrollment/step4/step4.utils.ts` owns the rule and both call sites share it:

- `REQUIRED_DOCUMENT_TYPES` = `[USER_PHOTO]` — the one mandatory upload.
- `IDENTITY_DOCUMENT_TYPES` = `STATE_ID`, `BIRTH_CERTIFICATE`, `SOCIAL_SECURITY_CARD`;
  `MIN_IDENTITY_DOCUMENTS` = 2 distinct types.
- `REQUIRED_IDENTITY_DOCUMENT_TYPES` = `[STATE_ID]` — client 2026-07-20: a government ID is
  required **in addition to** the 2-distinct-types minimum. A valid set is a state ID plus at
  least one of {birth certificate, social security card}.
- `getMissingIdentityDocumentError(documents)` → `'missing_state_id' | 'missing_identity_documents' | null`.
  The specifically-required type is checked first so the member is told exactly what is missing
  rather than getting the vaguer count message. `hasRequiredIdentityDocuments()` is the boolean
  wrapper. The codes are surfaced verbatim; the frontends map them to localized copy.

Enforced by `Step4Service.validateDocuments()` (step-4 completion) **and** re-checked in
`completeEnrollment` (step 4 may have passed before a document was deleted). Admin approval
gating was deliberately **not** tightened — it still accepts the old 2-of-3 set, so already
submitted applications are not stranded. Members whose step 4 completed under the old rule are
reopened by the one-off `prisma/scripts/reopen-step4-without-state-id.ts` (DRAFT enrollments
only; supports `--dry-run`).

## Yucayeke naming

`enrollment/common/config/yucayeke.config.ts` is the single source of truth for the step-1
yucayeke select, sourced from `data/naming/yucayeke-names/` (BTF's 2026-07-20 naming table,
adopting Arawakan corrections). Values are the Nation's **legal** names (`Yukayeke <Name>`)
because enrollment is the legal artifact; the map and directory render the bare corrected name.

- `OFFICIAL_YUCAYEKES` — served by `GET /enrollment/yucayekes` and rendered by the UI.
- `LEGACY_YUCAYEKES` — superseded spellings that must still _validate_ on write: `@IsIn` runs on
  every step-1 save including drafts of untouched fields, so a member holding "Guaynía" would
  otherwise 400 on a field they never touched. Never served to the UI.
- `ACCEPTED_YUCAYEKE_VALUES` = official + legacy — what `@IsIn` validates in `step1.dto.ts` and
  `step1SaveDraft.dto.ts`.
- `canonicalizeYucayeke()` — diacritic/case-insensitive legacy → official mapping, applied on
  **write** (`step1.service`, `step1.utils`) _and_ on **read**, so rows the backfill migration
  left alone still render canonically.

Ancestry (steps 2/3) yucayeke fields intentionally stay free text — a grandparent's historical
yucayeke may not appear on any official list.

## File uploads

`document/config.ts` defines a **per-slot policy**: `DEFAULT_DOCUMENT_POLICY` is pdf + images
(jpeg/png/webp) at 10 MB; `USER_PHOTO` / `PROFILE_PICTURE` are images-only; `ORAL_HISTORY`
additionally accepts audio/video up to **100 MB**. `getDocumentPolicy(type)` resolves it.
Presigned URLs live 15 min (upload) / 1 h (download).

`DocumentService`: **single-file** types (`PROFILE_PICTURE`, `USER_PHOTO`, `STATE_ID`,
`BIRTH_CERTIFICATE`, `SOCIAL_SECURITY_CARD`) are upserted (old deleted first); **multi-file**
types (`GENEALOGICAL_RECORDS`, `KINSHIP_LETTERS`, `ORAL_HISTORY`, `DNA_TESTING`) are appended.
Keys: `{type}/{id}` (single) or `{type}/{id}/{timestamp}-{uuid}` (multi). DB + S3 ops wrapped in
`$transaction`; orphan files deleted in try/catch. Both the multipart route and the
presign/confirm pair run the same policy checks.

`FeedbackService` reuses the same `S3Service` with a narrower policy (`feedback/config.ts`) —
jpeg/png/webp/pdf, max 10 MB, stored under `feedback/{uuid}-{safeName}`, plus length caps on the
free-text fields (message 4000, pageUrl 2048, locale 16, userAgent 512). Only the key is
persisted (private bucket); a failed row write deletes the just-uploaded object.
`AdminFeedbackService.getFeedbackDetail()` presigns the attachment on read and reports
`isAnonymous` / `submitter` for signed-out submissions.

## Build / run / test

| Command                              | Effect                                                           |
| ------------------------------------ | ---------------------------------------------------------------- |
| `npm run start:dev` / `dev`          | nest start --watch                                               |
| `npm run build` / `start:prod`       | compile / run dist                                               |
| `npm run start:render`               | `prisma migrate deploy && node dist/src/main.js` (Render deploy) |
| `npm run typecheck`                  | `tsc --noEmit`                                                   |
| `npm run db:generate`                | prisma generate → `src/generated/prisma`                         |
| `npm run db:migrate:deploy`          | apply migrations                                                 |
| `npm run db:seed`                    | `prisma/seed/seed.ts`                                            |
| `npm test` / `test:cov` / `test:e2e` | jest                                                             |

Env (`.env.copy → .env`): `DATABASE_URL`, `JWT_SECRET`, `S3_REGION/BUCKET/ACCESS_KEY/SECRET_KEY/
ENDPOINT/PROVIDER`, `PORT`. Optional: `DATABASE_SCHEMA` (deployment lane; unset => `public`) and
`DIRECT_URL` (preferred by the seed/scripts when present) — neither ships in `.env.copy`.
Local infra: `compose.yaml` (Postgres 16 :5432, MinIO :9000/:9001).
