"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { SurfaceCard } from "@/components/shared/surface-card";
import { cn } from "@/lib/utils";

import type { Territory } from "../content/territories";

type TerritoryInfoCardProps = Readonly<{
  territory: Territory | null;
  isOwnTerritory?: boolean;
  className?: string;
}>;

export function TerritoryStatusBadge({
  status,
}: Readonly<{ status: Territory["status"] }>) {
  const t = useTranslations("yucayekeMap");

  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-semibold",
        status === "confirmed"
          ? "bg-secondary text-secondary-foreground"
          : "border-border bg-surface-muted text-muted-foreground border",
      )}
    >
      {t(`status.${status}`)}
    </span>
  );
}

/**
 * Reading panel for one territory: identity, status, present-day
 * municipalities, and the short history blurb from the message catalog.
 */
export function TerritoryInfoCard({
  territory,
  isOwnTerritory = false,
  className,
}: TerritoryInfoCardProps) {
  const t = useTranslations("yucayekeMap");

  if (!territory) {
    return (
      <SurfaceCard className={className} data-testid="territory-info-empty">
        <p className="text-muted-foreground text-[0.88rem] leading-5">
          {t("labels.selectPrompt")}
        </p>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className={className} data-testid="territory-info-card">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-foreground text-[1.2rem] leading-tight font-semibold tracking-tight sm:text-[1.3rem]">
          {territory.displayName}
        </h3>
        {isOwnTerritory ? (
          <span className="bg-primary text-primary-foreground inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-semibold">
            {t("labels.yourTerritory")}
          </span>
        ) : null}
      </div>

      {territory.cacique ? (
        <p className="text-muted-foreground mt-1 text-[0.88rem] leading-5">
          {t("labels.cacique", { name: territory.cacique })}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TerritoryStatusBadge status={territory.status} />
        {territory.geometryKey === null ? (
          <span className="border-border bg-surface text-muted-foreground inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[12px] font-semibold">
            {t("labels.notMapped")}
          </span>
        ) : null}
      </div>

      <p className="text-foreground mt-4 text-[0.88rem] leading-6 sm:text-[0.93rem]">
        {t(`territories.${territory.slug}.description`)}
      </p>

      <div className="mt-4">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.03em] uppercase">
          {t("labels.municipalities")}
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {territory.municipalities.map((municipality) => (
            <li
              key={municipality}
              className="bg-surface-muted text-foreground rounded-full px-2.5 py-1 text-[12px] font-medium"
            >
              {municipality}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={`/yucayeke/${territory.slug}`}
        className="text-primary mt-4 inline-flex items-center gap-1 text-[0.83rem] font-semibold hover:underline"
      >
        {t("labels.readMore", { name: territory.displayName })}
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </SurfaceCard>
  );
}
