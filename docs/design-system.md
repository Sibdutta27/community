# Design System — apps/web

The member-facing app's visual language. **This applies to `apps/web` only.** The
`apps/admin` is a separate dark MUI dashboard — never mix the two. Keep these design systems
independent: do not copy `apps/web` tokens into the admin panel or vice-versa.

Source of truth: `apps/web/src/styles/tokens.css`, `src/styles/fonts.ts`,
`src/app/globals.css`, `src/components/ui/*`, `src/lib/motion.ts`. When you change those, run
`community-kb refresh frontend` to update this doc.

## Aesthetic direction

Minimal, editorial, **near-monochrome black-&-white** (from the client Figma). White backgrounds,
hairline grey borders, black text, generous whitespace. A single typeface — **Inter** — across
H1/H2, body, nav and labels. Pill-shaped buttons (the prominent style is an outline pill). Calm,
clean, high-contrast; not warm/earthy, not flashy SaaS-purple.

> Historical note: the app previously used a warm sand/red/brown Indigenous-heritage palette with
> Cinzel/Montserrat. That direction has been replaced by this minimal Inter / B&W system. The CSS
> variable **names** were preserved (only their **values** changed) so existing callers keep working.

## Color tokens (`src/styles/tokens.css`)

Defined on `:root` and exposed to Tailwind v4 via `@theme inline` (use as `bg-primary`,
`text-foreground`, `border-border`, etc.). Near-monochrome palette:

| Token | Value | Use |
|-------|-------|-----|
| `--background` | `#ffffff` | page background (white) |
| `--foreground` | `#000000` | primary text (black) |
| `--surface` | `#ffffff` | cards / panels |
| `--surface-muted` | `#f5f5f5` | very-light muted surfaces / hover |
| `--border` | `#d9d9d9` | hairline borders |
| `--muted-foreground` | `#777777` | secondary / muted text |
| `--primary` / `--primary-foreground` | `#000000` / `#ffffff` | solid black button + white text |
| `--secondary` / `--secondary-foreground` | `#434343` / `#ffffff` | dark-grey solid |
| `--accent` / `--accent-foreground` | `#777777` / `#ffffff` | mid-grey solid |
| `--ring` | `#000000` | focus ring (black) |

Legacy `--brand-*` tokens are retained for back-compat but remapped to neutrals
(`--brand-red` → `#000`, `--brand-sky` → `#434343`, `--brand-brown` → `#777`,
`--brand-sand` → `#f5f5f5`, `--brand-sand-soft` → `#fff`). Prefer the semantic tokens above.

Reference type scale (Figma): H1 ~36px bold, H2 / subhead ~24px semibold, body 16px/1.5,
nav & labels 15px. 80px top nav with a hairline bottom border, generous whitespace.

## Typography (`src/styles/fonts.ts`)

**Inter is the single typeface for the whole app.** Loaded once via `next/font/google` and exposed
as CSS variables consumed through `--font-*-base` tokens.

| Role | Font | Variable |
|------|------|----------|
| Display / headings | **Inter** | `--font-display` |
| Body / UI | **Inter** | `--font-body` |
| Alt body | **Inter** | `--font-body-alt` |

- The legacy exports `cinzel`, `montserrat`, `lato`, `poppins` are kept as **Inter aliases** so
  existing imports keep working — they all render Inter now. Prefer `inter` for new code.
- `--font-sans-base`, `--font-ui-base`, `--font-display-base` all resolve to Inter.
- `globals.css`: `h1, h2` use `--font-display-base` (Inter), weight 700, tight letter-spacing;
  body uses `--font-sans-base` with `optimizeLegibility` + antialiasing.

## Component patterns

- **Buttons** (`components/ui/button.tsx`, CVA): pill shape `rounded-[200px]`, `font-medium`,
  200ms color/bg/border transition. Variants:
  - `outline` — **the prominent Figma style**: hairline dark border, transparent bg, black text;
    fills to solid black (`hover:bg-foreground hover:text-background`) on hover.
  - `primary` — solid black pill, white text (the default variant; solid CTA).
  - `secondary` / `accent` — dark-grey / mid-grey solid pills.
  - `ghost` — transparent, hover light-grey surface.
  - Sizes `sm/md/lg/xl/icon`, plus `fullWidth`. All existing variant names still exist.
- **Inputs** (`components/ui/input.tsx`, shared `inputBaseClassName` reused by textarea & select
  trigger): clean rectangle `rounded-md`, `border-border` (#d9d9d9), white bg, `text-[15px]`,
  black focus (`focus-visible:border-foreground` + `ring-ring`). No drop shadow.
- **Checkbox / radio** (`ui/checkbox.tsx`, `ui/radio-group.tsx`): hairline border, checked state
  fills black (`data-[state=checked]:bg-foreground` / black dot), black focus ring.
- **Select** (`ui/select.tsx`): trigger reuses the input style; content is `rounded-md` with a
  subtle neutral shadow; check indicator is black.
- **Labels / form** (`ui/label.tsx`, `ui/form.tsx`): labels `text-[15px] font-medium text-foreground`;
  descriptions `text-muted-foreground`; error text stays red (`text-red-600`).
- **Nav / footer** (`layout/public-navbar.tsx`, `public-footer.tsx`): 80px top nav, white bg,
  hairline bottom border, Inter links (15px), pill CTA. Footer is light (white, hairline top
  border, black/grey text) — no longer the old dark panel.
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
2. Everything in Inter; black text on white, hairline `#d9d9d9` borders, lots of whitespace.
3. Pill buttons: outline pill for the prominent action, solid black pill for a strong CTA.
4. Reach for the shared motion variants before inventing new animations.
5. Match the minimal monochrome tone — avoid reintroducing the old warm sand/red palette, and never
   pull in the admin panel's dark purple theme.
