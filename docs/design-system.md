# Design System — apps/web

The member-facing app's visual language. **This applies to `apps/web` only.** The
`apps/admin` is a separate dark MUI dashboard — never mix the two. Keep these design systems
independent: do not copy `apps/web` tokens into the admin panel or vice-versa.

Source of truth: `apps/web/src/styles/tokens.css`, `src/styles/fonts.ts`,
`src/app/globals.css`, `src/components/ui/*`, `src/lib/motion.ts`. When you change those, run
`/style-guide refresh web` to update this doc.

## Aesthetic direction

**Elegant governance, azul-led Puerto-Rican-flag palette (60-30-10).** Calm, institutional,
trustworthy — a civic-registry feel rather than a marketing site. **60:** cool clean base —
near-white blue-grey page, white cards, ink text, hairline borders, generous whitespace.
**30:** **deep azul `#0a56a8`** for primary CTAs, the active enrollment step, links and focus
rings, with **azul celeste `#4ea6dc`** tints for highlights and supporting fills. **10:** **flag
red `#c42032`** (`--emphasis`), reserved for the Enroll/hero emphasis CTAs, plus `--destructive`
`#b3261e` for errors — red stays RESTRAINED. The flag's star yellow is **not** a UI token (logo
artwork only). **Inter** is the single typeface for display and body. Icon tiles are uniform
**ink with white glyphs** — no multicolor tiles. All text/background pairings target **WCAG AA**
contrast (celeste and bright red never carry small text).

> Historical note: the app previously used a Cinzel/Montserrat warm sand-red-brown system (and
> briefly a pure black-&-white Inter system). The CSS variable **names** and font **exports**
> were preserved through each restyle (only their **values** changed) so existing callers keep
> working — e.g. `--brand-red` now holds the flag red and `--brand-sky` the celeste, and the
> `cinzel`/`montserrat` font exports resolve to Inter. (The interim deep-teal `#2d6e7e`
> governance accent was retired in favor of the azul-led flag palette.)

## Color tokens (`src/styles/tokens.css`)

Defined on `:root` and exposed to Tailwind v4 via `@theme inline` (use as `bg-primary`,
`text-foreground`, `border-border`, etc.):

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `#f6f8fa` | page background (cool near-white) |
| `--foreground` | `#141a22` | primary text (ink); also the neutral icon-tile fill (`bg-foreground`) |
| `--surface` | `#ffffff` | cards / panels (white) |
| `--surface-muted` | `#eef2f6` | muted surfaces / hover / badges |
| `--border` | `#e2e6eb` | cool hairline borders |
| `--muted-foreground` | `#5a6472` | secondary / muted text (5.6:1 on background) |
| `--primary` / `--primary-foreground` | `#0a56a8` / `#ffffff` | deep azul — primary CTAs, active step, links (7.2:1) |
| `--secondary` / `--secondary-foreground` | `#e7f2fb` / `#123b5e` | celeste tint supporting surface, deep-azul text (10.2:1) |
| `--accent` / `--accent-foreground` | `#4ea6dc` / `#0b2033` | azul celeste highlight fill — dark text only (6.2:1), or white for large display type; never small text on it |
| `--emphasis` / `--emphasis-foreground` | `#c42032` / `#ffffff` | flag red — ONLY the Enroll/hero emphasis CTAs (5.8:1) |
| `--destructive` / `--destructive-foreground` | `#b3261e` / `#ffffff` | errors / destructive actions (6.5:1; 6.5:1 as text on white) |
| `--celeste` | `#4ea6dc` | alias of the celeste highlight hue |
| `--ring` | `#0a56a8` | focus ring (azul); `::selection` is also azul |

Brand tokens (legacy names, current values): `--brand-red` `#c42032` (the flag red),
`--brand-sky` `#4ea6dc` (celeste), `--brand-brown` `#5a6472`, `--brand-sand` `#eef2f6`,
`--brand-sand-soft` `#f6f8fa`, `--brand-black` `#141a22`. Prefer the semantic tokens; the
`brand-*` names survive only for existing callers.

Shadows stay minimal: soft, low-opacity, long negative spread — ink-tinted for neutral
surfaces (e.g. `rgba(20,26,34,0.18)`), azul-tinted on the primary button
(`rgba(10,86,168,0.45)`), red-tinted only on the emphasis button (`rgba(196,32,50,0.5)`).
Never heavy or saturated.

## Iconography

Restrained and neutral. Decorative icon tiles are **uniform charcoal squares/circles with
white glyphs** — either a CSS `bg-foreground` container around a white SVG glyph (service
categories, yucayeke highlights, member services, community quick links) or a self-contained
SVG whose background rect is flat dark ink with white artwork (`public/icons/home/heritage/*`).
Small inline glyphs on light surfaces use ink or dark desaturated strokes. **Do not
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
  200ms transition, `active:translate-y-px`, azul focus ring with offset. Variants:
  - `primary` — solid deep-azul pill, white text (the default workhorse CTA).
  - `emphasis` — solid flag-red pill, white text; **only** for the top-nav "Enroll Today"
    CTAs and the home-hero "Start Your Enrollment" CTA. Keep red restrained.
  - `outline` — hairline `border-border`, `bg-surface`, ink text; hover `bg-surface-muted`.
  - `secondary` — celeste-tint (`#e7f2fb`) solid pill, deep-azul text.
  - `accent` — azul-celeste solid pill, dark-azul text (highlight fill).
  - `ghost` — transparent, hover muted cool surface.
  - Sizes `sm/md/lg/xl/icon`, plus `fullWidth`; built-in `loading` spinner state.
- **Inputs** (`components/ui/input.tsx`, shared base reused by textarea & select trigger):
  soft rectangle `rounded-lg`, `border-border`, `bg-surface`, `text-[15px]`; focus =
  `border-ring` + `ring-2 ring-ring/25` (azul) plus a faint azul focus-elevation shadow
  (`0_6px_16px_-10px rgba(10,86,168,0.4)`). No resting drop shadow.
- **Checkbox / radio** (`ui/checkbox.tsx`, `ui/radio-group.tsx`): hairline border, warm-white
  bg; checked state fills/dots azul (`data-[state=checked]:bg-primary`); azul focus ring with
  a 1px offset. Checkbox is `size-[1.125rem]`, `rounded-[5px]`.
- **Select** (`ui/select.tsx`): trigger reuses the input style; content `rounded-lg` on
  `bg-surface` with a soft ink shadow; check indicator `text-primary`.
- **Labels / form** (`ui/label.tsx`, `ui/form.tsx`): labels `text-sm font-medium
  text-foreground` with slight negative tracking; descriptions `text-muted-foreground`; error
  text/borders use the **destructive token** (`text-destructive`, `border-destructive/50`,
  `ring-destructive/20`) — never raw `red-*` utilities.
- **Cards**: `bg-surface` (or `bg-surface-muted`) on the off-white page, hairline
  `border-border`, large radii (`rounded-2xl`, `rounded-[1.2rem]`+), soft long-negative-spread
  ink shadows.
- **Steppers** (`features/enrollment/components/enrollment-stepper.tsx`): **folder tabs**
  attached to the elevated step card (`enrollment-step-layout.tsx`). The active tab shares the
  card's `bg-surface` with a transparent bottom edge (it merges into the card, `-mb-px`
  overlap), an azul top edge and an azul `bg-primary` number badge; completed tabs get a
  celeste-tint (`bg-secondary`) check badge; upcoming tabs sit recessed on `bg-surface-muted`.
  The row is horizontally scrollable on mobile (hidden scrollbar); every tab stays a link
  (free jump-nav).
- **Dialog** (`ui/dialog.tsx`): ink scrim `bg-foreground/50` + blur; content on
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
2. Inter everywhere (via the existing font exports); ink text on the cool near-white base;
   hairline `border-border` borders; generous whitespace.
3. Deep azul (`bg-primary` / `ring-ring`) for primary CTAs, the active step, links and focus;
   celeste (`bg-secondary`/`bg-accent`) for highlights. Flag red (`bg-emphasis`) is **only**
   the Enroll/hero emphasis CTAs; `destructive` is **only** errors — keep red at ~10%.
4. Icons stay neutral: white glyphs on ink `bg-foreground` tiles, or ink glyphs
   inline on light surfaces. No colored or gradient tiles.
5. Keep contrast **WCAG AA**: never put small text on celeste `#4ea6dc` or rely on light
   celeste/bright red for copy; don't lighten text below `--muted-foreground`.
6. Keep it calm: soft low-opacity shadows, `bg-surface` cards on the cool near-white page —
   never heavy saturated panels.
7. Reach for the shared motion variants before inventing new animations.
8. Never pull in the admin panel's dark purple theme, and don't reintroduce the old warm
   sand/teal palettes — repoint stray warm/teal literals to the semantic tokens.
