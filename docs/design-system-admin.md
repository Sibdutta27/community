# Design System — apps/admin

The internal admin dashboard's visual language. **This applies to `apps/admin` only.**

The admin now shares the member app's **premium light "governance" aesthetic** (the same azul-flag
palette, cool surfaces, elevated white cards, soft layered ink shadows, pill azul buttons, Inter with
tight-tracked headings) — so the two products read as one brand. It is **not** a copy of `apps/web`:
reproduce the primitives natively in MUI; don't import apps/web tokens/components.

Sources of truth: the central **MUI theme** at `apps/admin/src/theme/theme.js` (`createTheme` +
`ThemeProvider`/`CssBaseline` in `src/main.jsx`), the `:root { --admin-* }` CSS variables in
`apps/admin/src/styles/style.css`, the shared **`components/Panel`** (elevated card + `SectionHeader`)
and **`components/PageHeader`**, per-component CSS Modules, and inline `sx`. Run
`/style-guide refresh admin` after color changes.

## Aesthetic direction

**Light, airy, elevated.** A white/glass side-rail and frosted top bar (azul active-pill nav) frame a
cool `#f6f8fa` workspace where every surface — tables, forms, stat cards — sits in an **elevated white
card** (hairline border, `rounded-2xl`, soft layered ink shadow). **Azul** is the primary/interactive
color, **celeste** the highlight, **flag-family red** destructive. Generous spacing, restrained motion,
AA throughout. Function-first but premium — the opposite of a dense dark dashboard.

## Color tokens

Central MUI theme drives content + MUI defaults; `--admin-*` CSS vars drive the CSS-Module chrome.

| Role | Value | Use |
|------|-------|-----|
| Page background | `#f6f8fa` (`--admin-bg`) | cool content area |
| Surface | `#ffffff` (`--admin-surface`) | cards, chrome, inputs |
| Surface-muted | `#eef2f6` (`--admin-surface-muted`) | hover, search field, inactive pills |
| Ink / text | `#141a22` (`--admin-ink`) / muted `#5a6472` (`--admin-muted`) | body / secondary |
| Border | `#e2e6eb` (`--admin-border`) | hairlines |
| **Primary — azul** | `#0a56a8` (`--admin-primary`, light `#1d6fb8`) | actions, active nav, links, focus |
| **Celeste** | `#4ea6dc` (`--admin-celeste`) | highlights, secondary accent |
| Secondary tint | `#e7f2fb` (`--admin-secondary-tint`, text `#123b5e`) | soft azul surfaces |
| Active nav pill | bg `rgba(10,86,168,.08)` (`--admin-active-bg`), fg `#0a56a8` (`--admin-active-fg`) | sidebar active item |
| **Approve** | `#1f9d57` (`--admin-success`) | approved / positive |
| **Reject / destructive** | `#b3261e` (`--admin-danger`, MUI `error`) | reject, delete, errors |
| Warning | `#f59e0b` (`--admin-warning`) | pending / caution |
| Shadows | `--admin-shadow-card` / `--admin-shadow-soft` / `--admin-glass-shadow` | elevation (soft, ink-tinted) |

WCAG-AA: ink on surface ~17:1, azul on white ~7.2:1, white on azul ~7.2:1, white on reject-red ~6:1,
muted on surface ~5.5:1.

## Component patterns

- **Theme first:** MUI components inherit azul primary / celeste secondary / flag-red error, elevated
  white `Paper` (border + `rounded-2xl` + soft shadow), **pill buttons** (`hover:-translate-y`, azul
  focus-visible outline), radius-8 inputs with azul focus, azul Stepper — prefer
  `color="primary|secondary|error"` over hardcoded colors.
- **`Panel`** (`components/Panel`): the elevated card wrapper (`compact`/`roomy`) + `SectionHeader`
  (icon tile + title + muted description). Wrap page content / data tables / form containers in it.
- **`PageHeader`** (`components/PageHeader`): ink title + optional description + right-aligned action.
- **Chrome (light):** `Sidebar` = white rail, azul active pill, quiet muted icons, soft right shadow;
  `Navbar` = frosted-white glass bar (azul wordmark, muted search/notification); `Login` = light
  premium card on a cool/celeste gradient with an azul pill button.
- **Tables:** `components/ui/Table/` — light theme (transparent head with muted uppercase labels,
  hairline rows, soft `#f6f8fa` hover, light pill type-count tabs, azul checkbox/pagination), wrapped
  in a `Panel`. Primary data surface.

## When building new admin UI

1. Lean on the theme (`color="primary|secondary|error"`) + `var(--admin-*)`; avoid new hardcoded hexes.
2. Inter only. Wrap surfaces in `Panel`; head pages with `PageHeader`.
3. Azul primary/active, celeste highlights, **flag-red reject/destructive**, green approve, amber pending.
4. Tabular data → the shared `ui/Table` wrapper.
5. **Never import or mirror `apps/web` tokens/components** — shared palette, separate system.
