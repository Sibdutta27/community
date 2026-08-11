import { describe, expect, it } from "vitest";

import {
  desktopNavLinkClass,
  mobileNavLinkClass,
  navbarFrameClass,
  navbarMobilePanelClass,
  navbarPillClass,
} from "@/components/layout/navbar-chrome";

describe("navbar chrome", () => {
  describe("navbarFrameClass — slender civic bar", () => {
    it("closes the bar with a hairline rule instead of a lifted shadow", () => {
      expect(navbarFrameClass).toContain("border-b");
      // The floating pill's ambient drop is what read as "bubbly" — a
      // governance header sits on the page, it doesn't hover above it.
      expect(navbarFrameClass).not.toContain("shadow-[");
      expect(navbarFrameClass).not.toContain("rounded-full");
    });

    it("keeps the frosted-glass surface with a solid-ish fallback", () => {
      expect(navbarFrameClass).toContain("backdrop-blur-xl");
      expect(navbarFrameClass).toContain(
        "supports-backdrop-filter:bg-surface/70",
      );
      expect(navbarFrameClass).toContain("bg-surface/85");
    });
  });

  describe("navbarPillClass — the constrained row", () => {
    it("pins a compact fixed height so the bar stays slender", () => {
      expect(navbarPillClass).toContain("h-14");
      expect(navbarPillClass).toContain("sm:h-[3.75rem]");
    });

    it("carries no radius of its own — the bar is edge to edge", () => {
      expect(navbarPillClass).not.toContain("rounded");
    });
  });

  describe("navbarMobilePanelClass — attached, not floating", () => {
    it("hangs off the bar with a hairline rule and no card shadow", () => {
      expect(navbarMobilePanelClass).toContain("border-t");
      expect(navbarMobilePanelClass).toContain("backdrop-blur-xl");
      expect(navbarMobilePanelClass).not.toContain("shadow-[");
      expect(navbarMobilePanelClass).not.toContain("rounded-3xl");
    });
  });

  describe("desktopNavLinkClass — document tab, not a button", () => {
    it("marks the active section with an azul rule on the baseline", () => {
      const active = desktopNavLinkClass(true);
      expect(active).toContain("text-primary");
      expect(active).toContain("after:bg-primary");
      expect(active).toContain("after:opacity-100");
      // No pill fill: that treatment belonged to the old floating bar.
      expect(active).not.toContain("bg-primary/8");
    });

    it("keeps inactive items quiet and reveals the rule on hover", () => {
      const inactive = desktopNavLinkClass(false);
      expect(inactive).toContain("text-muted-foreground");
      expect(inactive).toContain("hover:text-foreground");
      expect(inactive).toContain("hover:after:opacity-100");
      expect(inactive).not.toContain("text-primary");
    });

    it("never bounces — no hover lift in a governance header", () => {
      expect(desktopNavLinkClass(false)).not.toContain("-translate-y");
    });

    it("always carries a visible azul focus ring", () => {
      for (const isActive of [true, false]) {
        const className = desktopNavLinkClass(isActive);
        expect(className).toContain("focus-visible:ring-2");
        expect(className).toContain("focus-visible:ring-ring");
      }
    });

    it("respects prefers-reduced-motion on the underline transition", () => {
      expect(desktopNavLinkClass(false)).toContain(
        "motion-reduce:after:transition-none",
      );
    });
  });

  describe("mobileNavLinkClass — touch sizing, same azul marking", () => {
    it("uses the azul active treatment", () => {
      const active = mobileNavLinkClass(true);
      expect(active).toContain("text-primary");
      expect(active).toContain("bg-primary/8");
    });

    it("carries a visible azul focus ring", () => {
      expect(mobileNavLinkClass(false)).toContain("focus-visible:ring-2");
      expect(mobileNavLinkClass(false)).toContain("focus-visible:ring-ring");
    });
  });
});
