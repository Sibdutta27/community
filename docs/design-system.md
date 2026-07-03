# Design System — apps/web

The member-facing app's visual language. **This applies to `apps/web` only.** The
`apps/admin` is a separate dark MUI dashboard — never mix the two. Keep these design systems
independent: do not copy `apps/web` tokens into the admin panel or vice-versa.

Source of truth: `apps/web/src/styles/tokens.css`, `src/styles/fonts.ts`,
`src/app/globals.css`, `src/components/ui/*`, `src/lib/motion.ts`. When you change those, run
`/style-guide refresh web` to update this doc.

## Aesthetic direction

**Elegant governance.** Calm, institutional, trustworthy — a civic-registry feel rather than a
marketing site. Warm off-white surfaces, charcoal text, hairline borders, generous whitespace,
and exactly **one** accent: **deep teal `#2d6e7e`**, reserved for primary CTAs, the active
enrollment step, and focus rings. Everything else is charcoal-on-warm-neutral. **Inter** is the
single typeface for display and body. Icon tiles are uniform **charcoal with white glyphs** —
no multicolor tiles. All text/background pairings target **WCAG AA** contrast.

> Historical note: the app previously used a Cinzel/Montserrat warm sand-red-brown system (and
> briefly a pure black-&-white Inter system). The CSS variable **names** and font **exports**
> were preserved through each restyle (only their **values** changed) so existing callers keep
> working — e.g. `--brand-red` now holds the deep teal, and the `cinzel`/`montserrat` font
> exports resolve to Inter.

## Color tokens (`src/styles/tokens.css`)

Defined on `:root` and exposed to Tailwind v4 via `@theme inline` (use as `bg-primary`,
`text-foreground`, `border-border`, etc.):

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `#f7f5f1` | page background (warm off-white) |
| `--foreground` | `#1f1e1c` | primary text (charcoal); also the neutral icon-tile fill (`bg-foreground`) |
| `--surface` | `#fffefb` | cards / panels (warm white) |
| `--surface-muted` | `#efece6` | muted surfaces / hover / badges |
| `--border` | `#e3ded4` | warm hairline borders |
| `--muted-foreground` | `#6b665f` | secondary / muted text (AA on off-white) |
| `--primary` / `--primary-foreground` | `#2d6e7e` / `#ffffff` | **the one accent** — deep-teal CTA + white text |
| `--secondary` / `--secondary-foreground` | `#dbe7ea` / `#1f1e1c` | pale-teal supporting surface, charcoal text |
| `--accent` / `--accent-foreground` | `#efece6` / `#1f1e1c` | warm-neutral supporting surface (NOT a hue) |
| `--ring` | `#2d6e7e` | focus ring (teal) |

Brand tokens (legacy names, current values): `--brand-red` `#2d6e7e` (the teal accent),
`--brand-sky` `#5c94a1`, `--brand-brown` `#8a8378`, `--brand-sand` `#efece6`,
`--brand-sand-soft` `#f7f5f1`, `--brand-black` `#1f1e1c`. Prefer the semantic tokens; the
`brand-*` names survive only for existing callers.

Shadows stay minimal: soft, low-opacity, long negative spread — charcoal-tinted for neutral
surfaces (e.g. `rgba(31,30,28,0.18)`), teal-tinted only on the primary button
(`rgba(45,110,126,0.45)`). Never heavy or saturated.

## Iconography

Restrained and neutral. Decorative icon tiles are **uniform charcoal squares/circles with
white glyphs** — either a CSS `bg-foreground` container around a white SVG glyph (service
categories, yucayeke highlights, member services, community quick links) or a self-contained
SVG whose background rect is flat `#1f1e1c` with white artwork (`public/icons/home/heritage/*`).
Small inline glyphs on light surfaces use charcoal or dark desaturated strokes. **Do not
introduce colored tiles or multicolor icon sets.**

## Typography (`src/styles/fonts.ts`)

One typeface: **Inter** (via `next/font/google`), applied as CSS variables on `<body>` in
`app/layout.tsx` and consumed through the `--font-*-base` tokens.

| Role | Font | Variable |
|------|------|----------|
| Display / headings | **Inter** | `--font-display` |
| Body / UI | **Inter** | `--font-body` |
| Alt body | **Inter** | `--font-body-alt` |

- Compatibility exports: `cinzel`, `montserrat`, `lato`, `poppins`, `inter` **all resolve to
  Inter** — existing imports keep working; don't add new Google fonts.
- `globals.css`: `h1, h2` use `--font-display-base` at weight 700 with `-0.03em` tracking;
  body uses `--font-sans-base` with `optimizeLegibility` + antialiasing. Headings across
  features typically add tight negative tracking (`tracking-[-0.04em]`–`[-0.05em]`).

## Component patterns

- **Buttons** (`components/ui/button.tsx`, CVA): pill shape `rounded-[200px]`, `font-medium`,
  200ms transition, `active:translate-y-px`, teal focus ring with offset. Variants:
  - `primary` — solid deep-teal pill, white text (the default; **the only place the accent
    appears as a fill** besides active steps/focus).
  - `outline` — hairline `border-border`, `bg-surface`, charcoal text; hover `bg-surface-muted`.
  - `secondary` — pale-teal (`#dbe7ea`) solid pill, charcoal text.
  - `accent` — warm-neutral solid pill, charcoal text.
  - `ghost` — transparent, hover muted warm surface.
  - Sizes `sm/md/lg/xl/icon`, plus `fullWidth`; built-in `loading` spinner state.
- **Inputs** (`components/ui/input.tsx`, shared base reused by textarea & select trigger):
  soft rectangle `rounded-lg`, `border-border`, `bg-surface`, `text-[15px]`; focus =
  `border-ring` + `ring-2 ring-ring/25` (teal) plus a faint teal focus-elevation shadow
  (`0_6px_16px_-10px rgba(45,110,126,0.4)`). No resting drop shadow.
- **Checkbox / radio** (`ui/checkbox.tsx`, `ui/radio-group.tsx`): hairline border, warm-white
  bg; checked state fills/dots teal (`data-[state=checked]:bg-primary`); teal focus ring with
  a 1px offset. Checkbox is `size-[1.125rem]`, `rounded-[5px]`.
- **Select** (`ui/select.tsx`): trigger reuses the input style; content `rounded-lg` on
  `bg-surface` with a soft charcoal shadow; check indicator `text-primary`.
- **Labels / form** (`ui/label.tsx`, `ui/form.tsx`): labels `text-sm font-medium
  text-foreground` with slight negative tracking; descriptions `text-muted-foreground`; error
  text stays red (`text-red-600`) — errors are the one non-teal signal color.
- **Cards**: `bg-surface` (or `bg-surface-muted`) on the off-white page, hairline
  `border-border`, large radii (`rounded-2xl`, `rounded-[1.2rem]`+), soft long-negative-spread
  charcoal shadows.
- **Steppers** (`features/enrollment/components/enrollment-stepper.tsx`): **folder tabs**
  attached to the elevated step card (`enrollment-step-layout.tsx`). The active tab shares the
  card's `bg-surface` with a transparent bottom edge (it merges into the card, `-mb-px`
  overlap), a teal top edge and a teal `bg-primary` number badge; completed tabs get a
  pale-teal (`bg-secondary`) check badge; upcoming tabs sit recessed on `bg-surface-muted`.
  The row is horizontally scrollable on mobile (hidden scrollbar); every tab stays a link
  (free jump-nav).
- **Dialog** (`ui/dialog.tsx`): charcoal scrim `bg-foreground/50` + blur; content on
  `bg-surface` with a large radius.
- Always compose classes with `cn()` (`src/lib/utils.ts`); use `class-variance-authority` for
  variants. shadcn config: **"new-york"** style, base color zinc, lucide icons
  (`components.json`).

## SCSS modules

Feature styles use `*.module.scss` with the breakpoint mixin from
`src/styles/scss/abstracts/_breakpoints.scss`:

```scss
$breakpoints: (sm: 40rem, md: 48rem, lg: 64rem, xl: 80rem, 2xl: 96rem);
@include up(md) { … }   // min-width media query
```

## Motion (`src/lib/motion.ts`)

framer-motion presets, eased with `[0.22, 1, 0.36, 1]`. Signature is a **staggered fade-in-up**:
container `fadeInUpContainer` (`staggerChildren: 0.14`) + items `fadeInUpItem`
(`y: 22 → 0`, ~0.72s). Trigger on scroll with `whileInView` + `viewport={{ once: true }}`.
Keep motion restrained — one orchestrated reveal, not scattered micro-interactions.

Enrollment-flow motion is an **isolated block**: `enrollmentStepEnter` / `enrollmentFieldGroup`
variants (clearly-marked section in `motion.ts`) consumed only by the wrappers in
`features/enrollment/components/enrollment-motion.tsx` (`MotionConfig reducedMotion="user"`
honors `prefers-reduced-motion`). Deleting that block + rendering the wrappers as plain divs
removes all enrollment motion in one place. Buttons add a CSS-only hover lift
(`hover:-translate-y-px`, `motion-reduce:transform-none`).

## Testing (`vitest` + Testing Library)

Component tests run on **Vitest** (jsdom, globals) with **@testing-library/react**. Config in
`vitest.config.ts` (+ `vitest.setup.ts` importing `@testing-library/jest-dom`); `@/*` resolves to
`./src`. Run with `pnpm --filter community-frontend-web test`. Co-locate `*.test.tsx` next to the
component (see `src/components/ui/{button,input,form}.test.tsx`).

## When building new frontend UI

1. Reuse `components/ui/*` and the semantic tokens above — don't hardcode hex values.
2. Inter everywhere (via the existing font exports); charcoal text on warm off-white; hairline
   `border-border` borders; generous whitespace.
3. Teal (`bg-primary` / `ring-ring`) **only** for the primary CTA, the active step, and focus —
   never as decoration. One accent, used sparingly, is the brand.
4. Icons stay neutral: white glyphs on charcoal `bg-foreground` tiles, or charcoal glyphs
   inline on light surfaces. No colored or gradient tiles.
5. Keep contrast **WCAG AA**: `foreground`/`muted-foreground` on `background`/`surface*` pass;
   don't lighten text below `--muted-foreground`.
6. Keep it calm: soft low-opacity shadows, `bg-surface` cards on the off-white page — never
   heavy saturated panels.
7. Reach for the shared motion variants before inventing new animations.
8. Never pull in the admin panel's dark purple theme, and don't reintroduce the old
   Cinzel/red/sand palette — repoint stray warm/red literals to the semantic tokens.
