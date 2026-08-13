# Sidebar

Queue of things to pick up after current work or run in parallel. Newest first.
Statuses: open | in-progress | done. Types: discuss-later | parallel-agent.

---

## 2026-08-13 — Mobile /yucayeke: drop the name stack, put the description under the map

- **type:** parallel-agent
- **status:** done — merged 2026-08-13 as `ed4ae34`. One line of real change: the aside holding
  `TerritoryList` becomes `hidden … lg:block`, so mobile reads map → description while desktop is
  untouched. Safe because `BorikenMap` renders each territory as a real `role="button"` path with
  `tabIndex=0`, an accessible name and Enter/Space activation, and `onFocus` drives the reading
  panel — verified in the source, not taken on trust. The two polygon-less territories the list
  used to be the only route to stay reachable via the directory section below, which is unfiltered
  at every width. A new test pins the map's `role`/`tabindex`/`aria-label` so nobody can make it
  inert while the list is hidden. 493 tests green.
- **follow-ups it surfaced:** (1) `yucayekeMap.subtitle` and `labels.selectPrompt` still say "on the
  map **or in the list**", now only true from `lg` up — cheapest fix is dropping the clause, no new
  keys; (2) map tap targets at 390px are fiddly for a thumb, pre-existing but it matters more now
  the map is the only mobile selector.
- **raise when:** launched immediately at the user's request; collect when the agent reports back
- **launched:** 2026-08-13, in an isolated git worktree off `btf-testing`
- **owns:** `apps/web/src/features/yucayeke/components/**` only. **Reserved for the main
  thread:** `apps/web/messages/{en,es}.json`, `apps/web/src/features/yucayeke/content/territories.ts`,
  `docs/CHANGELOG.md` — all three carry uncommitted Yucayekeno-report work.
- **check on it:** verification bar is `pnpm --filter web test` (490 passing now), typecheck and
  lint clean, plus a real 390px browser check showing no name stack and the description appearing
  under the map after a tap.

> on mobile the yucayeke page should not have the stack of names that is to the right of the map on
> the left. Below the map on mobile should be the description after they click on the map

Today `yucayeke-map-page-content.tsx:98` is a `lg:grid-cols-[2fr_1fr]` grid — map left, `TerritoryList`
right — which stacks on mobile into map → name list → `TerritoryInfoCard`. The list should not be
there on mobile at all; the description should sit directly under the map, driven by tapping a
territory. Open question for the agent: the list is currently the keyboard-operable way to pick a
territory, so hiding it must not leave the map as an inaccessible-only control.

## 2026-08-11 — Admin panel feels bloated; make it slim, elegant, enterprise

- **type:** parallel-agent
- **status:** done — merged 2026-08-11. Theme-level density pass (52 files, net −963 lines);
  10 of 12 screens now fit a 1440×900 viewport without scrolling. Found and fixed a real
  defect on the way: rows in the All/Approved/Rejected enrollment lists were inert (the
  `<Link>` was commented out and pointed at `/users/edit/`), so only the Submitted queue
  could open an application — staff could never reopen a decided one. **Five open questions
  went back to the user, incl. an unrouted Dashboard rendering fake SaaS metrics.**
- **raise when:** launched immediately at the user's request; collect when the agent reports back
- **launched:** 2026-08-11, in an isolated git worktree
- **owns:** `apps/admin/**` only. Reserved for the main thread: `docs/CHANGELOG.md`,
  `docs/design-system-admin.md` (owned by the `style-guide` skill), `docs/architecture/**`.
- **check on it:** agent reports back to this session; verification bar is
  `pnpm --filter admin build` + `pnpm --filter admin lint` clean, plus before/after
  screenshots showing reduced page height.

> everything on the admin panel feels so bloated and big, can we please make it look a lot
> more slim and elegant and not needing so much scrolling, theres actually a lot that isnt
> intuitive or makes a lot of sense with the frontend currently... make it look more enterprise

Two things in one: a **density/elegance pass** (less vertical bulk, less scrolling, tighter
enterprise-grade chrome) and an **IA/usability audit** — the user says parts of the current
admin frontend don't make sense, without naming which. The audit half may surface product
decisions that need the user; those come back as questions rather than guesses.
