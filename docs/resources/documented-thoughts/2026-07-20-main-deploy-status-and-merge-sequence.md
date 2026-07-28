---
date: 2026-07-20
context: BTF sync implementation session — inspected main/production before merging staging (btf-testing) into it
status: raw
related: []
---

# Main is live but old — the merge must wait for the DB backup

Main's Vercel link (`community-frontend-web.vercel.app`) is up and people's accounts/logins
work on it today, but it runs the old app, and its whole stack (web project + API + the
database with the real registered users) lives in **Sibdutta27's Vercel account**, not ours.
We only own the `btf-testing-*` staging projects.

Main's branch is likely git-connected to that Vercel, so pushing to main should auto-deploy
it — which is exactly why we must NOT merge yet:

1. New frontend + their old API/DB = the site breaks instantly for users.
2. If their API deploy runs `prisma migrate deploy` on start, the push could migrate the
   production database destructively **before** we've taken the backup.
3. Uploads need `S3_*` env vars typed into their project settings — only Sibdutta27 can.

Safe sequence: get prod `DATABASE_URL` from Sibdutta27 → pg_dump backup → apply migrations
ourselves → merge + push main (auto-deploy fires against an already-migrated DB) → he pastes
the `S3_*` vars + fixes build commands (package renamed `community-server` →
`yucayekeconnect-server`) → smoke test. Then existing users log in with the same credentials
and enroll for real.

One ask to bundle for Sibdutta27: prod `DATABASE_URL` (or project access) + the GitHub repo
rename to `yucayekeconnect`. Alternative if he's slow: re-home production under our account
(mirror the working staging setup) and only get a one-time users-table export from him.

Staging is fully verified: all features live on btf-testing, 32/32 Playwright green.
