"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { PageHeroSection } from "@/components/shared/page-hero-section";
import { fadeInUpItem } from "@/lib/motion";

import homeSharedStyles from "@/features/home/styles/home-shared.module.scss";

export function EnrollmentHero() {
  const t = useTranslations("enrollment.hero");

  return (
    <PageHeroSection
      backgroundClassName="bg-background"
      containerClassName={homeSharedStyles.sectionContainer}
    >
      <motion.h1
        className="text-foreground mt-4 max-w-4xl text-[clamp(1.7rem,4.1vw,3.5rem)] leading-[1.02] font-semibold tracking-tight sm:mt-5 lg:mt-6"
        variants={fadeInUpItem}
      >
        {t("title")}
      </motion.h1>

      <motion.p
        className="text-muted-foreground mt-4 max-w-3xl text-[0.95rem] leading-[1.6] sm:mt-5 sm:text-[1rem]"
        variants={fadeInUpItem}
      >
        {t("subtitle")}
      </motion.p>
    </PageHeroSection>
  );
}
