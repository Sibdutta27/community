"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { HomeGuainiaMapSection } from "@/features/home/components/home-guainia-map-section";
import { HomeYucayekeOverviewSection } from "@/features/home/components/home-yucayeke-overview-section";

import sharedStyles from "../styles/home-shared.module.scss";

export function HomeYucayekeRegionsSection() {
  const t = useTranslations("home.yucayeke");

  return (
    <motion.section
      className="bg-background overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
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
            {t("title")}
          </motion.h2>

          <motion.p
            className="text-muted-foreground mx-auto mt-4 max-w-3xl text-sm leading-6 sm:text-base"
            variants={fadeInUpItem}
          >
            {t("subtitle")}
          </motion.p>
        </div>
        <HomeYucayekeOverviewSection />
      </div>
      <HomeGuainiaMapSection />
    </motion.section>
  );
}
