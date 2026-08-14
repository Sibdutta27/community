import sharedStyles from "../styles/home-shared.module.scss";

/**
 * The tinted sections' faint grid, as a layer rather than a background on the
 * section itself.
 *
 * It has to be its own absolutely-positioned element because the grid is
 * masked: `mask-image` on the section would fade the section's *content* along
 * with its texture. Same reason `PageHeroSection` keeps its wash in a separate
 * `aria-hidden` div.
 *
 * The section it sits in needs `relative`, and whatever follows needs to
 * establish its own stacking context (a `relative` container is enough) so the
 * copy paints above the grid.
 */
export function HomeSectionBackdrop() {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${sharedStyles.sectionBackdrop}`}
    />
  );
}
