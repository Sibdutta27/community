import type { CSSProperties } from "react";

import { SurfaceCard } from "@/components/shared/surface-card";

type DashboardExpectationCardProps = Readonly<{
  iconSrc: string;
  title: string;
}>;

/**
 * The expectation SVGs still carry legacy warm-palette fills, so the glyph
 * is painted through a CSS mask with the ink token instead of an <img> —
 * keeping the icon tile neutral (surface-muted + ink) per the design system.
 */
function getMaskIconStyle(iconPath: string): CSSProperties {
  return {
    WebkitMaskImage: `url(${iconPath})`,
    WebkitMaskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskImage: `url(${iconPath})`,
    maskPosition: "center",
    maskRepeat: "no-repeat",
    maskSize: "contain",
  };
}

export function DashboardExpectationCard({
  iconSrc,
  title,
}: DashboardExpectationCardProps) {
  return (
    <SurfaceCard
      as="article"
      className="flex min-h-[8.5rem] flex-col items-center justify-center text-center sm:min-h-[9rem]"
      padding="compact"
    >
      <div className="border-border bg-surface-muted flex size-12 items-center justify-center rounded-xl border">
        <span
          aria-hidden="true"
          className="bg-foreground h-6 w-6"
          style={getMaskIconStyle(iconSrc)}
        />
      </div>

      <h3 className="text-foreground mt-5 text-[1.35rem] leading-tight font-semibold tracking-tight sm:text-[1.5rem]">
        {title}
      </h3>
    </SurfaceCard>
  );
}
