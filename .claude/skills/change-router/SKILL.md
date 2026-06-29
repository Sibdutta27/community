---
name: change-router
description: >-
  Routes and records changes in the Community monorepo. In "locate" mode it reads
  docs/architecture/categories.yaml and pinpoints which App -> Domain section(s) and the
  exact files/areas a change request should touch. In "log" mode it appends a
  categorized entry to docs/CHANGELOG.md for a completed change. Use when the user asks
  "where do I change X", "which files handle Y", "what area/owns Z", "route this change",
  "log this change", or "add to / update the changelog".
when_to_use: >-
  "where do I change", "which files handle", "what owns this feature", "locate the code
  for", "route this change", "log this change", "add to the changelog", "record what we
  changed"
argument-hint: "locate <request> | log <description>"
disable-model-invocation: false
user-invocable: true
allowed-tools: Read Grep Glob Edit Bash(git *)
---

# change-router

Two modes over the App->Domain taxonomy in `docs/architecture/categories.yaml`:

- **`locate <request>`** — find where a change should happen (read-only).
- **`log <description>`** — append a categorized entry to `docs/CHANGELOG.md` for a
  change that's already done.

The taxonomy file (`categories.yaml`) is the source of truth and is **owned by the
`community-kb` skill** — this skill only reads it. If a request maps to an area not in
the map, say so and suggest `/community-kb refresh` to add it first.

## Mode: locate

1. **Load the map.** Read `docs/architecture/categories.yaml`.
2. **Match.** Map the request to one or more `domains` using keywords + each domain's
   `desc`. If it's genuinely ambiguous between domains, ask ONE disambiguating question;
   otherwise proceed with the best match(es).
3. **Narrow to files.** For each matched App->Domain, list the representative paths from
   the map, then `grep`/`glob` within them to surface the exact files likely to change
   (controllers/DTOs/services for backend; routes/features/api handlers for web; pages/
   api for admin).
4. **Add cross-cutting touches.** Check the `cross-cutting` section and include them when
   relevant — e.g. a data-shape change implies `CommunityBackend/prisma/schema.prisma`
   **and** `docs/data-model.md`; a UI change implies the design tokens + a `/style-guide
   check`.
5. **Output a routed plan.** Per app: the domain, the concrete files, and the order of
   work. **Remind: the backend is the source of truth — change the API/DTO before the
   frontends.** End with handoffs: `/style-guide check <app>` for UI work, and
   `/community-kb refresh` after the structure changes.

Make NO edits in this mode.

## Mode: log

1. **Summarize.** Read `git diff` / `git log` (or use the user's description) to capture
   what changed and why.
2. **Categorize.** Tag each entry with `[app/domain]` from the same taxonomy
   (e.g. `[web/enrollment]`, `[backend/consent]`, `[admin/services]`). A change spanning
   apps gets multiple entries or a combined tag like `[backend+web/enrollment]`.
3. **Classify.** Added / Changed / Fixed / Removed (Keep-a-Changelog).
4. **Append.** Add the entry under the `## [Unreleased]` section of `docs/CHANGELOG.md`,
   each line ending with a representative path pointer, e.g.:
   `- [web/services] Filter services by category — CommunityFrontend/src/features/services`
   Create the `[Unreleased]` section/headers if missing. **Append only — never rewrite
   prior entries.**
5. **Report.** Show the appended lines. Do **not** commit.

## Guardrails
- Never invent a domain not in `categories.yaml`; flag unmapped areas and defer to
  `/community-kb refresh`.
- `locate` is strictly read-only; `log` only appends to the changelog.
- The changelog is the factual record of *what changed by category*; non-obvious gotchas
  and preferences belong in private memory via `/community-kb record`, not here.
- Keep `[app/domain]` tags consistent with the `apps:` keys (`backend`/`web`/`admin`) and
  `domains:` keys in the map.
