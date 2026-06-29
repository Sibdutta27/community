# Design System — CommunityFrontend

The member-facing app's visual language. **This applies to `CommunityFrontend` only.** The
`communityAdminPanel` is a separate dark MUI dashboard — never mix the two.

Source of truth: `CommunityFrontend/src/styles/tokens.css`, `src/styles/fonts.ts`,
`src/app/globals.css`, `src/components/ui/*`, `src/lib/motion.ts`. When you change those, run
`community-kb refresh frontend` to update this doc.

## Aesthetic direction

Warm, earthy, **Indigenous-heritage** identity. Soft sand backgrounds, warm taupe borders, a
confident red as the primary action color, sky-blue and brown as secondary/accent. Editorial
serif headings (Cinzel) over clean geometric sans body (Montserrat). Generous rounding, soft
warm-toned shadows, restrained staggered motion. Calm and inviting, not flashy.

## Color tokens (`src/styles/tokens.css`)

Defined on `:root` and exposed to Tailwind v4 via `@theme inline` (use as `bg-primary`,
`text-foreground`, `border-border`, `bg-brand-sky`, etc.).

| Token | Value | Use |
|-------|-------|-----|
| `--brand-sky` | `#6fafc4` | secondary brand (teal/cyan) |
| `--brand-red` | `#c53133` | primary brand / CTAs |
| `--brand-brown` | `#b38a5a` | accent / warm tertiary |
| `--brand-sand` | `#ede6dc` | earthy light |
| `--brand-sand-soft` | `#f7f2ec` | page background base |
| `--background` | `#f7f2ec` | page background |
| `--foreground` | `#15110d` | primary text (near-black warm) |
| `--surface` | `#fffdf9` | cards / panels |
| `--surface-muted` | `#f2ebdf` | muted surfaces |
| `--border` | `#d7c7b2` | borders (warm taupe) |
| `--muted-foreground` | `#66584b` | secondary text |
| `--primary` / `--primary-foreground` | `#c53133` / `#fffaf5` | red button + cream text |
| `--secondary` / `--secondary-foreground` | `#6fafc4` / `#16110d` | |
| `--accent` / `--accent-foreground` | `#b38a5a` / `#16110d` | |
| `--ring` | `#c53133` | focus ring |

There is no formal dark-mode palette; the only "dark" surfaces are intentional feature panels
(e.g. auth `featurePanel`) using brown-black gradients with cream text.

## Typography (`src/styles/fonts.ts`)

Loaded via `next/font/google` as CSS variables; consumed through `--font-*-base` tokens.

| Role | Font | Variable | Weights |
|------|------|----------|---------|
| Display / headings (serif) | **Cinzel** | `--font-display` | 400, 600, 700 |
| Body / UI (geometric sans) | **Montserrat** | `--font-body` | 400, 500, 600, 700 |
| Alt body (humanist sans) | **Lato** | `--font-body-alt` | 400, 700 |

- `--font-sans-base` → Lato, `--font-ui-base` → Montserrat, `--font-display-base` → Cinzel.
- `poppins` is a **compatibility alias for Lato** (rebrand leftover) — prefer the real names.
- `globals.css`: `h1, h2` use the display font, weight 700, `letter-spacing: -0.03em`; body uses
  `--font-sans-base` with `optimizeLegibility` + antialiasing.

## Component patterns

- **Buttons** (`components/ui/button.tsx`, CVA): `rounded-full`, `font-semibold`,
  `tracking-[0.01em]`, transition on color/bg/border/shadow/transform 200ms. Variants
  `primary | secondary | accent | ghost`, each with a **custom colored drop-shadow** matching its
  hue (e.g. primary `shadow-[0_12px_24px_-18px_rgba(197,49,51,0.45)]`) and a `hover:brightness`
  shift. Sizes `sm/md/lg/xl/icon`, plus `fullWidth`.
- **Inputs** (`components/ui/input.tsx`): `rounded-xl`, `min-h-11`, `border-border bg-surface`,
  subtle shadow, `focus-visible:border-primary/45 ring-2 ring-primary/15`.
- **Cards / sections:** large radii — `rounded-[26px]` (form sections), `rounded-[30px]` (panels);
  soft directional shadows like `shadow-[0_24px_48px_-38px_rgb(21_17_13/0.24)]`.
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
High-impact, one-orchestrated-reveal — not scattered micro-interactions.

## When building new frontend UI

1. Reuse `components/ui/*` and the tokens above — don't hardcode hex values.
2. Headings in Cinzel, body in Montserrat; keep the warm sand/red palette.
3. Rounded-full buttons with hue-matched shadows; large-radius cards.
4. Reach for the shared motion variants before inventing new animations.
5. Match the existing earthy, calm, editorial tone — avoid generic SaaS purple-on-white.
