# Portable backend image — the transferability artifact.
#
# Same NestJS app as the Vercel serverless staging deploy, but using the long-running
# entry (dist/src/main.js). On the private server, run this image with env pointing at
# the Postgres + MinIO from compose.yaml — moving from staging is an ENV-ONLY change.
#
# bcryptjs is pure-JS, so there's no native addon to rebuild per platform.
#
# NOTE: this builds apps/api standalone (it has no workspace:* deps). It is the
# portability scaffold for the eventual private-server deploy and should be validated
# as part of that work.

# ---- builder ----
FROM node:22-slim AS builder
RUN corepack enable
WORKDIR /app
COPY package.json ./
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm run db:generate && pnpm run build

# ---- runner ----
FROM node:22-slim AS runner
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY prisma ./prisma
RUN pnpm install --prod --no-frozen-lockfile
COPY --from=builder /app/dist ./dist
EXPOSE 3000
# For first boot you may want migrations: `prisma migrate deploy && node dist/src/main.js`
# (the repo's start:render script). Kept as plain start here; run migrations deliberately.
CMD ["node", "dist/src/main.js"]
