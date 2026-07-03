# Design System — apps/web

The member-facing app's visual language. **This applies to `apps/web` only.** The
`apps/admin` is a separate dark MUI dashboard — never mix the two. Keep these design systems
independent: do not copy `apps/web` tokens into the admin panel or vice-versa.

Source of truth: `apps/web/src/styles/tokens.css`, `src/styles/fonts.ts`,
`src/app/globals.css`, `src/components/ui/*`, `src/lib/motion.ts`. When you change those, run
`community-kb refresh frontend` to update this doc.

## Aesthetic direction

**Warm & light.** Soft cream backgrounds, warm-white cards, warm-taupe hairline borders, warm
near-black text, generous whitespace. The Indigenous-heritage warmth is back — but lightened and
airy, not heavy. A single strong accent: **brand red `#c53133`** for primary CTAs, active states
and focus rings; teal and warm brown are quiet supporting hues. Display headings in **Cinzel**
(serif), body/UI in **Montserrat**. Pill-shaped buttons with soft, low-opacity hue shadows.

> Historical note: the app briefly used a minimal Inter / black-&-white system, which replaced the
> original heavy sand/red/brown palette. This warm-light system restores the original flavor at a
> lighter weight. The CSS variable **names** were preserved throughout (only their **values**
> changed) so existing callers keep working.

## Color tokens (`src/styles/tokens.css`)

Defined on `:root` and exposed to Tailwind v4 via `@theme inline` (use as `bg-primary`,
`text-foreground`, `border-border`, etc.). Warm-light palette:

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `#faf7f1` | page background (soft cream) |
| `--foreground` | `#1c1a17` | primary text (warm near-black) |
| `--surface` | `#fffdf9` | cards / panels (warm white) |
| `--surface-muted` | `#f4efe6` | muted surfaces / hover |
| `--border` | `#e6dccc` | warm taupe hairline borders |
| `--muted-foreground` | `#6f6456` | secondary / muted text |
| `--primary` / `--primary-foreground` | `#c53133` / `#ffffff` | brand-red CTA + white text |
| `--secondary` / `--secondary-foreground` | `#6fafc4` / `#1c1a17` | teal supporting hue |
| `--accent` / `--accent-foreground` | `#b38a5a` / `#1c1a17` | warm brown supporting hue |
| `--ring` | `#c53133` | focus ring (red) |

Brand tokens: `--brand-red` `#c53133`, `--brand-sky` `#6fafc4`, `--brand-brown` `#b38a5a`,
`--brand-sand` `#ede6dc`, `--brand-sand-soft` `#f7f2ec`, `--brand-black` `#1c1a17`. Prefer the
semantic tokens above; reach for `brand-*` only for decorative warm fills.

Shadows stay minimal — soft, low-opacity, often hue-tinted (e.g. the primary button's
`rgba(197,49,51,0.45)` at long negative spread). Airy, never heavy.

## Typography (`src/styles/fonts.ts`)

Real Google fonts via `next/font/google`, applied as CSS variables on `<body>` in
`app/layout.tsx` and consumed through the `--font-*-base` tokens.

| Role | Font | Variable |
|------|------|----------|
| Display / headings | **Cinzel** (400/600/700) | `--font-display` |
| Body / UI | **Montserrat** (400/500/600/700) | `--font-body` |
| Alt body | **Lato** (400/700) | `--font-body-alt` |

- Compatibility exports: `poppins` → Lato, `inter` → Montserrat. Existing imports keep working.
- `--font-sans-base` / `--font-ui-base` resolve to Montserrat; `--font-display-base` to Cinzel.
- `globals.css`: `h1, h2` use `--font-display-base` (Cinzel), weight 700; body uses
  `--font-sans-base` (Montserrat) with `optimizeLegibility` + antialiasing.

## Component patterns

- **Buttons** (`components/ui/button.tsx`, CVA): pill shape `rounded-[200px]`, `font-medium`,
  200ms transition, soft hue shadows. Variants:
  - `primary` — solid brand-red pill, white text (the default; the CTA).
  - `outline` — warm hairline border (`border-border`), warm-white bg, near-black text;
    hover raises `bg-surface-muted`.
  - `secondary` / `accent` — teal / warm-brown solid pills with matching soft shadows.
  - `ghost` — transparent, hover muted cream surface.
  - Sizes `sm/md/lg/xl/icon`, plus `fullWidth`. All existing variant names still exist.
- **Inputs** (`components/ui/input.tsx`, shared `inputBaseClassName` reused by textarea & select
  trigger): clean rectangle `rounded-md`, `border-border`, warm-white bg, `text-[15px]`, red focus
  (`focus-visible:border-ring` + `ring-ring/25`). No drop shadow.
- **Checkbox / radio** (`ui/checkbox.tsx`, `ui/radio-group.tsx`): warm hairline border, warm-white
  bg; checked state fills / dots brand red (`data-[state=checked]:bg-primary`, `text-primary`).
- **Select** (`ui/select.tsx`): trigger reuses the input style; content is `rounded-md` on
  `bg-surface` with a subtle soft shadow; check indicator is red (`text-primary`).
- **Labels / form** (`ui/label.tsx`, `ui/form.tsx`): labels `text-[15px] font-medium text-foreground`;
  descriptions `text-muted-foreground`; error text stays red (`text-red-600`).
- **Dialog** (`ui/dialog.tsx`): warm scrim `bg-foreground/50` + blur; content on `bg-surface` with
  a large radius.
- **Nav / footer** (`layout/public-navbar.tsx`, `public-footer.tsx`): 80px top nav on
  `bg-background/95` blur with hairline bottom border; red pill CTA. Footer is light
  (`bg-surface`, hairline top border, warm near-black/muted text).
- **Steppers / step indicators** (`features/enrollment/components/enrollment-stepper.tsx`):
  active & completed circles fill brand red (`bg-primary text-primary-foreground`); upcoming are
  outlined with `border-border`.
- Always compose classes with `cn()` (`src/lib/utils.ts`); use `class-variance-authority` for
  variants. shadcn config: **"new-york"** style, base color zinc, lucide icons (`components.json`).

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

## Testing (`vitest` + Testing Library)

Component tests run on **Vitest** (jsdom, globals) with **@testing-library/react**. Config in
`vitest.config.ts` (+ `vitest.setup.ts` importing `@testing-library/jest-dom`); `@/*` resolves to
`./src`. Run with `pnpm --filter community-frontend-web test`. Co-locate `*.test.tsx` next to the
component (see `src/components/ui/{button,input,form}.test.tsx`).

## When building new frontend UI

1. Reuse `components/ui/*` and the semantic tokens above — don't hardcode hex values.
2. Cinzel headings, Montserrat body; warm near-black text on cream, hairline `border-border`
   borders, lots of whitespace.
3. Red (`bg-primary`) only for the primary CTA / active / focus; teal & brown accents sparingly.
4. Keep it light and airy: soft low-opacity shadows, `bg-surface` cards on the cream page —
   never heavy saturated panels.
5. Reach for the shared motion variants before inventing new animations.
6. Never pull in the admin panel's dark purple theme, and don't drift back to pure black-&-white
   neutrals — repoint any `#000`/grey literals to the semantic tokens.
