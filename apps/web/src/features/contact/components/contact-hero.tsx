"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { PageHeroSection } from "@/components/shared/page-hero-section";
import { fadeInUpItem } from "@/lib/motion";

import homeSharedStyles from "@/features/home/styles/home-shared.module.scss";

export function ContactHero() {
  const t = useTranslations("contact.hero");

  return (
    <PageHeroSection containerClassName={homeSharedStyles.sectionContainer}>
      <motion.h1
        className="text-foreground max-w-4xl text-[clamp(1.7rem,4.1vw,3.5rem)] leading-[0.98] font-semibold tracking-[-0.055em]"
        variants={fadeInUpItem}
      >
        {t("title")}
      </motion.h1>

      <motion.p
        className="text-muted-foreground mt-5 max-w-3xl text-[0.95rem] leading-[1.6] sm:text-[1rem]"
        variants={fadeInUpItem}
      >
        {t("subtitle")}
      </motion.p>
    </PageHeroSection>
  );
}
