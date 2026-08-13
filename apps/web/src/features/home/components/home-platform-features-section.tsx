"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { HomePlatformFeatureCard } from "@/features/home/components/home-platform-feature-card";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/home-shared.module.scss";

const platformFeatureIcons = {
  identification: "/icons/home/platform-features/id-card.svg",
  lineage: "/icons/home/platform-features/family-tree.svg",
  documents: "/icons/home/platform-features/document-vault.svg",
} as const;

const platformFeatures = [
  { id: "tribalId", iconType: "identification" },
  { id: "lineageTree", iconType: "lineage" },
  { id: "documentVault", iconType: "documents" },
  { id: "announcements", iconType: "identification" },
  { id: "events", iconType: "lineage" },
  { id: "services", iconType: "documents" },
  { id: "regionalCommunity", iconType: "identification" },
  { id: "mobileApps", iconType: "lineage" },
  { id: "culturalResources", iconType: "documents" },
] as const;

export function HomePlatformFeaturesSection() {
  const t = useTranslations("home.platform");

  return (
    <motion.section
      className="bg-surface overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        <div className="mx-auto max-w-5xl text-center">
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
            className="text-muted-foreground mx-auto mt-4 max-w-4xl text-sm leading-6 sm:text-base"
            variants={fadeInUpItem}
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <motion.div
          className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          variants={fadeInUpContainer}
        >
          {platformFeatures.map((feature) => (
            <HomePlatformFeatureCard
              key={feature.id}
              iconSrc={platformFeatureIcons[feature.iconType]}
              text={t(`features.${feature.id}`)}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
