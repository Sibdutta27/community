# Design System — communityAdminPanel

The internal admin dashboard's visual language. **This applies to `communityAdminPanel`
only.** `CommunityFrontend` is a separate warm, earthy app — never mix the two.

Source of truth: `communityAdminPanel/src/styles/style.css`, per-component CSS Modules
(`*.module.css`), and inline MUI `sx` props. There is **no `ThemeProvider`/`createTheme`**
— colors are applied ad hoc. When you change those, run `/style-guide refresh admin` to
update this doc.

## Aesthetic direction

Dark, focused, **utilitarian admin** identity built on MUI v9. A near-black purple sidebar
and dark slate navbar frame a soft lavender-tinted content area; **violet/purple** is the
accent and interactive color. Inter for everything. Subtle lift-on-hover (translateY +
purple-tinted shadow) for affordance. Dense, table-driven, function over decoration —
deliberately plainer than the member frontend.

## Color tokens (ad-hoc; recovered from styles)

No formal token system. Apply these consistently via `sx` / CSS Modules:

| Role | Value | Use |
|------|-------|-----|
| Sidebar background | `#12001f` | dark purple app rail |
| Navbar background | `#111827` | dark slate top bar |
| Page background | `#f6f3ff` | lavender-tinted content area |
| Primary text | `#1b1033` | body/foreground (dark indigo) |
| Accent (purple) | `#7c3aed` → `#c084fc` | primary actions, gradients, active states |
| Accent glow (hover) | `rgba(124, 58, 247, 0.18)` | button hover shadow |
| Purple variants | `rgba(169, 85, 247, 0.12 / .35 / .5)` | borders, highlights, selected rows |
| Surface (cards/inputs) | `#ffffff` | panels on the lavender bg |
| Table dark surface | `#181A1B` | data-table dark theme (`ui/Table/styles.js`) |
| Muted text / borders | `#9ca3af`, `#6b7280`, `#d1d5db` | secondary text, borders, placeholders |
| Success | `#22c55e` (+ `rgba(34,197,94,.15/.3)`) | positive status, approved |
| Danger | `#ef4444` (+ `rgba(239,68,68,.15/.3)`) | destructive, rejected, errors |
| Info | `#3b82f6` / `#60a5fa` | informational accents/links |

## Typography

| Role | Font | Source | Notes |
|------|------|--------|-------|
| All text | **Inter** | `body` in `src/styles/style.css` (fallbacks: ui-sans-serif, system-ui, -apple-system, "Segoe UI") | single family; weight/size via MUI `sx` per component |

No serif/display split (unlike the frontend). Keep everything Inter.

## Component patterns

- **Buttons:** MUI `Button` styled with inline `sx`. Global rule (`style.css`): on hover,
  `transform: translateY(-1px)` + `box-shadow: 0 12px 24px rgba(124,58,237,0.18)` with a
  200ms transition. Primary actions use the purple accent.
- **Inputs / forms:** MUI inputs + `react-hook-form` + `zodResolver`; `Controller` for MUI
  `Select`. Validation feedback via `react-toastify` (`toast.success/error`).
- **Tables:** custom wrapper in `components/ui/Table/` around `react-data-table-component`
  with a **dark theme** (`#181A1B`), server-side pagination, selectable rows, debounced
  search (~1000ms), skeleton loading. This is the primary data surface.
- **Layout:** `layouts/AdminLayout/` = `Sidebar` (`#12001f`) + `Navbar` (`#111827`) +
  `<Outlet/>`; `StatCard` for dashboard metrics.
- **Styling approach:** MUI defaults + **inline `sx`** + per-component CSS Modules
  (`*.module.css`). Global resets/box-sizing in `src/styles/style.css`. Sanitize any
  injected HTML with `dompurify`.

## When building new admin UI

1. Use MUI components + inline `sx`; match the existing dark purple/slate + lavender scheme.
2. Inter only — no Cinzel/Montserrat (those are the frontend).
3. Purple (`#7c3aed`/`#c084fc`) for primary/active; green/red/blue for status semantics.
4. Put tabular data in the shared `ui/Table` wrapper; keep server-side pagination + search.
5. **Never import or mirror `CommunityFrontend` tokens/components** — different design system.
6. If the team introduces a real MUI `createTheme` theme later, migrate these ad-hoc values
   into it and re-run `/style-guide refresh admin`.
