# apps/api — NestJS API

NestJS 11 + Prisma 7 (Postgres via `@prisma/adapter-pg`) REST API. JWT/passport auth, AWS S3 /
MinIO file storage, multer uploads. Full map: [`../../docs/architecture/backend.md`](../../docs/architecture/backend.md);
data model: [`../../docs/data-model.md`](../../docs/data-model.md).

## Layout

```
src/
  main.ts                      # bootstrap; global ValidationPipe
  app.module.ts                # root module, imports feature modules
  database/                    # DatabaseService extends PrismaClient
  common/                      # decorators, s3/, utils/ (password, formatters)
  config/s3.config.ts          # S3Client factory (AWS or MinIO)
  modules/
    auth/ user/ enrollment/    # enrollment has step1..step4 + common/
    document/ consent/ service/ event/ account/ profile/
    admin/                     # adminUser, adminEnrollment, adminConsent,
                               # adminCulturalConnection, adminService, adminEvent + guard/
```

## Conventions

- **File naming:** `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/*.ts`, `guards/*.ts`,
  `interfaces/*.ts`. PascalCase classes with the matching suffix.
- **Path alias:** `@/* → src/*` (e.g. `import { AppModule } from '@/app.module'`).
- **DB access:** inject `DatabaseService` (extends `PrismaClient`, manages connect/disconnect).
  Use `database.$transaction(async (tx) => …)` for multi-write atomicity.
- **Validation:** global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`.
  DTOs use class-validator + class-transformer; nested objects via `@ValidateNested()` + `@Type()`.
  `@Transform()` for normalization (e.g. lowercase email).
- **Errors:** standard Nest `HttpException`s (`BadRequest/Unauthorized/Forbidden/NotFound/Conflict`).
  No custom exception filters.

## Auth & guards

- JWT issued in `auth.service.ts`; payload `{ sub, email, role, publicId, name }`, **1h** expiry.
  Strategy `jwt.strategy.ts` re-loads the user via `userService.findById(payload.sub)`.
- Guards: `JwtAuthGuard` (bearer), `AdminAuthGuard` (`role === ADMIN`),
  `ConsentAcceptedGuard` (attaches `req.enrollment`, requires `consentAccepted`),
  `ActivityGuard` (throttled `lastActiveAt` update).
- Decorators: `@CurrentUser()`, `@CurrentEnrollment()`.
- Endpoints: `POST /auth/{register,login,admin-login}`. Admin routes under `/admin/*` use
  `AdminAuthGuard`.

## Files / S3

`common/s3/s3.service.ts` wraps AWS SDK v3 (put/delete/signed-url). `DocumentService` validates
mime (jpeg/png/webp/pdf, ≤10MB), upserts single-file types (PROFILE_PICTURE, USER_PHOTO,
BIRTH_CERTIFICATE) and appends multi-file types (FAMILY_PHOTO, ADDITIONAL_EVIDENCE). Supports both
S3 (virtual-host) and MinIO (path-style) via `S3_PROVIDER`.

## Run / DB / test

```bash
pnpm start:dev          # watch mode (nest start --watch)
pnpm db:generate        # prisma generate  → src/generated/prisma
pnpm db:migrate:deploy  # apply migrations
pnpm db:seed            # prisma/seed/seed.ts (users, consents, cultural connections,
                           #   service & event categories + items)
pnpm test                   # jest (*.spec.ts)
```

- Copy `.env.copy → .env`. Vars: `DATABASE_URL`, `JWT_SECRET`, `S3_*` (`S3_PROVIDER` = aws|minio),
  `PORT` (default 3000).
- `compose.yaml` brings up **Postgres 16** + **MinIO** (S3 API :9000, console :9001) for local dev.
- The Prisma client is generated to `src/generated/prisma` (not `node_modules`) — re-run
  `db:generate` after schema changes.
