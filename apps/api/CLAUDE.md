# apps/api — NestJS API

NestJS 11 + Prisma 7 (Postgres via `@prisma/adapter-pg`) REST API. JWT/passport auth, AWS S3 /
MinIO file storage, multer uploads. Full map: [`../../docs/architecture/backend.md`](../../docs/architecture/backend.md);
data model: [`../../docs/data-model.md`](../../docs/data-model.md).

## Layout

```
src/
  main.ts                      # bootstrap; CORS + global ValidationPipe
  app.module.ts                # root module, imports feature modules
  database/                    # DatabaseService extends PrismaClient
  common/                      # decorators, s3/, utils/ (password, formatters)
  config/s3.config.ts          # S3Client factory (AWS or MinIO)
  modules/
    auth/ user/ enrollment/    # enrollment has step1..step4 + common/ (config, guards, utils)
    document/ consent/ service/ event/ account/ profile/
    feedback/                  # in-app feedback / work orders (optional auth)
    admin/                     # adminUser, adminEnrollment, adminConsent, adminCulturalConnection,
                               # adminService, adminEvent, adminFeedback + guard/
```

## Conventions

- **File naming:** `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/*.ts`, `guards/*.ts`,
  `interfaces/*.ts`. PascalCase classes with the matching suffix.
- **Path alias:** `@/* → src/*` (e.g. `import { AppModule } from '@/app.module'`).
- **DB access:** inject `DatabaseService` (extends `PrismaClient`, manages connect/disconnect).
  Use `database.$transaction(async (tx) => …)` for multi-write atomicity.
- **Validation:** global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`.
  DTOs use class-validator + class-transformer; `@Transform()` for normalization.
- **Errors:** standard Nest `HttpException`s, no custom filters. Machine-readable codes
  (`missing_state_id`, …) are thrown as the message and localized by the frontends.

## Auth & guards

- JWT issued in `auth.service.ts`; payload `{ sub, email, role, publicId, name }`, **1h** expiry.
- Guards: `JwtAuthGuard` (bearer), `AdminAuthGuard` (`role === ADMIN`),
  `ConsentAcceptedGuard` (attaches `req.enrollment`, requires `consentAccepted`; gates every
  enrollment step write, `/enrollment/complete` and the whole `/document` controller),
  `ActivityGuard` (throttled `lastActiveAt` update), `OptionalJwtAuthGuard` (bearer that never
  blocks — used by `POST /feedback` so signed-out visitors can submit).
- Decorators: `@CurrentUser()`, `@CurrentEnrollment()`.
- Endpoints: `POST /auth/{register,login,admin-login}`. Admin routes under `/admin/*` use
  `JwtAuthGuard + AdminAuthGuard`.

## Enrollment gotchas

- **Consent is asked once**, at the start. `completeEnrollment` **derives** `agreedToTerms` from a
  valid e-signature + all-required-consents; the client-sent `agreedToTerms` is optional and
  ignored. Do not re-add a `consentAccepted: true` write there — `ConsentAcceptedGuard` already
  proved it; `consent.service.acceptConsents()` is the only writer of that flag.
- **Proof of identity** (`enrollment/step4/step4.utils.ts`): `STATE_ID` is required _in addition
  to_ 2 distinct identity-document types. Use `getMissingIdentityDocumentError()` — never
  re-implement the rule. Enforced in step-4 completion and in `completeEnrollment`; admin
  approval gating is deliberately left on the old 2-of-3 rule.
- **Yucayeke names** (`enrollment/common/config/yucayeke.config.ts`): `OFFICIAL_YUCAYEKES` is what
  the UI gets (`GET /enrollment/yucayekes`), `ACCEPTED_YUCAYEKE_VALUES` (official + legacy) is
  what `@IsIn` validates, and `canonicalizeYucayeke()` runs on write **and** read. Ancestry
  yucayeke fields stay free text on purpose.

## Files / S3

`common/s3/s3.service.ts` wraps AWS SDK v3 (put/delete/signed-url). `document/config.ts` holds the
**per-slot** policy (default pdf+images ≤10 MB; `USER_PHOTO`/`PROFILE_PICTURE` images-only;
`ORAL_HISTORY` also audio/video ≤100 MB) plus the single- vs multi-file type lists — enforced by
both `POST /document/upload` and the presign/confirm pair. Feedback attachments have their own
narrower policy in `feedback/config.ts`. S3 (virtual-host) or MinIO (path-style) via `S3_PROVIDER`.

## Run / DB / test

```bash
pnpm start:dev          # watch mode (nest start --watch)
pnpm db:generate        # prisma generate  → src/generated/prisma
pnpm db:migrate:deploy  # apply migrations
pnpm db:seed            # prisma/seed/seed.ts (users, consents, cultural connections,
                        #   service & event categories + items)
pnpm test               # jest (*.spec.ts)
```

- Copy `.env.copy → .env`. Vars: `DATABASE_URL`, `JWT_SECRET`, `S3_*` (`S3_PROVIDER` = aws|minio),
  `PORT` (default 3000). Optional, not in `.env.copy`: **`DATABASE_SCHEMA`** — the deployment
  lane, passed explicitly to the `PrismaPg` adapter because Prisma schema-qualifies its SQL
  (unset => `public`); honoured by `DatabaseService`, the seed and `prisma/scripts/*`.
- `compose.yaml` brings up **Postgres 16** + **MinIO** (S3 API :9000, console :9001) for local dev.
- The Prisma client is generated to `src/generated/prisma` (not `node_modules`) — re-run
  `db:generate` after schema changes.
- One-off remediation scripts live in `prisma/scripts/` (run by hand with `tsx`, not wired into
  the seed) — e.g. `reopen-step4-without-state-id.ts`.
