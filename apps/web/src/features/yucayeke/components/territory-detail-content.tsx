"use client";

import { useMemo } from "react";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { SurfaceCard } from "@/components/shared/surface-card";
import { Button } from "@/components/ui/button";
import { useOptionalProfileInfoQuery } from "@/features/profile/lib/profile-queries";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";

import { resolveTerritory, type Territory } from "../content/territories";
import { buildTerritoryShapes } from "../lib/geometry";
import { useYucayekeGeometryQuery } from "../lib/yucayeke-map-queries";
import { BorikenMap } from "./boriken-map";
import { TerritoryStatusBadge } from "./territory-info-card";

type TerritoryDetailContentProps = Readonly<{
  territory: Territory;
  children?: React.ReactNode;
}>;

/**
 * Reading page for a single yucayeke. Everything above the fold comes
 * from the canonical territory record (`territories.ts`) plus the
 * per-slug blurb, so all 21 territories render fully; `children` carries
 * the optional hand-written long-form sections.
 */
export function TerritoryDetailContent({
  territory,
  children,
}: TerritoryDetailContentProps) {
  const t = useTranslations("yucayeke.territory");
  const tMap = useTranslations("yucayekeMap");

  const geometryQuery = useYucayekeGeometryQuery();
  const profileQuery = useOptionalProfileInfoQuery();

  const shapes = useMemo(
    () => (geometryQuery.data ? buildTerritoryShapes(geometryQuery.data) : []),
    [geometryQuery.data],
  );

  const ownTerritory = resolveTerritory(
    profileQuery.data?.enrollment?.personalInfo?.yucayeke,
  );
  const isOwnTerritory = ownTerritory?.slug === territory.slug;

  return (
    <motion.article
      variants={fadeInUpContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16 sm:px-6"
    >
      <motion.div variants={fadeInUpItem}>
        <Link
          href="/yucayeke"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[0.83rem] font-medium transition-colors"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          {t("backToDirectory")}
        </Link>
      </motion.div>

      {/* Asymmetric split: the name carries the page, the island locates it. */}
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
        <div className="min-w-0">
          {territory.cacique ? (
            <motion.p
              variants={fadeInUpItem}
              className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase"
            >
              {t("caciqueLabel")} · {territory.cacique}
            </motion.p>
          ) : null}

          <motion.h1
            variants={fadeInUpItem}
            className="text-foreground mt-2 text-[2.4rem] leading-[1.02] font-semibold tracking-tight sm:text-[3.1rem] lg:text-[3.6rem]"
          >
            {territory.displayName}
          </motion.h1>

          <motion.div
            variants={fadeInUpItem}
            className="mt-4 flex flex-wrap items-center gap-2"
          >
            <TerritoryStatusBadge status={territory.status} />
            {isOwnTerritory ? (
              <span className="bg-primary text-primary-foreground inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-semibold">
                {t("yoursBadge")}
              </span>
            ) : null}
            {territory.geometryKey === null ? (
              <span className="border-border bg-surface text-muted-foreground inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[12px] font-semibold">
                {t("notMapped")}
              </span>
            ) : null}
          </motion.div>

          <motion.p
            variants={fadeInUpItem}
            className="text-foreground mt-6 max-w-2xl text-[1rem] leading-7 sm:text-[1.08rem] sm:leading-8"
          >
            {tMap(`territories.${territory.slug}.description`)}
          </motion.p>

          <motion.dl
            variants={fadeInUpItem}
            className="border-border mt-8 grid gap-6 border-t pt-6 sm:grid-cols-2"
          >
            <div>
              <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.03em] uppercase">
                {t("municipalitiesLabel")}
              </dt>
              <dd>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {territory.municipalities.map((municipality) => (
                    <li
                      key={municipality}
                      className="bg-surface-muted text-foreground rounded-full px-2.5 py-1 text-[12px] font-medium"
                    >
                      {municipality}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>

            {territory.altNames.length > 0 ? (
              <div>
                <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.03em] uppercase">
                  {t("alsoKnownAs")}
                </dt>
                <dd className="text-foreground mt-2.5 text-[0.9rem] leading-6">
                  {territory.altNames.join(" · ")}
                </dd>
              </div>
            ) : null}
          </motion.dl>
        </div>

        <motion.aside variants={fadeInUpItem} className="min-w-0">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.03em] uppercase">
            {t("locatorHeading")}
          </p>

          {/* No container chrome — the silhouette is its own outline. */}
          <div className="mt-3">
            {shapes.length > 0 ? (
              <BorikenMap
                variant="preview"
                shapes={shapes}
                highlightedKey={territory.geometryKey}
              />
            ) : (
              <div className="bg-surface-muted aspect-[2/1] w-full animate-pulse rounded-lg" />
            )}
          </div>

          {territory.geometryKey ? (
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link href="/yucayeke/map">{t("openMap")}</Link>
            </Button>
          ) : null}

          <p className="text-muted-foreground mt-5 text-[12px] leading-[1.15rem]">
            {territory.status === "confirmed"
              ? t("provenanceConfirmed")
              : t("provenanceOral")}
          </p>
        </motion.aside>
      </div>

      {children ?? (
        <motion.div variants={fadeInUpItem} className="mt-12">
          <SurfaceCard padding="roomy">
            <h2 className="text-foreground text-[1.05rem] font-semibold tracking-tight sm:text-[1.15rem]">
              {t("prosePendingTitle")}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-[0.9rem] leading-6">
              {t("prosePendingBody")}
            </p>
          </SurfaceCard>
        </motion.div>
      )}
    </motion.article>
  );
}
