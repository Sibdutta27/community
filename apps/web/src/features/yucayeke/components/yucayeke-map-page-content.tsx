"use client";

import { useMemo, useState } from "react";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { SurfaceCard } from "@/components/shared/surface-card";
import { Button } from "@/components/ui/button";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { useProfileInfoQuery } from "@/features/profile/lib/profile-queries";

import { resolveTerritory, type Territory } from "../content/territories";
import { buildTerritoryShapes } from "../lib/geometry";
import { useYucayekeGeometryQuery } from "../lib/yucayeke-map-queries";
import { BorikenMap } from "./boriken-map";
import { TerritoryInfoCard } from "./territory-info-card";
import { TerritoryList } from "./territory-list";

/**
 * Full interactive territory-map experience: SVG map + synced focusable
 * list + reading panel. The member's declared yucayeke (from enrollment)
 * highlights in `--primary` and its info card opens by default.
 */
export function YucayekeMapPageContent() {
  const t = useTranslations("yucayekeMap");
  const geometryQuery = useYucayekeGeometryQuery();
  const profileQuery = useProfileInfoQuery();

  const personalInfo = profileQuery.data?.enrollment?.personalInfo;
  const ownTerritory = resolveTerritory(personalInfo?.yucayeke);
  const yucayekeUnknown = Boolean(personalInfo?.yucayekeUnknown);
  const hasDeclared = Boolean(personalInfo?.yucayeke);

  const shapes = useMemo(
    () => (geometryQuery.data ? buildTerritoryShapes(geometryQuery.data) : []),
    [geometryQuery.data],
  );

  const [explicitSelection, setSelected] = useState<Territory | null>(null);
  const [hovered, setHovered] = useState<Territory | null>(null);

  // The member's own territory is the default selection until the member
  // explicitly picks another one — derived, so no state syncing needed.
  const selected = explicitSelection ?? ownTerritory;

  const selectByGeometryKey = (geometryKey: string) => {
    const shape = shapes.find((entry) => entry.geometryKey === geometryKey);
    if (shape?.territory) setSelected(shape.territory);
  };

  const hoverByGeometryKey = (geometryKey: string | null) => {
    if (geometryKey === null) {
      setHovered(null);
      return;
    }
    const shape = shapes.find((entry) => entry.geometryKey === geometryKey);
    setHovered(shape?.territory ?? null);
  };

  return (
    <motion.section
      variants={fadeInUpContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-6xl px-0 pt-28 pb-10 sm:px-2"
    >
      <motion.header variants={fadeInUpItem} className="max-w-3xl">
        <h1 className="text-foreground text-[1.7rem] leading-[1.05] font-semibold tracking-tight sm:text-[2rem] lg:text-[2.3rem]">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-2 text-[0.88rem] leading-5 sm:text-[0.95rem]">
          {t("subtitle")}
        </p>

        {ownTerritory ? (
          <span className="border-border bg-secondary text-secondary-foreground mt-3 inline-flex w-fit items-center rounded-full border px-3 py-1 text-[12px] font-semibold">
            {t("labels.yourTerritoryChip", {
              name: ownTerritory.displayName,
            })}
          </span>
        ) : null}
      </motion.header>

      {yucayekeUnknown && !hasDeclared ? (
        <motion.p
          variants={fadeInUpItem}
          className="border-border bg-surface-muted text-foreground mt-4 max-w-3xl rounded-xl border px-4 py-3 text-[0.85rem] leading-5"
        >
          {t("profileCard.unknown")}
        </motion.p>
      ) : null}

      {!yucayekeUnknown && !hasDeclared && profileQuery.isSuccess ? (
        <motion.div
          variants={fadeInUpItem}
          className="border-border bg-surface-muted mt-4 flex max-w-3xl flex-col items-start gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-foreground text-[0.85rem] leading-5">
            {t("profileCard.unassigned")}
          </p>
          <Button asChild size="sm" variant="secondary">
            <Link href="/enrollment">
              {t("profileCard.completeEnrollment")}
            </Link>
          </Button>
        </motion.div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Deliberately card-less: the territory outlines ARE the border,
            so wrapping the map in a bordered surface boxes the island. */}
        <motion.div variants={fadeInUpItem} className="min-w-0">
          <div className="p-1 sm:p-2">
            {geometryQuery.isPending ? (
              <div
                aria-label={t("states.loading")}
                role="status"
                className="bg-surface-muted aspect-[2/1] w-full animate-pulse rounded-xl"
              />
            ) : geometryQuery.isError ? (
              <div className="bg-surface-muted flex aspect-[2/1] w-full flex-col items-center justify-center gap-3 rounded-xl px-6 text-center">
                <p className="text-muted-foreground text-[0.88rem]">
                  {t("states.error")}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void geometryQuery.refetch()}
                >
                  {t("states.retry")}
                </Button>
              </div>
            ) : (
              <BorikenMap
                shapes={shapes}
                labels
                highlightedKey={ownTerritory?.geometryKey ?? null}
                selectedKey={selected?.geometryKey ?? null}
                hoveredKey={hovered?.geometryKey ?? null}
                onSelect={selectByGeometryKey}
                onHover={hoverByGeometryKey}
              />
            )}

            <p className="text-muted-foreground mt-3 text-[12px] leading-[1.15rem]">
              {t("disclaimer")}
            </p>
          </div>
        </motion.div>

        <motion.aside
          variants={fadeInUpItem}
          className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start"
        >
          <TerritoryInfoCard
            territory={hovered ?? selected}
            isOwnTerritory={(hovered ?? selected)?.slug === ownTerritory?.slug}
          />
          <SurfaceCard padding="compact">
            <TerritoryList
              selectedSlug={selected?.slug ?? null}
              highlightedSlug={ownTerritory?.slug ?? null}
              onSelect={setSelected}
              onHover={setHovered}
            />
          </SurfaceCard>
        </motion.aside>
      </div>
    </motion.section>
  );
}
