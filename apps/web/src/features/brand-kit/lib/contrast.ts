/**
 * WCAG 2.x relative-luminance contrast math for the brand-kit palette
 * section. Pure functions so the AA badges on `/brand-kit` are computed
 * from the documented token hex values instead of hand-maintained.
 */

/** What a token pairing is expected to satisfy. */
export type ContrastAssessment =
  /** Normal-size text — WCAG AA requires >= 4.5:1. */
  | "aa-text"
  /** Non-text UI (focus rings, control boundaries) — AA requires >= 3:1. */
  | "aa-ui"
  /** Purely decorative (hairline borders) — no contrast requirement. */
  | "decorative";

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

function channelToLinear(channel: number): number {
  const c = channel / 255;

  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  if (!HEX_PATTERN.test(hex)) {
    throw new Error(`Expected a 6-digit hex color, got "${hex}"`);
  }

  const value = hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((offset) =>
    channelToLinear(Number.parseInt(value.slice(offset, offset + 2), 16)),
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio (1–21) between two 6-digit hex colors. Symmetric. */
export function contrastRatio(hexA: string, hexB: string): number {
  const luminanceA = relativeLuminance(hexA);
  const luminanceB = relativeLuminance(hexB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);

  return (lighter + 0.05) / (darker + 0.05);
}

/** "7.2:1"-style display string (trailing ".0" dropped). */
export function formatContrastRatio(ratio: number): string {
  const rounded = Math.round(ratio * 10) / 10;

  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}:1`;
}

const CONTRAST_TARGETS: Record<ContrastAssessment, number> = {
  "aa-text": 4.5,
  "aa-ui": 3,
  decorative: 0,
};

/** Whether a measured ratio satisfies the pairing's WCAG AA target. */
export function meetsContrastTarget(
  ratio: number,
  assessment: ContrastAssessment,
): boolean {
  return ratio >= CONTRAST_TARGETS[assessment];
}
