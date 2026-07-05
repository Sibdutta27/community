import { describe, expect, it } from "vitest";

import {
  desktopNavLinkClass,
  mobileNavLinkClass,
  navbarMobilePanelClass,
  navbarPillClass,
} from "@/components/layout/navbar-chrome";

describe("navbar chrome", () => {
  describe("navbarPillClass — refined glass pill", () => {
    it("uses a deep frosted-glass blur with a translucent surface", () => {
      expect(navbarPillClass).toContain("backdrop-blur-xl");
      expect(navbarPillClass).toContain("supports-backdrop-filter:bg-surface/80");
      // Solid-ish fallback for browsers without backdrop-filter.
      expect(navbarPillClass).toContain("bg-surface/95");
    });

    it("layers a soft ambient drop shadow with an inner top highlight", () => {
      expect(navbarPillClass).toContain("inset_0_1px_0");
      expect(navbarPillClass).toContain("rgba(20,26,34");
    });
  });

  describe("navbarMobilePanelClass — matching glass panel", () => {
    it("gets the same frosted-glass treatment as the pill", () => {
      expect(navbarMobilePanelClass).toContain("backdrop-blur-xl");
      expect(navbarMobilePanelClass).toContain("inset_0_1px_0");
    });
  });

  describe("desktopNavLinkClass — azul active + accessible focus", () => {
    it("gives the active item a soft azul pill treatment", () => {
      const active = desktopNavLinkClass(true);
      expect(active).toContain("text-primary");
      expect(active).toContain("bg-primary/8");
    });

    it("keeps inactive items quiet with a muted hover surface", () => {
      const inactive = desktopNavLinkClass(false);
      expect(inactive).toContain("text-muted-foreground");
      expect(inactive).toContain("hover:text-foreground");
      expect(inactive).not.toContain("text-primary");
    });

    it("always carries a visible azul focus ring", () => {
      for (const isActive of [true, false]) {
        const className = desktopNavLinkClass(isActive);
        expect(className).toContain("focus-visible:ring-2");
        expect(className).toContain("focus-visible:ring-ring");
      }
    });

    it("respects prefers-reduced-motion on the hover lift", () => {
      expect(desktopNavLinkClass(false)).toContain(
        "motion-reduce:transform-none",
      );
    });
  });

  describe("mobileNavLinkClass — consistent with desktop", () => {
    it("uses the same azul active treatment as desktop", () => {
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
