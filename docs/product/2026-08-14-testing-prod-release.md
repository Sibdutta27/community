# testing-prod release — 2026-08-14

Bringing `yucayekeconnect.vercel.app` up to what `btf-testing.vercel.app` has been
serving. **The branch has been pushed; the database step has NOT been done.** Read
"What is broken until step 2 runs" before deciding how urgent that is.

## What moved

`testing-prod` fast-forwarded `4f81716` → `84bcb79` — 42 commits, no merge, no
conflicts, nothing on `testing-prod` that was not already in `btf-testing`.

`origin/main` is untouched, still at `2496d41` ("Initial project upload",
2026-05-18). It is not the source of either deployment and is deliberately left
alone.

Headline contents of the 42:

- the **Website Studio** (CMS in the admin panel: copy, yukayeke, media, history)
- the **admin rebuild** — density pass, real overview dashboard, ⌘K palette,
  consents per member, event calendar + registrant rosters
- **rejection reasons + the decision-notice queue**
- the **home hero** — spinning unissued tribal ID, page background rhythm
- **mobile fixes** — profile reachable from the drawer, `/yucayeke` map → description

## Step 2 — the database (NOT DONE, needs whoever holds prod credentials)

Four migrations have never been applied to the schema `testing-prod` reads.
Apply in this order:

```
20260812010000_add_enrollment_decision_record
20260812120000_add_content_key_registry
20260812130000_add_content_overrides
20260812150000_add_territory_and_media_overrides
```

### Targeting the right lane — read this before running anything

There is one database and several schemas as deployment lanes. **Three code paths
select that lane three different ways**, which is how `20260812010000` ended up on
`public` instead of the intended lane:

| Path                                  | How it picks the schema                                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Runtime API (`database.service.ts`)   | `DATABASE_SCHEMA` env → passed to the `PrismaPg` adapter                                                                     |
| `content:sync` (`syncContentKeys.ts`) | `DATABASE_SCHEMA` env → same adapter option                                                                                  |
| **`prisma migrate deploy`**           | **neither — `prisma.config.ts` sets the datasource from `DIRECT_URL \|\| DATABASE_URL` and nothing reads `DATABASE_SCHEMA`** |

So **setting `DATABASE_SCHEMA` does nothing for migrations.** Migrate follows only
the connection URL, and with no `?schema=` it writes to `public` — silently, and
reporting success. The lane must be in the URL:

```bash
# the ?schema= is the load-bearing part; DATABASE_SCHEMA is ignored here
DIRECT_URL='postgresql://…/<db>?schema=<lane>' \
  pnpm --filter yucayekeconnect-server exec prisma migrate deploy
```

Confirm afterwards that `_prisma_migrations` exists **in that lane**, not in `public`:

```sql
SELECT migration_name, finished_at
FROM "<lane>"._prisma_migrations
ORDER BY finished_at DESC LIMIT 5;
```

If `20260812010000_add_enrollment_decision_record` is already recorded in `public`
from the earlier misfire, that row does not help this lane — the lane needs its own
run, and the migration is additive so re-running it against the correct schema is
safe.

**All four are additive.** Every `DROP` in those files is a commented-out rollback
note, not a statement that runs. They create new tables and enums and add three
nullable columns to `Enrollment`. No column is `NOT NULL` without a default, so no
existing row can fail the migration and no existing data is touched.

Note the earlier record that `20260812010000` was applied to the `public` schema
only — `prod_sim` (or whichever schema this deployment uses) still needs it. Confirm
the target schema before running; Prisma schema-qualifies its SQL, so a run aimed at
the wrong lane silently hits `public`.

## Step 3 — after the migrations

```bash
# this one DOES read DATABASE_SCHEMA — the opposite of migrate above
DATABASE_SCHEMA='<lane>' pnpm --filter yucayekeconnect-server content:sync
```

It prints the lane it used (`schema=<lane>`); check that line rather than assuming.
Projects `apps/web/messages/{en,es}.json` into the `ContentKey` table. Without it the
Studio's Pages tab lists nothing to edit. It never deletes a key — a key the catalog
no longer has is marked `retiredAt`.

## What is broken until step 2 runs

The site does **not** go down. Specifically:

- **Public pages render normally.** Copy falls back to the git catalogs by design —
  `i18n/request.ts` merges Studio overrides over `messages/*.json`, and an
  unreachable or empty content API yields `{}`, which renders exactly what shipped.
  That fallback is the whole reason overrides are stored rather than replacing the
  catalog.
- **Website Studio errors.** Every read hits `ContentKey`/`ContentString`, which do
  not exist yet. Staff should not be pointed at it.
- **Enrollment approve/reject errors** on write — `decisionReason`, `decidedAt`,
  `decidedById` and the `EnrollmentNotice` table are missing. This is the one that
  blocks real staff work, and the reason step 2 should not wait.
- Media library and territory overrides error for the same reason.

## Verification once the database is done

```bash
curl -s https://yucayekeconnect.vercel.app/ | grep -c 'hero-id-card-rotor'   # 1
```

Then in the admin panel: open Website → Pages (keys listed), and approve or reject a
test enrollment (no 500).
