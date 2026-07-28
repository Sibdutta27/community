"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { SurfaceCard } from "@/components/shared/surface-card";
import { Button } from "@/components/ui/button";

import { resolveTerritory } from "../content/territories";
import { buildTerritoryShapes } from "../lib/geometry";
import { useYucayekeGeometryQuery } from "../lib/yucayeke-map-queries";
import { BorikenMap } from "./boriken-map";
import { TerritoryStatusBadge } from "./territory-info-card";

type YourYucayekeCardProps = Readonly<{
  yucayekeValue: string | null;
  yucayekeUnknown: boolean;
}>;

/**
 * Profile "Your Yucayeke" card: decorative mini-map with the member's
 * territory lit in `--primary`, identity line, and the CTA into the full
 * interactive map. Degrades through unknown / unassigned / unmapped
 * states without ever erroring.
 */
export function YourYucayekeCard({
  yucayekeValue,
  yucayekeUnknown,
}: YourYucayekeCardProps) {
  const t = useTranslations("yucayekeMap");
  const geometryQuery = useYucayekeGeometryQuery();

  const territory = resolveTerritory(yucayekeValue);

  const shapes = useMemo(
    () => (geometryQuery.data ? buildTerritoryShapes(geometryQuery.data) : []),
    [geometryQuery.data],
  );

  return (
    <SurfaceCard
      padding="compact"
      tone="elevated"
      data-testid="your-yucayeke-card"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <div className="bg-background border-border min-w-0 flex-1 overflow-hidden rounded-xl border p-2 sm:max-w-[46%]">
          {shapes.length > 0 ? (
            <BorikenMap
              variant="preview"
              shapes={shapes}
              highlightedKey={territory?.geometryKey ?? null}
            />
          ) : (
            <div className="bg-surface-muted aspect-[2/1] w-full animate-pulse rounded-lg" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div>
            <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
              {t("profileCard.title")}
            </h3>

            {territory ? (
              <>
                <p className="text-foreground mt-2 text-[1.3rem] leading-tight font-semibold tracking-tight">
                  {territory.displayName}
                </p>
                {territory.cacique ? (
                  <p className="text-muted-foreground mt-1 text-[0.85rem] leading-5">
                    {t("labels.cacique", { name: territory.cacique })}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <TerritoryStatusBadge status={territory.status} />
                  {territory.geometryKey === null ? (
                    <span className="border-border bg-surface text-muted-foreground inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[12px] font-semibold">
                      {t("labels.notMapped")}
                    </span>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-3 text-[0.85rem] leading-5">
                  {t(`territories.${territory.slug}.description`)}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground mt-2 text-[0.88rem] leading-5">
                {yucayekeUnknown
                  ? t("profileCard.unknown")
                  : t("profileCard.unassigned")}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              size="sm"
              variant={territory ? "primary" : "outline"}
            >
              <Link href="/yucayeke/map">{t("profileCard.explore")}</Link>
            </Button>
            {!territory && !yucayekeUnknown ? (
              <Button asChild size="sm" variant="secondary">
                <Link href="/enrollment">
                  {t("profileCard.completeEnrollment")}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
