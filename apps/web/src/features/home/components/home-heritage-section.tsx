"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { HomeHeritageCard } from "@/features/home/components/home-heritage-card";
import { HomeMissionFeature } from "@/features/home/components/home-mission-feature";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/home-shared.module.scss";

const heritageCards = [
  {
    id: "sovereignData",
    iconSrc: "/icons/home/heritage/sovereignty-first.svg",
    tone: "mint",
  },
  {
    id: "culturalIdentity",
    iconSrc: "/icons/home/heritage/cultural-identity.svg",
    tone: "cream",
  },
  {
    id: "communityHelp",
    iconSrc: "/icons/home/heritage/community-hub.svg",
    tone: "lilac",
  },
] as const;

const missionItemIds = [
  "respectfulDesign",
  "securePrivate",
  "mobileWeb",
] as const;

export function HomeHeritageSection() {
  const t = useTranslations("home.heritage");

  return (
    <motion.section
      className="overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.14 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(
          sharedStyles.sectionContainer,
          "relative pt-2 pb-10 sm:pb-12 lg:pt-4 lg:pb-14",
        )}
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.p
            className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase"
            variants={fadeInUpItem}
          >
            {t("label")}
          </motion.p>

          <motion.h2
            className="text-foreground mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
            variants={fadeInUpItem}
          >
            {t.rich("title", {
              highlight: (chunks) => (
                <span className={sharedStyles.gradientText}>{chunks}</span>
              ),
            })}
          </motion.h2>

          <motion.p
            className="text-muted-foreground mt-4 text-sm leading-6 sm:text-base"
            variants={fadeInUpItem}
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <motion.div
          className="mt-10 grid gap-4 lg:grid-cols-3"
          variants={fadeInUpContainer}
        >
          {heritageCards.map((card) => (
            <HomeHeritageCard
              key={card.id}
              description={t(`cards.${card.id}.description`)}
              iconSrc={card.iconSrc}
              title={t(`cards.${card.id}.title`)}
              tone={card.tone}
            />
          ))}
        </motion.div>

        <motion.article
          className="bg-foreground text-background shadow-card relative mt-10 overflow-hidden rounded-2xl p-6 sm:p-8 lg:p-10"
          variants={fadeInUpItem}
        >
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
            <div className="max-w-105">
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("mission.title")}
              </h3>

              <p className="text-background/80 mt-5 text-sm leading-6">
                {t("mission.body")}
              </p>
            </div>

            <div className="grid gap-4">
              {missionItemIds.map((itemId) => (
                <HomeMissionFeature
                  key={itemId}
                  label={t(`mission.items.${itemId}`)}
                />
              ))}
            </div>
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}
