---
name: website-studio
description: Maintain and extend the Website Studio — the CMS inside the admin panel that lets staff edit the public site's copy, yukayeke territory details, and images. Use this skill whenever work touches site copy, the next-intl catalogs, `ContentKey`/`ContentString`/`TerritoryOverride`/`ContentMedia`, the `content` API module, `apps/admin/src/pages/Website/**`, `apps/web/src/i18n/**`, media slots, or `next.config.ts` image config — and also whenever someone asks to "change the wording on the site", "make X editable", "add a new page/section", "swap an image", or wonders why an edit is not showing up. Read it BEFORE adding message keys or touching `i18n/request.ts`, because several of the rules here are invisible in the code and breaking one takes a public page down.
---

# Website Studio

The CMS in the admin panel (**Website Studio** in the sidebar → Pages · Yukayeke · Media · History).

## The one idea everything rests on

**The git catalogs are the source of truth. The database only holds overrides.**

`apps/web/messages/{en,es}.json` ship the site's real copy. Postgres stores a sparse set of edits
layered on top at request time. Three things follow, and every rule below exists to protect them:

1. **The site cannot go blank.** API down, DB down, cache cold → the shipped catalog renders. This
   is the acceptance criterion for the whole feature: stop the API, clear `.next`, load the site in
   a fresh incognito window. If it does not render the original copy, something is wrong.
2. **`apps/web/src/i18n/messages.test.ts` keeps its teeth** — it still guards 990×2 real keys in CI.
3. **Rollback is a `DELETE`.** Git still has the original wording.

Never "simplify" this by moving the catalog into the database.

## Guardrails — each of these has already caused or prevented a real failure

| Rule                                                                                       | Why                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mergeMessages` **clones before writing**                                                  | The imported catalog is a module singleton shared by every request. Mutate it once and one visitor's override leaks into every later render, in both languages.                                                                                                      |
| An override only ever **replaces a string that already exists**                            | Stops the DB inventing keys or extending the one array leaf past its translations.                                                                                                                                                                                   |
| The content fetch uses **native `fetch` with `next: {revalidate, tags}`**                  | The axios client bypasses Next's Data Cache; using it makes this a real API call on every render.                                                                                                                                                                    |
| **No shared-cache header on `GET /content/messages`**                                      | An `s-maxage` in front of the API defeats publishing entirely: the web busts its Data Cache, re-fetches, and the edge returns the same stale copy. Every layer reports success while the edit stays invisible. Guarded by `content.controller.spec.ts`.              |
| An override must declare **exactly the placeholders its default declares**                 | next-intl throws on a missing argument, so dropping `<highlight>` from `home.hero.title` takes the homepage down. Enforced server-side in `content.service.ts` and mirrored in the editor.                                                                           |
| Only **editorial namespaces** are editable                                                 | `enrollment`, `profile`, `auth`, `errors`, `consent`, `dashboard`, `feedback`, `common` carry validation messages and legal declarations. Refused at the API — hiding them in the UI is not a control.                                                               |
| Territory `slug` / `geometryKey` / `legalName` / `apiNames` / `legacyNames` are **locked** | They back the GeoJSON join and the enrollment `@IsIn` validator. Editing one silently unmaps a territory or 400s a member mid-enrollment. `applyTerritoryOverride` spreads the _territory_, never the override, so this is structural — and a fuzzed test proves it. |
| The resolution graph is **never fed override data**                                        | `buildLookup()` / `resolveTerritory` stay on the git table, so an edited alias cannot cause a lookup collision.                                                                                                                                                      |
| Site images live in a **separate public bucket**                                           | `S3_BUCKET` holds birth certificates and identity documents. `PublicMediaStorageService` refuses to boot if the two match. Never modify the private bucket's policy.                                                                                                 |
| **SVG uploads are rejected**                                                               | An SVG on a public origin is a stored-XSS vector; the site's SVGs are design-system icons that belong in git.                                                                                                                                                        |

## Common tasks

### Make new copy editable

1. Add the key to **both** `messages/en.json` and `messages/es.json` (the parity test enforces this).
2. If its namespace is not already editorial, add it to `EDITABLE_NAMESPACES` in
   `apps/api/src/modules/content/content.util.ts` — and think hard, because editable means a
   non-developer can change it without review.
3. Run `pnpm --filter yucayekeconnect-server content:sync` against each lane.
4. If it belongs to a new page, add an entry to `apps/admin/src/pages/Website/pages.config.js`.

Skipping step 3 is safe: the key simply is not editable yet. Nothing breaks.

### Add a swappable image

1. Add the slot to `apps/web/src/content/media-slots.ts` with its shipped default — that file is
   simultaneously the allowlist and the fallback, so a missing DB row can never break an image.
2. Mirror it in the API's slot registry (`apps/api/src/modules/content/config.ts`). A test compares
   the two; they are hand-mirrored because the apps are separate TS projects.
3. Change the call site from a literal to `t("media.<slot>")`.

### Diagnose "my edit isn't showing"

In order: is it **published** (drafts are never public) · does `GET /content/messages` contain it ·
is `CONTENT_REVALIDATE_SECRET` set on **both** web and api and `WEB_BASE_URL` on api (without them
the edit lands within 60s instead of ~1s) · has a shared-cache header crept back onto the endpoint.

### Fold overrides back into git

Content edits deliberately bypass code review, so periodically move accumulated overrides into
`messages/{en,es}.json` in a PR and delete the rows. Git stays the long-term record and override
sprawl never accumulates. The History tab shows what to fold.

## Verification

```bash
pnpm --filter yucayekeconnect-server test          # content + territory + media specs
pnpm --filter yucayekeconnect-web test             # merge, fallback, slots, territory invariants
pnpm --filter yucayekeconnect-web build            # proves image swaps and remotePatterns
cd e2e && npx playwright test --project=cms        # the cross-app round-trip
```

The `cms` project is the only test that watches an edit travel from the admin panel to the public
site. It is **serial on purpose** — every case targets the same key and shares an `afterEach`
revert. It caught the caching bug that no local test could.

## Not done yet

- Alt text is stored, served and editable but the ~9 image call sites still use their i18n `alt`
  copy. The data is there when someone wires it.
- No delete for media — the library only grows. Needs a "this image is used in 2 slots" story.
- Territory saves publish immediately (no draft queue); the UI says so rather than implying one.
- `prod_sim` owes every migration this feature added.
