"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { HomeEnrollmentCta } from "@/features/home/components/home-enrollment-cta";
import { HomeEnrollmentResourcesSection } from "@/features/home/components/home-enrollment-resources-section";
import { HomeEnrollmentStepCard } from "@/features/home/components/home-enrollment-step-card";
import sharedStyles from "../styles/home-shared.module.scss";

// Governance restyle: marketing step numbers are neutral (charcoal on a warm
// off-white bubble) — the azul accent stays reserved for CTAs and active state.
const warmStepTone = {
  bubbleClassName: "border-border bg-surface-muted border",
  numberClassName: "text-foreground",
} as const;

const enrollmentSteps = [
  { step: "1", id: "account" },
  { step: "2", id: "personalInfo" },
  { step: "3", id: "maternalLineage" },
  { step: "4", id: "documents" },
] as const;

const needItems = [
  {
    id: "governmentId",
    iconSrc: "/icons/home/enrollment/government-id.svg",
  },
  {
    id: "birthCertificate",
    iconSrc: "/icons/home/enrollment/certificate.svg",
  },
  {
    id: "lineageRecords",
    iconSrc: "/icons/home/enrollment/lineage-record.svg",
  },
  {
    id: "supportingDocs",
    iconSrc: "/icons/home/enrollment/supporting-doc.svg",
  },
] as const;

const tipIds = ["saveProgress", "scanQuality", "review"] as const;

export function HomeEnrollmentProcessSection() {
  const t = useTranslations("home.process");

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
          className="mt-11 grid gap-x-4 gap-y-9 md:grid-cols-2 md:gap-4 xl:grid-cols-4"
          variants={fadeInUpContainer}
        >
          {enrollmentSteps.map((card) => (
            <HomeEnrollmentStepCard
              key={card.step}
              step={card.step}
              title={t(`steps.${card.id}.title`)}
              description={t(`steps.${card.id}.description`)}
              tone={warmStepTone}
            />
          ))}
        </motion.div>

        <motion.div className="mt-10" variants={fadeInUpContainer}>
          <HomeEnrollmentResourcesSection
            items={needItems.map((item) => ({
              iconSrc: item.iconSrc,
              title: t(`needs.items.${item.id}.title`),
              description: t(`needs.items.${item.id}.description`),
            }))}
            tips={tipIds.map((tipId) => t(`tips.items.${tipId}`))}
          />
        </motion.div>

        <HomeEnrollmentCta />
      </div>
    </motion.section>
  );
}
