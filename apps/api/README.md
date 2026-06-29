# apps/api -- Community

## Render Deployment Notes

This app is now part of a pnpm + Turborepo monorepo. In Render Web Service settings set
the **Root Directory to the repo root** (so the workspace install works) and use:

- Build Command: `pnpm install --frozen-lockfile && pnpm --filter community-server build`
  - ensure `prisma generate` runs (Turbo wires `db:generate` before `build`, or add a
    `postinstall`/explicit `pnpm --filter community-server db:generate`).
- Start Command: `pnpm --filter community-server start:render`

(Alternatively set Root Directory to `apps/api` and prefix commands accordingly.)
`start:render` runs Prisma migrations (`prisma migrate deploy`) before starting the app.

Required environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `S3_REGION`
- `S3_ENDPOINT`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_BUCKET`
- `S3_PROVIDER`

Health check:

- Path: `/health`
