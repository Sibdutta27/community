"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { PageHeroSection } from "@/components/shared/page-hero-section";
import { fadeInUpItem } from "@/lib/motion";

import sharedStyles from "../styles/community-shared.module.scss";

export function CommunityHero() {
  const t = useTranslations("community.hero");

  // Uses the shared hero's default quiet ink-wash background — the old
  // teal/blue radial tints predate the azul governance palette.
  return (
    <PageHeroSection containerClassName={sharedStyles.sectionContainer}>
      <motion.h1
        className="text-foreground mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:mt-5 sm:text-5xl lg:mt-6 lg:text-6xl"
        variants={fadeInUpItem}
      >
        {t("titleLead")}{" "}
        <span className={sharedStyles.gradientText}>{t("titleHighlight")}</span>
      </motion.h1>

      <motion.p
        className="text-muted-foreground mt-6 max-w-3xl text-base leading-7 sm:text-lg"
        variants={fadeInUpItem}
      >
        {t("subtitle")}
      </motion.p>
    </PageHeroSection>
  );
}
