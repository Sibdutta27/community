# Sidebar

Queue of things to pick up after current work or run in parallel. Newest first.
Statuses: open | in-progress | done. Types: discuss-later | parallel-agent.

---

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
