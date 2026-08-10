"use client";

import { useMemo, useState } from "react";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useOptionalProfileInfoQuery } from "@/features/profile/lib/profile-queries";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import {
  TERRITORIES,
  resolveTerritory,
  type Territory,
  type TerritoryStatus,
} from "../content/territories";
import { TerritoryStatusBadge } from "./territory-info-card";
import sharedStyles from "../styles/yucayeke-shared.module.scss";

type StatusFilter = "all" | TerritoryStatus;

const FILTERS: readonly StatusFilter[] = ["all", "confirmed", "oralTradition"];

const filterLabelKeys = {
  all: "filterAll",
  confirmed: "filterConfirmed",
  oralTradition: "filterOral",
} as const satisfies Record<StatusFilter, string>;

/**
 * The full directory of ancestral yucayekes. Every card is driven by the
 * canonical record in `territories.ts` + the per-slug blurb, so all 21
 * render without hand-written page copy. The member's own territory
 * sorts to the front and carries the `--primary` accent.
 */
export function YucayekeDirectorySection() {
  const t = useTranslations("yucayeke.directory");
  const tMap = useTranslations("yucayekeMap");

  const [filter, setFilter] = useState<StatusFilter>("all");

  const profileQuery = useOptionalProfileInfoQuery();
  const ownTerritory = resolveTerritory(
    profileQuery.data?.enrollment?.personalInfo?.yucayeke,
  );

  const territories = useMemo(() => {
    const matches = TERRITORIES.filter((territory) =>
      filter === "all" ? true : territory.status === filter,
    );

    // Own territory first; the rest keep the canonical (geographic) order.
    return [...matches].sort((a, b) => {
      const aOwn = a.slug === ownTerritory?.slug ? 0 : 1;
      const bOwn = b.slug === ownTerritory?.slug ? 0 : 1;
      return aOwn - bOwn;
    });
  }, [filter, ownTerritory?.slug]);

  return (
    <motion.section
      className="bg-background"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        <h2 className="sr-only">{t("srHeading")}</h2>

        <motion.div
          variants={fadeInUpItem}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div
            role="group"
            aria-label={t("srHeading")}
            className="border-border bg-surface-muted inline-flex flex-wrap gap-1 rounded-full border p-1"
          >
            {FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={filter === option}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
                  filter === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(filterLabelKeys[option])}
              </button>
            ))}
          </div>

          <p className="text-muted-foreground text-[12px] font-medium">
            {t("countLabel", { count: territories.length })}
          </p>
        </motion.div>

        <div className="mt-6 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {territories.map((territory) => (
            <TerritoryDirectoryCard
              key={territory.slug}
              territory={territory}
              isOwn={territory.slug === ownTerritory?.slug}
              description={tMap(`territories.${territory.slug}.description`)}
            />
          ))}
        </div>

        <motion.div variants={fadeInUpItem} className="mt-8">
          <Button asChild variant="outline">
            <Link href="/yucayeke/map">{t("openMap")}</Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}

type TerritoryDirectoryCardProps = Readonly<{
  territory: Territory;
  isOwn: boolean;
  description: string;
}>;

function TerritoryDirectoryCard({
  territory,
  isOwn,
  description,
}: TerritoryDirectoryCardProps) {
  const t = useTranslations("yucayeke.territory");
  const tMap = useTranslations("yucayekeMap");

  return (
    <motion.article variants={fadeInUpItem} className="min-w-0">
      <Link
        href={`/yucayeke/${territory.slug}`}
        className={cn(
          "group bg-surface shadow-card-soft flex h-full flex-col rounded-2xl border p-5 transition-all",
          "hover:shadow-card focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          isOwn ? "border-primary" : "border-border hover:border-primary/40",
        )}
      >
        {territory.cacique ? (
          <p className="text-muted-foreground text-[10.5px] font-semibold tracking-[0.14em] uppercase">
            {t("caciqueLabel")} · {territory.cacique}
          </p>
        ) : null}

        <h3 className="text-foreground group-hover:text-primary mt-1.5 text-[1.35rem] leading-tight font-semibold tracking-tight transition-colors">
          {territory.displayName}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <TerritoryStatusBadge status={territory.status} />
          {isOwn ? (
            <span className="bg-primary text-primary-foreground inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-semibold">
              {t("yoursBadge")}
            </span>
          ) : null}
        </div>

        <p className="text-muted-foreground mt-3.5 line-clamp-3 text-[0.85rem] leading-6">
          {description}
        </p>

        <div className="mt-auto pt-4">
          <p className="text-muted-foreground text-[10.5px] font-semibold tracking-[0.03em] uppercase">
            {tMap("labels.municipalities")}
          </p>
          <p className="text-foreground mt-1 text-[0.8rem] leading-5">
            {territory.municipalities.join(" · ")}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
