import { cn } from "@/lib/utils";

/**
 * Shared chrome for the site navbars. The signed-out (`PublicNavbar`) and
 * signed-in (`ProtectedNavbar`) headers must look like the SAME component with
 * different links — both consume these classes so the container treatment can
 * never drift apart.
 *
 * Visual language: a slender civic header bar. This is a tribal enrollment and
 * governance service, so the bar is grounded and flush rather than a floating
 * rounded pill — a hairline rule instead of a lifted drop shadow, a fixed
 * 56/60px height, and tab-style underlines instead of button pills. Restraint
 * is the point: the chrome should read as official record-keeping, not as an
 * app toolbar. Azul (`primary`) marks the active section; red stays reserved
 * for the Enroll CTA.
 */

/** Fixed full-width header wrapper (keeps the nav-clearance pages rely on). */
export const navbarHeaderClass =
  "width-before-scroll-bar fixed inset-x-0 top-0 z-50";

/**
 * The bar surface — edge to edge, translucent over a deep blur, closed by a
 * single hairline rule. No radius and no ambient shadow: those are what made
 * the old pill read as bubbly.
 */
export const navbarFrameClass =
  "border-border/60 bg-surface/85 supports-backdrop-filter:bg-surface/70 border-b backdrop-blur-xl";

/** The constrained row inside the bar. Fixed height keeps the rhythm steady. */
export const navbarPillClass =
  "mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[3.75rem] sm:gap-4 sm:px-6 lg:gap-2 lg:px-8";

/** Mobile menu — a panel attached to the bar, not a floating card. */
export const navbarMobilePanelClass =
  "border-border/60 bg-surface/95 supports-backdrop-filter:bg-surface/85 border-t px-4 py-4 backdrop-blur-xl sm:px-6 lg:hidden";

/**
 * Desktop nav link — a document tab rather than a button. The active section
 * carries a short azul rule on the bar's baseline; inactive items reveal a
 * muted one on hover. No pill, no lift: a governance header shouldn't bounce.
 */
export function desktopNavLinkClass(isActive: boolean) {
  return cn(
    "relative shrink-0 rounded-sm px-3 py-2 text-[0.84rem] font-medium tracking-[-0.01em] whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface xl:text-[0.875rem]",
    "after:absolute after:inset-x-3 after:-bottom-[0.3rem] after:h-[2px] after:rounded-full after:transition-opacity after:duration-200 motion-reduce:after:transition-none",
    isActive
      ? "text-primary after:bg-primary after:opacity-100"
      : "text-muted-foreground hover:text-foreground after:bg-primary/35 after:opacity-0 hover:after:opacity-100",
  );
}

/** Mobile menu nav link — the same azul marking, sized for touch. */
export function mobileNavLinkClass(isActive: boolean) {
  return cn(
    "rounded-lg px-3 py-2.5 text-[0.9rem] font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    isActive
      ? "bg-primary/8 text-primary"
      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  );
}
