# Backend Architecture — apps/api

NestJS 11 + Prisma 7 (Postgres via `@prisma/adapter-pg`). See also
[`../data-model.md`](../data-model.md) and [`../../apps/api/CLAUDE.md`](../../apps/api/CLAUDE.md).

## Module map (`src/`)

| Path                           | Responsibility                                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `main.ts`                      | Bootstrap; registers global `ValidationPipe({ whitelist, forbidNonWhitelisted, transform })`                                     |
| `app.module.ts`                | Root module; imports all feature modules + `ConfigModule.forRoot()`                                                              |
| `health.controller.ts`         | Health check                                                                                                                     |
| `database/database.service.ts` | `DatabaseService extends PrismaClient` with `OnModuleInit/Destroy`; uses `PrismaPg` adapter                                      |
| `config/s3.config.ts`          | `S3Client` factory (AWS virtual-host or MinIO path-style)                                                                        |
| `common/decorators/`           | `@CurrentUser()`, `@CurrentEnrollment()`                                                                                         |
| `common/s3/s3.service.ts`      | put / delete / signed-url (AWS SDK v3)                                                                                           |
| `common/utils/`                | `password.util.ts` (bcrypt, 12 rounds), formatters                                                                               |
| `modules/auth/`                | register / login / admin-login, JWT strategy, guards                                                                             |
| `modules/user/`                | user lookup, profile photo upload                                                                                                |
| `modules/enrollment/`          | `step1`–`step4` submodules + `common/`; `EnrollmentStepService` tracks completion                                                |
| `modules/document/`            | upload/list/delete documents (S3 + DB, transactional)                                                                            |
| `modules/consent/`             | active consent templates, accept consents                                                                                        |
| `modules/service/`             | services + categories + registrations                                                                                            |
| `modules/event/`               | events + categories + registrations                                                                                              |
| `modules/account/`             | account info, community metadata                                                                                                 |
| `modules/profile/`             | user profile with documents                                                                                                      |
| `modules/feedback/`            | in-app feedback / work orders (`POST /feedback`, optional attachment)                                                            |
| `modules/admin/`               | `adminUser`, `adminEnrollment`, `adminConsent`, `adminCulturalConnection`, `adminService`, `adminEvent` + `guard/AdminAuthGuard` |

Per-module files: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/*.ts`, `guards/*.ts`,
`interfaces/*.ts`.

## Auth

- `auth.service.ts`: bcrypt verify → sign JWT `{ sub: user.id, email, role, publicId, name }`,
  expiry **1h**. `adminLogin()` additionally requires `role === ADMIN`. Updates `lastActiveAt`.
- `jwt.strategy.ts`: extracts bearer token, re-loads user by `payload.sub`, throws
  `UnauthorizedException` if missing.
- Guards:
  - `JwtAuthGuard` — `AuthGuard('jwt')`.
  - `AdminAuthGuard` — checks `user.role === 'ADMIN'`.
  - `ConsentAcceptedGuard` — loads enrollment, requires `consentAccepted === true`, attaches
    `req.enrollment` (read with `@CurrentEnrollment()`).
  - `ActivityGuard` — throttled `lastActiveAt` bump (~1 min).
  - `OptionalJwtAuthGuard` — bearer auth that never blocks: a valid token attaches the user,
    anything else leaves `req.user` null (used by `POST /feedback`, which must serve signed-out
    visitors).

## Endpoint surface (representative)

| Method & path                                                                           | Guards                                      | Notes                                                                                     |
| --------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `POST /auth/register`                                                                   | —                                           | name, email, password                                                                     |
| `POST /auth/login`                                                                      | —                                           | → `{ accessToken }`                                                                       |
| `POST /auth/admin-login`                                                                | —                                           | role-checked                                                                              |
| `POST /user/upload-profile-photo`                                                       | Jwt, Activity, FileInterceptor              | single file                                                                               |
| `GET/POST /enrollment/step1..4`                                                         | Jwt, Activity (+ ConsentAccepted on writes) | multi-step form                                                                           |
| `POST /document/upload`                                                                 | Jwt, ConsentAccepted, FileInterceptor       | mime/size validated                                                                       |
| `GET /document/list`, `POST /document/:id` (delete)                                     | Jwt, ConsentAccepted                        |                                                                                           |
| `GET /consent/active`, `POST /consent/accept`                                           | — / Jwt, Activity                           |                                                                                           |
| `GET /services`, `/services/categories`, `POST /services/register[-list]`               | — / Jwt                                     |                                                                                           |
| `GET /events`, `/events/previous`, `/events/categories`, `POST /events/register[-list]` | — / Jwt                                     |                                                                                           |
| `GET /account/info`, `/account/community-meta`                                          | Jwt / —                                     |                                                                                           |
| `GET /profile`                                                                          | Jwt, Activity                               | profile + documents                                                                       |
| `POST /feedback`                                                                        | OptionalJwt, FileInterceptor(`attachment`)  | multipart: message, pageUrl, locale, userAgent? + optional file (jpeg/png/webp/pdf ≤10MB) |
| `/admin/*`                                                                              | AdminAuthGuard                              | management CRUD                                                                           |

## File uploads

`DocumentService`: allowed mime jpeg/png/webp/pdf, max 10MB. **Single-file** types
(`PROFILE_PICTURE`, `USER_PHOTO`, `BIRTH_CERTIFICATE`) are upserted (old deleted first);
**multi-file** types (`FAMILY_PHOTO`, `ADDITIONAL_EVIDENCE`) are appended. Keys:
`{type}/{id}` (single) or `{type}/{id}/{timestamp}-{uuid}` (multi). DB + S3 ops wrapped in
`$transaction`; orphan files deleted in try/catch.

`FeedbackService` reuses the same `S3Service` with a narrower policy — jpeg/png/webp/pdf, max
10MB, stored under `feedback/{uuid}-{safeName}`. Only the key is persisted (private bucket);
a failed row write deletes the just-uploaded object.

## Build / run / test

| Command                              | Effect                                                           |
| ------------------------------------ | ---------------------------------------------------------------- |
| `npm run start:dev`                  | nest start --watch                                               |
| `npm run build` / `start:prod`       | compile / run dist                                               |
| `npm run start:render`               | `prisma migrate deploy && node dist/src/main.js` (Render deploy) |
| `npm run db:generate`                | prisma generate → `src/generated/prisma`                         |
| `npm run db:migrate:deploy`          | apply migrations                                                 |
| `npm run db:seed`                    | `prisma/seed/seed.ts`                                            |
| `npm test` / `test:cov` / `test:e2e` | jest                                                             |

Env (`.env.copy → .env`): `DATABASE_URL`, `JWT_SECRET`, `S3_REGION/BUCKET/ACCESS_KEY/SECRET_KEY/
ENDPOINT/PROVIDER`, `PORT`. Local infra: `compose.yaml` (Postgres 16 :5432, MinIO :9000/:9001).
