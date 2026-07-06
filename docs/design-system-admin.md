# Design System — apps/admin

The internal admin dashboard's visual language. **This applies to `apps/admin` only.**

Rebranded to the **azul-flag palette** (shared with `apps/web`) so the two products read as one
brand — but the admin keeps its own **dark-chrome-over-light-content** structure and MUI-driven
component set. It is **not** a copy of the member app: don't import `apps/web` tokens/components.

Sources of truth: a central **MUI theme** at `apps/admin/src/theme/theme.js` (`createTheme` +
`ThemeProvider`/`CssBaseline` wired in `src/main.jsx`), the `:root { --admin-* }` CSS variables in
`apps/admin/src/styles/style.css`, per-component CSS Modules (`*.module.css`), and inline `sx`. When
you change colors, run `/style-guide refresh admin` to update this doc.

## Aesthetic direction

**Deep-azul chrome over a cool light content area.** A dark azul side-rail and top bar (white text)
frame a clean `#f6f8fa` workspace; **azul** is the primary/interactive color, **celeste** the
highlight, and **flag-red** is reserved for destructive/reject. Data tables stay a dark azul-navy for
focus. Inter for everything; subtle lift-on-hover (translateY + azul-tinted shadow). Dense,
table-driven, function-first.

## Color tokens

Central MUI theme (`theme.js`) drives the light content + all MUI defaults; `--admin-*` CSS vars
(`style.css`) drive the CSS-Module chrome. Keep both in sync.

| Role | Value | Use |
|------|-------|-----|
| Chrome (sidebar/navbar) | `#0a2540` (`--admin-chrome`) | dark azul app rail + top bar |
| Chrome deep (login/gradients) | `#08213c` (`--admin-chrome-2`) | login bg, deep-azul gradients |
| On-chrome text | `#ffffff` / `rgba(255,255,255,.7)` | text/icons on dark chrome |
| Page background | `#f6f8fa` (`--admin-bg`) | cool content area |
| Surface (cards/inputs) | `#ffffff` (`--admin-surface`) | panels on the content bg |
| Ink / primary text | `#141a22` (`--admin-ink`) | body/foreground |
| Muted text / borders | `#5a6472` / `#e2e6eb` (`--admin-muted` / `--admin-border`) | secondary text, hairlines |
| **Primary — azul** | `#0a56a8` (`--admin-primary`, light `#1d6fb8`) | primary actions, active nav, links, focus |
| **Celeste** | `#4ea6dc` (`--admin-celeste`) | highlights, secondary accent, sub-nav active |
| Secondary tint | `#e7f2fb` (`--admin-secondary-tint`) | soft azul surfaces (search pill, chips) |
| **Success (approve)** | `#1f9d57` (`--admin-success`) | approved / positive status |
| **Danger (reject) — flag-red** | `#c42032` (`--admin-danger`) | reject, destructive, errors |
| Warning | `#f59e0b` (`--admin-warning`) | pending / caution status |
| Table head / row / hover | `#12314f` / `#0f2942` / `#1a3d5f` | dark azul-navy data table (`ui/Table/styles.js`) |
| Hover glow | `rgba(10,86,168,.18)` (`--admin-glow`) | button lift shadow |

WCAG-AA verified: white on chrome ~15.5:1, ink on content ~16:1, azul on white ~7.2:1, white on
flag-red ~5.8:1, table white-on-row ~14.8:1.

## Typography

**Inter** everywhere (`theme.js` `typography.fontFamily` + `body` in `style.css`; fallbacks
ui-sans-serif, system-ui, "Segoe UI"). Single family; buttons `textTransform: none`, weight 600. No
serif/display split (that's the frontend).

## Component patterns

- **Theme first:** MUI components inherit azul primary / celeste secondary / flag-red error, light
  backgrounds, rounded buttons, azul focus rings, and azul/`success` Stepper icons from `theme.js` —
  prefer `color="primary|secondary|error"` over hardcoded colors.
- **Buttons:** rounded (`borderRadius: 999`), azul contained by default; global hover lift
  (`translateY(-1px)` + azul glow) from `style.css`. Reject/destructive = `color="error"` (flag-red).
- **Chrome:** `layouts/AdminLayout` = `Sidebar` + `Navbar` on `--admin-chrome`; active nav item is an
  azul gradient, sub-nav active is celeste. Login is a deep-azul card with light-text inputs.
- **Tables:** shared `components/ui/Table/` wrapper around `react-data-table-component` — dark
  azul-navy theme, azul pagination, server-side pagination, selectable rows, debounced search,
  skeleton loading. Primary data surface.
- **Styling approach:** theme + inline `sx` + CSS Modules referencing `var(--admin-*)`. Sanitize any
  injected HTML with `dompurify`.

## When building new admin UI

1. Lean on the MUI theme (`color="primary|secondary|error"`); reach for `var(--admin-*)` in CSS
   Modules. Avoid new hardcoded hexes.
2. Inter only — no Cinzel/Montserrat (those are the frontend).
3. Azul for primary/active, celeste for highlights, **flag-red for reject/destructive**, green for
   approve, amber for pending.
4. Tabular data → the shared `ui/Table` wrapper (server-side pagination + search).
5. **Never import or mirror `apps/web` tokens/components** — shared palette, separate system.
