"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { PageHeroSection } from "@/components/shared/page-hero-section";
import type { YucayekeHeroStats } from "@/features/yucayeke/types/community-meta";
import { fadeInUpItem } from "@/lib/motion";

import sharedStyles from "../styles/yucayeke-shared.module.scss";

type YucayekeHeroProps = Readonly<{
  stats: YucayekeHeroStats;
}>;

const statsKeys = [
  "totalMembers",
  "activeMembers",
  "upcomingEvents",
] as const satisfies readonly (keyof YucayekeHeroStats)[];

const numberFormatter = new Intl.NumberFormat("en-US");

export function YucayekeHero({ stats }: YucayekeHeroProps) {
  const t = useTranslations("yucayeke.hero");
  const tDirectory = useTranslations("yucayeke.directory");

  return (
    <PageHeroSection containerClassName={sharedStyles.sectionContainer}>
      <motion.p
        className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase"
        variants={fadeInUpItem}
      >
        {tDirectory("eyebrow")}
      </motion.p>

      {/* The page is the directory of all 21 territories now, not a single
          yucayeke — per-territory copy lives at /yucayeke/[slug]. */}
      <motion.h1
        className="text-foreground mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:mt-5 sm:text-5xl lg:mt-6 lg:text-6xl"
        variants={fadeInUpItem}
      >
        <span className={sharedStyles.gradientText}>{tDirectory("title")}</span>
      </motion.h1>

      <motion.p
        className="text-muted-foreground mt-6 max-w-3xl text-base leading-7 sm:text-lg"
        variants={fadeInUpItem}
      >
        {tDirectory("subtitle")}
      </motion.p>

      <motion.div
        className="divide-border/90 mt-5 grid w-full max-w-[38rem] grid-cols-3 divide-x sm:mt-6"
        variants={fadeInUpItem}
      >
        {statsKeys.map((key) => (
          <div className="px-2 py-2 text-center sm:px-3 sm:py-2.5" key={key}>
            <p className="text-foreground text-[1.05rem] leading-tight font-semibold tracking-tight sm:text-[1.35rem]">
              {numberFormatter.format(stats[key])}
            </p>
            <p className="text-foreground mt-0.5 text-[0.8rem] leading-5 font-normal whitespace-nowrap sm:text-[0.86rem] sm:leading-5">
              {t(`stats.${key}`)}
            </p>
          </div>
        ))}
      </motion.div>
    </PageHeroSection>
  );
}
