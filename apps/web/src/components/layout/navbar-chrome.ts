import { cn } from "@/lib/utils";

/**
 * Shared chrome for the site navbars. The signed-out (`PublicNavbar`) and
 * signed-in (`ProtectedNavbar`) headers must look like the SAME floating
 * rounded-pill component with different links — both consume these classes
 * so the container treatment can never drift apart.
 *
 * Visual language: a lifted frosted-glass pill — deep blur over a translucent
 * white surface, a crisp hairline border, an inner top highlight and a soft
 * layered ink shadow. Active nav items get a quiet azul (`primary`) pill;
 * red stays reserved for the Enroll CTA.
 */

/** Fixed full-width header wrapper (keeps the nav-clearance pages rely on). */
export const navbarHeaderClass =
  "width-before-scroll-bar fixed inset-x-0 top-0 z-50";

/** Inset frame that floats the pill inside the page gutter. */
export const navbarFrameClass =
  "mx-auto max-w-7xl px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8 lg:pt-3";

/**
 * The floating rounded-pill bar itself — frosted glass. Layered shadow =
 * inner top highlight (glass edge) + tight contact shadow + soft ambient
 * drop; `bg-surface/95` stays as the fallback when backdrop-filter is
 * unsupported.
 */
export const navbarPillClass =
  "border-border/70 bg-surface/95 supports-backdrop-filter:bg-surface/80 flex items-center justify-between gap-3 rounded-full border px-3.5 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_2px_6px_-2px_rgba(20,26,34,0.08),0_24px_48px_-26px_rgba(20,26,34,0.28)] backdrop-blur-xl sm:gap-4 sm:px-4 sm:py-3 lg:gap-3 lg:px-3.5 lg:py-2 xl:px-4 xl:py-2.5";

/** Floating dropdown panel for the mobile menu (same glass as the pill). */
export const navbarMobilePanelClass =
  "border-border/70 bg-surface/95 supports-backdrop-filter:bg-surface/85 mt-3 rounded-3xl border p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_2px_8px_-4px_rgba(20,26,34,0.1),0_28px_52px_-28px_rgba(20,26,34,0.3)] backdrop-blur-xl lg:hidden";

/**
 * Desktop nav link — the active item reads as a soft azul pill
 * (`text-primary` on `bg-primary/8`); inactive items stay quiet and lift
 * subtly on hover. Focus is always a visible azul ring.
 */
export function desktopNavLinkClass(isActive: boolean) {
  return cn(
    "shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-[color,background-color,transform] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none motion-reduce:transform-none lg:px-2.5 lg:py-1.5 lg:text-[0.85rem] xl:px-3.5 xl:py-2 xl:text-[0.95rem]",
    isActive
      ? "bg-primary/8 text-primary"
      : "text-muted-foreground hover:bg-surface-muted/70 hover:text-foreground hover:-translate-y-px active:translate-y-0",
  );
}

/** Mobile menu nav link — same azul active treatment as desktop. */
export function mobileNavLinkClass(isActive: boolean) {
  return cn(
    "rounded-2xl px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    isActive
      ? "bg-primary/8 text-primary"
      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  );
}
