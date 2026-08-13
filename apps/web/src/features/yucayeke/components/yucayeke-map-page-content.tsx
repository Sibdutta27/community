"use client";

import { useMemo, useState } from "react";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { SurfaceCard } from "@/components/shared/surface-card";
import { Button } from "@/components/ui/button";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { useOptionalProfileInfoQuery } from "@/features/profile/lib/profile-queries";

import { resolveTerritory, type Territory } from "../content/territories";
import { buildTerritoryShapes } from "../lib/geometry";
import { useTerritoryView } from "../lib/territory-overrides-context";
import { useYucayekeGeometryQuery } from "../lib/yucayeke-map-queries";
import { BorikenMap } from "./boriken-map";
import { TerritoryInfoCard } from "./territory-info-card";
import { TerritoryList } from "./territory-list";

/**
 * Full interactive territory-map experience: SVG map + synced focusable
 * list + reading panel. The member's declared yucayeke (from enrollment)
 * highlights in `--primary` and its info card opens by default.
 *
 * This is the centrepiece of the PUBLIC `/yucayeke` page, so it must
 * degrade cleanly with no session — hence the optional profile query
 * (the redirecting one would bounce signed-out visitors to /sign-in).
 */
export function YucayekeMapPageContent() {
  const t = useTranslations("yucayekeMap");
  const geometryQuery = useYucayekeGeometryQuery();
  const profileQuery = useOptionalProfileInfoQuery();

  const personalInfo = profileQuery.data?.enrollment?.personalInfo;

  // Canonical everywhere it is used as an identity (slug, geometry key,
  // selection); overridden only where its name is drawn on screen.
  const ownTerritory = resolveTerritory(personalInfo?.yucayeke);
  const ownTerritoryView = useTerritoryView(ownTerritory);

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
      className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6"
    >
      {/* h1: with the hero removed this is the page's top-level heading,
          so the document outline would otherwise start at h2. */}
      <motion.header variants={fadeInUpItem} className="max-w-3xl">
        <h1 className="text-foreground text-[1.7rem] leading-[1.05] font-semibold tracking-tight sm:text-[2rem]">
          {t("labels.exploreHeading")}
        </h1>
        <p className="text-muted-foreground mt-2 text-[0.88rem] leading-5 sm:text-[0.95rem]">
          {t("subtitle")}
        </p>

        {ownTerritory ? (
          <span className="border-border bg-secondary text-secondary-foreground mt-3 inline-flex w-fit items-center rounded-full border px-3 py-1 text-[12px] font-semibold">
            {t("labels.yourTerritoryChip", {
              name: ownTerritoryView?.displayName ?? ownTerritory.displayName,
            })}
          </span>
        ) : null}
      </motion.header>

      {/* No enrollment prompts here: /yucayeke is a public page about the
          territories themselves, and the member's own standing is surfaced
          on the profile's identity card instead. */}

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

        {/* Row 1, right: the territory list sits beside the map — desktop
            only. On a phone the same grid stacks it BETWEEN the map and the
            reading panel, and a 21-row column of names pushed the panel a
            screen and a half below the tap that opened it. Hidden there so
            the mobile page reads map → description.

            Nothing is lost by hiding it: `BorikenMap` renders each territory
            as a real `role="button"` path with `tabIndex={0}`, an accessible
            name and Enter/Space activation (see boriken-map.test.tsx), so the
            map itself is the keyboard/AT peer of this list. The two
            territories with no polygon are unreachable on the map, but they
            are reachable in the directory that follows this section on the
            same page — which is visible at every width. */}
        <motion.aside
          variants={fadeInUpItem}
          className="hidden min-w-0 lg:block"
        >
          <SurfaceCard padding="compact">
            <TerritoryList
              selectedSlug={selected?.slug ?? null}
              highlightedSlug={ownTerritory?.slug ?? null}
              onSelect={setSelected}
              onHover={setHovered}
            />
          </SurfaceCard>
        </motion.aside>

        {/* Row 2: the reading panel spans the full width, under both. */}
        <motion.div variants={fadeInUpItem} className="min-w-0 lg:col-span-2">
          <TerritoryInfoCard
            territory={hovered ?? selected}
            isOwnTerritory={(hovered ?? selected)?.slug === ownTerritory?.slug}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
