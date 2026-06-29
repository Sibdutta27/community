---
name: community-kb
description: >-
  Maintain the Community monorepo knowledge base. Keeps the in-repo architecture docs
  current after code changes (refresh), maintains the App->Domain map
  docs/architecture/categories.yaml, flags docs/product/PRD.md drift (drift), and
  captures session learnings into private Claude memory (record). Trigger on "update
  the knowledge base", "refresh the docs", "the architecture changed", "remember this
  about the codebase", "record what we learned", "check for doc drift", or after
  landing a non-trivial change to backend/frontend/admin.
argument-hint: "refresh [area] | record | drift"
allowed-tools: Read Grep Glob Edit Write Agent Bash(git *)
---

# community-kb

Keeps the knowledge base for this monorepo accurate and useful over time. Modes — pick
based on the user's intent (or run several):

- **`refresh [area]`** — re-map the codebase, update the committed in-repo docs, and
  keep `docs/architecture/categories.yaml` current.
- **`drift`** — read-only: report which docs/PRD have gone stale vs the current code,
  without editing (good for a Stop hook or a quick check).
- **`record`** — capture cross-run learnings/gotchas/preferences into private memory.

`area` ∈ `backend | frontend | admin | all` (default: infer from what changed; else `all`).

## Knowledge base layout

**Tier 1 — in-repo, committed (shared, auto-loaded):**

| File | Scope | Owner |
|------|-------|-------|
| `CLAUDE.md` | monorepo overview + design-system warning + pointers | community-kb |
| `CommunityBackend/CLAUDE.md` | backend quick reference | community-kb |
| `CommunityFrontend/CLAUDE.md` | frontend quick reference | community-kb |
| `communityAdminPanel/CLAUDE.md` | admin quick reference | community-kb |
| `docs/architecture/backend.md` | modules, endpoints, guards | community-kb |
| `docs/architecture/frontend.md` | routes, data layer, auth | community-kb |
| `docs/architecture/admin-panel.md` | pages, routing, tables | community-kb |
| `docs/architecture/categories.yaml` | App->Domain->paths map | **community-kb** |
| `docs/data-model.md` | Prisma models, relations, enums | community-kb |
| `docs/design-system.md` | frontend visual language | **`style-guide` skill** |
| `docs/design-system-admin.md` | admin visual language | **`style-guide` skill** |
| `docs/product/PRD.md` | product PRD (as-built) | **`create-prd` skill** (kb only flags drift) |
| `docs/CHANGELOG.md` | categorized change log | **`change-router` skill** |

**Tier 2 — private Claude memory (NOT committed):**
`/home/guayaba/.claude/projects/-home-guayaba-apps-community/memory/` — `MEMORY.md` index +
one fact per file.

> Ownership matters: community-kb does **not** edit the design-system docs (defer to
> `/style-guide`), the PRD (defer to `/create-prd`), or the changelog (owned by
> `/change-router`). It only *flags* PRD drift in `drift` mode.

## Routing rule (decide where a thing goes)

- **Durable, shareable fact about the code** (a module, route, convention, token, model) →
  Tier 1 in-repo doc.
- **Run-specific learning / gotcha / decision / user preference** → Tier 2 private memory.
- If unsure: a future contributor reading only the repo should know it → Tier 1; only *we*
  need it across sessions → Tier 2.
- **Factual record of a completed change** (what changed, by category) → that's the
  changelog, owned by `/change-router log` — not memory and not these docs.

---

## Mode: refresh

1. **Scope it.** Determine which `area`(s) changed (git diff, the user's description, or
   files just edited). Map area → docs:
   - `backend` → `docs/architecture/backend.md`, `docs/data-model.md`, `CommunityBackend/CLAUDE.md`, `docs/architecture/categories.yaml`
   - `frontend` → `docs/architecture/frontend.md`, `CommunityFrontend/CLAUDE.md`, `docs/architecture/categories.yaml`
   - `admin` → `docs/architecture/admin-panel.md`, `communityAdminPanel/CLAUDE.md`, `docs/architecture/categories.yaml`
   - always re-check whether the root `CLAUDE.md` overview still holds.
2. **Re-map.** Launch **Explore** subagents (parallel, ≤3) scoped to the changed area(s).
   - For `data-model.md`, read `CommunityBackend/prisma/schema.prisma` directly — it is the
     source of truth; mirror models/relations/enums exactly.
   - For any **frontend/admin design** change, **defer the design-system docs to the
     `style-guide` skill** (`/style-guide refresh frontend` or `/style-guide refresh admin`).
     Do not edit `docs/design-system*.md` here.
3. **Update `categories.yaml`.** When modules/routes/pages were **added, renamed, moved, or
   removed**, update the App->Domain entries and representative paths so the map stays true
   (this is what keeps `/change-router locate` fast and correct). Keep paths in sync with the
   current layout (post-migration: `apps/api|web|admin`).
4. **Diff & update.** Compare findings against the current docs and edit only what drifted.
   Keep each `CLAUDE.md` scannable (~40–80 lines); push exhaustive tables into `docs/`.
   Preserve structure, tone, and the "two distinct design systems" warning.
5. **Report.** Tell the user which files changed and what was added/corrected. Do **not**
   commit unless asked. If the data model or a domain's surface changed, suggest the user
   also run `/create-prd` is *not* needed, but note PRD drift if relevant (see `drift`).

## Mode: drift (read-only)

Report staleness without editing anything.

1. Read `git diff` / recent commits (or the user's description) to see what code changed.
2. Compare against Tier-1 docs and `docs/product/PRD.md`:
   - Which architecture doc(s) / `categories.yaml` entries no longer match the code?
   - Does the change affect product behavior described in the PRD (new/removed capability,
     changed flow)? If so, flag PRD drift — but do **not** rewrite the PRD (that's `/create-prd`).
3. Output a short checklist: `<file>` — what's stale — suggested action (`/community-kb refresh
   <area>`, `/style-guide refresh <app>`, `/create-prd`). Make no edits.

> Tip: the user can wire this into a Stop hook via `/update-config` to auto-flag drift after
> sessions that touched `CommunityBackend|CommunityFrontend|communityAdminPanel`. Document the
> suggestion; do not install it automatically.

## Mode: record

Write learnings as memory files in the Tier-2 directory, following the standard memory format.

1. **Identify** what's worth keeping (gotchas, non-obvious decisions, conventions discovered,
   user preferences). Skip anything already captured by the repo docs, the changelog, or git
   history. (Factual "what changed" records belong in the changelog via `/change-router log`,
   not memory.)
2. **Dedupe.** Read `MEMORY.md`; update an existing file rather than create a near-duplicate.
3. **Write one fact per file** with frontmatter:

   ```markdown
   ---
   name: <short-kebab-case-slug>
   description: <one-line summary used for recall>
   metadata:
     type: user | feedback | project | reference
   ---

   <the fact. For feedback/project, add **Why:** and **How to apply:** lines.>
   Link related memories with [[other-slug]].
   ```

   Types: `user` (who they are/preferences), `feedback` (how I should work + why),
   `project` (ongoing work/goals/constraints; convert relative dates to absolute),
   `reference` (pointers to docs/resources — e.g. the in-repo KB).
4. **Index it.** Add/refresh a one-line pointer in `MEMORY.md`: `- [Title](file.md) — hook`.
   Never put fact content in `MEMORY.md` itself.
5. **Promote** anything that's actually a durable codebase fact into the Tier-1 docs instead.

---

## Guardrails

- Docs describe what exists **now** — verify against source before writing; remove stale claims.
- Respect ownership: don't edit design-system docs (→ `/style-guide`), the PRD (→ `/create-prd`),
  or the changelog (→ `/change-router`).
- Never leak secrets/env values into memory or docs.
- In-repo edits are added, not committed — leave committing to the user.
- Keep the frontend vs. admin design-system separation explicit wherever styling is discussed.
