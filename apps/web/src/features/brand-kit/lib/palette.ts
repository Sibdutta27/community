import type { ContrastAssessment } from "./contrast";

/**
 * The azul-flag palette, documented for the `/brand-kit` page.
 *
 * The hex values here MIRROR `src/styles/tokens.css` (the single source of
 * truth) — they exist only as *documentation content* (hex labels + contrast
 * math) and are unit-tested against WCAG AA. Swatches are always painted
 * with token utilities (`bg-primary`, …), never with these literals; if a
 * token value changes in tokens.css, update the matching hex here and the
 * palette tests will re-verify the AA claims.
 */

export type PaletteEntry = Readonly<{
  /** CSS custom property name, e.g. `--primary`. */
  token: string;
  /** Documented value (mirrors tokens.css). */
  hex: string;
  /** Semantic role — when to reach for this token. */
  role: string;
  /** Token utility that paints the swatch (never arbitrary hex). */
  swatchClassName: string;
  /** Token utility for legible sample text on the swatch. */
  swatchTextClassName: string;
  /** The typical partner this token is measured against. */
  pairedWith: Readonly<{ label: string; hex: string }>;
  /** Which WCAG AA target the pairing must satisfy. */
  assessment: ContrastAssessment;
}>;

export type PaletteGroup = Readonly<{
  id: string;
  title: string;
  description: string;
  entries: readonly PaletteEntry[];
}>;

const ink = { label: "ink text (--foreground)", hex: "#141a22" } as const;

export const paletteGroups: readonly PaletteGroup[] = [
  {
    id: "base",
    title: "Base surfaces — the 60",
    description:
      "Cool, clean canvas: near-white blue-grey page, white cards, muted panels. Everything sits on these.",
    entries: [
      {
        token: "--background",
        hex: "#f6f8fa",
        role: "Page background — the cool near-white canvas",
        swatchClassName: "bg-background",
        swatchTextClassName: "text-foreground",
        pairedWith: ink,
        assessment: "aa-text",
      },
      {
        token: "--surface",
        hex: "#ffffff",
        role: "Cards, panels, inputs — white elevated surfaces",
        swatchClassName: "bg-surface",
        swatchTextClassName: "text-foreground",
        pairedWith: ink,
        assessment: "aa-text",
      },
      {
        token: "--surface-muted",
        hex: "#eef2f6",
        role: "Muted surfaces — hovers, badges, recessed tabs",
        swatchClassName: "bg-surface-muted",
        swatchTextClassName: "text-foreground",
        pairedWith: ink,
        assessment: "aa-text",
      },
    ],
  },
  {
    id: "neutrals",
    title: "Neutrals — ink & lines",
    description:
      "Ink text, muted copy and hairline borders. Icon tiles are neutral ink with white glyphs — never colored.",
    entries: [
      {
        token: "--foreground",
        hex: "#141a22",
        role: "Primary text (ink); also the neutral icon-tile fill",
        swatchClassName: "bg-foreground",
        swatchTextClassName: "text-primary-foreground",
        pairedWith: { label: "page background", hex: "#f6f8fa" },
        assessment: "aa-text",
      },
      {
        token: "--muted-foreground",
        hex: "#5a6472",
        role: "Secondary / muted copy, captions, placeholders",
        swatchClassName: "bg-muted-foreground",
        swatchTextClassName: "text-primary-foreground",
        pairedWith: { label: "page background", hex: "#f6f8fa" },
        assessment: "aa-text",
      },
      {
        token: "--border",
        hex: "#e2e6eb",
        role: "Hairline borders on cards, inputs and dividers",
        swatchClassName: "bg-border",
        swatchTextClassName: "text-foreground",
        pairedWith: { label: "surface (decorative hairline)", hex: "#ffffff" },
        assessment: "decorative",
      },
    ],
  },
  {
    id: "azul",
    title: "Azul — the 30, actions & focus",
    description:
      "Deep flag azul drives every interaction: primary CTAs, the active enrollment step, links, focus rings and text selection.",
    entries: [
      {
        token: "--primary",
        hex: "#0a56a8",
        role: "Primary CTAs, active step, links — pairs with --primary-foreground (#ffffff)",
        swatchClassName: "bg-primary",
        swatchTextClassName: "text-primary-foreground",
        pairedWith: { label: "white text (--primary-foreground)", hex: "#ffffff" },
        assessment: "aa-text",
      },
      {
        token: "--secondary",
        hex: "#e7f2fb",
        role: "Celeste-tint supporting surface — pairs with --secondary-foreground (#123b5e)",
        swatchClassName: "bg-secondary",
        swatchTextClassName: "text-secondary-foreground",
        pairedWith: {
          label: "deep-azul text (--secondary-foreground)",
          hex: "#123b5e",
        },
        assessment: "aa-text",
      },
      {
        token: "--ring",
        hex: "#0a56a8",
        role: "Focus ring (and ::selection) — azul, always visible",
        swatchClassName: "bg-ring",
        swatchTextClassName: "text-primary-foreground",
        pairedWith: { label: "page background (non-text UI)", hex: "#f6f8fa" },
        assessment: "aa-ui",
      },
    ],
  },
  {
    id: "celeste",
    title: "Celeste — highlight fills",
    description:
      "Azul celeste is a FILL/ACCENT hue only — badges, highlight pills, decorative touches. It always carries dark ink-azul text and never small light text. (--celeste is an alias of the same hue.)",
    entries: [
      {
        token: "--accent",
        hex: "#4ea6dc",
        role: "Highlight fill — pairs with --accent-foreground (#0b2033); dark text only",
        swatchClassName: "bg-accent",
        swatchTextClassName: "text-accent-foreground",
        pairedWith: {
          label: "dark azul text (--accent-foreground)",
          hex: "#0b2033",
        },
        assessment: "aa-text",
      },
    ],
  },
  {
    id: "emphasis",
    title: "Flag red — the 10, emphasis",
    description:
      "Reserved. The flag red appears ONLY on the Enroll/hero emphasis CTAs — one loud moment per view, never decoration, never small text on light surfaces.",
    entries: [
      {
        token: "--emphasis",
        hex: "#c42032",
        role: "The Enroll Today / hero CTA only — pairs with --emphasis-foreground (#ffffff)",
        swatchClassName: "bg-emphasis",
        swatchTextClassName: "text-emphasis-foreground",
        pairedWith: {
          label: "white text (--emphasis-foreground)",
          hex: "#ffffff",
        },
        assessment: "aa-text",
      },
    ],
  },
  {
    id: "destructive",
    title: "Destructive — errors",
    description:
      "Errors, invalid fields and irreversible actions. Distinct from the emphasis red so form errors never read as brand moments.",
    entries: [
      {
        token: "--destructive",
        hex: "#b3261e",
        role: "Error text/borders and destructive actions — pairs with --destructive-foreground (#ffffff)",
        swatchClassName: "bg-destructive",
        swatchTextClassName: "text-destructive-foreground",
        pairedWith: {
          label: "white text (--destructive-foreground)",
          hex: "#ffffff",
        },
        assessment: "aa-text",
      },
    ],
  },
];

/**
 * Footnotes rendered under the palette grid — the usage rules that don't
 * fit a swatch row.
 */
export const paletteNotes: readonly string[] = [
  "Celeste (--accent) and the bright flag red (--emphasis) are fills/accents only — never body or small text, and light text never sits on celeste.",
  "The flag's star yellow is NOT a UI token — it lives in logo artwork only.",
  "Legacy --brand-* names (--brand-red, --brand-sky, --brand-brown, --brand-sand, --brand-sand-soft, --brand-black) are aliases kept for existing callers — always prefer the semantic tokens.",
];
