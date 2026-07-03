import { cn } from "@/lib/utils";

/**
 * Shared chrome for the site navbars. The signed-out (`PublicNavbar`) and
 * signed-in (`ProtectedNavbar`) headers must look like the SAME floating
 * rounded-pill component with different links — both consume these classes
 * so the container treatment can never drift apart.
 */

/** Fixed full-width header wrapper (keeps the nav-clearance pages rely on). */
export const navbarHeaderClass =
  "width-before-scroll-bar fixed inset-x-0 top-0 z-50";

/** Inset frame that floats the pill inside the page gutter. */
export const navbarFrameClass =
  "mx-auto max-w-7xl px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8 lg:pt-3";

/** The floating rounded-pill bar itself. */
export const navbarPillClass =
  "border-border/90 bg-surface/95 supports-backdrop-filter:bg-surface/92 flex items-center justify-between gap-3 rounded-full border px-3.5 py-2.5 shadow-[0_16px_32px_-24px_rgba(21,17,13,0.18)] backdrop-blur-md sm:gap-4 sm:px-4 sm:py-3 lg:gap-3 lg:px-3.5 lg:py-2 xl:px-4 xl:py-2.5";

/** Floating dropdown panel for the mobile menu (below the pill). */
export const navbarMobilePanelClass =
  "border-border bg-surface mt-3 rounded-3xl border p-4 shadow-[0_18px_34px_-24px_rgba(21,17,13,0.22)] lg:hidden";

/** Desktop nav link — teal (`text-primary`) only on the active item. */
export function desktopNavLinkClass(isActive: boolean) {
  return cn(
    "shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors lg:px-3 lg:py-1.5 lg:text-[0.92rem] xl:px-4 xl:py-2 xl:text-sm",
    isActive
      ? "bg-surface-muted text-primary"
      : "text-muted-foreground hover:text-foreground",
  );
}

/** Mobile menu nav link — same active treatment as desktop. */
export function mobileNavLinkClass(isActive: boolean) {
  return cn(
    "rounded-2xl px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
    isActive
      ? "bg-surface-muted text-primary"
      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  );
}
