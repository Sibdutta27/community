/**
 * Which territories have hand-written long-form history in the message
 * catalog (`yucayeke.welcome` / `.highlights` / `.legacy`).
 *
 * Deliberately an explicit allow-list rather than something inferred: the
 * remaining territories carry only the canonical record in
 * `territories.ts` plus their short blurb, and inventing pre-colonial
 * narrative to fill the gap would be fabricating heritage. As real copy
 * is written per territory, add its slug here.
 *
 * Plain module (no `"use client"`) so server components can call it.
 */
const SLUGS_WITH_LONGFORM: ReadonlySet<string> = new Set(["guania"]);

export function hasLongformProse(slug: string): boolean {
  return SLUGS_WITH_LONGFORM.has(slug);
}
