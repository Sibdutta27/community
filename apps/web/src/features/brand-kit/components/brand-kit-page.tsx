import { ComponentsSection } from "./components-section";
import { GuidelinesSection } from "./guidelines-section";
import { MotionSection } from "./motion-section";
import { PaletteSection } from "./palette-section";
import { PatternsSection } from "./patterns-section";
import { SurfaceSection } from "./surface-section";
import { TypographySection } from "./typography-section";

/**
 * The living style guide at `/brand-kit`: palette (with measured WCAG AA
 * contrast), the Inter type scale, spacing/radius/shadow, the full
 * components/ui/* catalog, the signature patterns, the shared motion
 * presets, and the Do/Don't brand rules. Entirely token-driven — the page
 * itself is a specimen of the system it documents.
 */

const sectionLinks = [
  { href: "#palette", label: "Palette" },
  { href: "#typography", label: "Typography" },
  { href: "#surfaces", label: "Spacing & shadow" },
  { href: "#components", label: "Components" },
  { href: "#patterns", label: "Patterns" },
  { href: "#motion", label: "Motion" },
  { href: "#guidelines", label: "Do & Don't" },
] as const;

const heroFacts = [
  "Azul-led flag palette · 60-30-10",
  "Inter, one typeface",
  "WCAG AA verified",
  "Token-driven — zero hardcoded hex",
] as const;

export function BrandKitPage() {
  return (
    <main className="bg-background min-h-screen px-4 pt-24 pb-16 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-5 text-center">
          <p className="text-muted-foreground text-[0.6rem] font-semibold tracking-[0.3em] uppercase">
            Design system · apps/web
          </p>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
            Brand Kit
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-7 sm:text-lg">
            The living style guide for the member-facing app — every token,
            type style, component and pattern, rendered from the same
            primitives the product ships with.
          </p>
          <ul className="flex list-none flex-wrap justify-center gap-2 p-0">
            {heroFacts.map((fact) => (
              <li
                className="border-border bg-surface text-muted-foreground rounded-full border px-3.5 py-1 text-[0.78rem] font-medium"
                key={fact}
              >
                {fact}
              </li>
            ))}
          </ul>
        </header>

        <nav aria-label="Brand kit sections" className="sticky top-20 z-10">
          <ul className="border-border/70 bg-surface/95 supports-backdrop-filter:bg-surface/80 mx-auto flex w-fit max-w-full list-none flex-wrap items-center justify-center gap-1 rounded-full border p-1.5 shadow-card-soft backdrop-blur-xl">
            {sectionLinks.map((link) => (
              <li key={link.href}>
                <a
                  className="text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-surface rounded-full px-3 py-1.5 text-[0.82rem] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <PaletteSection />
        <TypographySection />
        <SurfaceSection />
        <ComponentsSection />
        <PatternsSection />
        <MotionSection />
        <GuidelinesSection />
      </div>
    </main>
  );
}
