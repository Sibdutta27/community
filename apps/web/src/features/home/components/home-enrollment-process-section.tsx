"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { enrollmentStepDefinitions } from "@/features/enrollment/config/enrollment-steps";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { HomeEnrollmentCta } from "@/features/home/components/home-enrollment-cta";
import { HomeEnrollmentResourcesSection } from "@/features/home/components/home-enrollment-resources-section";
import { HomeEnrollmentStepCard } from "@/features/home/components/home-enrollment-step-card";
import { HomeSectionBackdrop } from "./home-section-backdrop";
import sharedStyles from "../styles/home-shared.module.scss";

// Governance restyle: marketing step numbers are neutral (charcoal on a warm
// off-white bubble) — the azul accent stays reserved for CTAs and active state.
const warmStepTone = {
  bubbleClassName: "border-border bg-surface-muted border",
  numberClassName: "text-foreground",
} as const;

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
  // Card titles come from the same catalog the in-app flow reads, and the
  // cards themselves are driven by `enrollmentStepDefinitions` — so the
  // marketing promise can never drift from the application members meet.
  const tStepTitles = useTranslations("enrollment.steps");

  return (
    <motion.section
      className="bg-background relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <HomeSectionBackdrop />

      <div
        className={cn(
          sharedStyles.sectionContainer,
          "relative py-10 sm:py-12 lg:py-14",
        )}
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

        {/* Creating an account is a PREREQUISITE, not a step of the
            application — keeping it out of the cards is what makes the card
            count equal the real step count. */}
        <motion.div
          className="border-border bg-surface-muted mx-auto mt-8 max-w-3xl rounded-2xl border px-4 py-3.5 text-left sm:px-5"
          variants={fadeInUpItem}
        >
          <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.2em] uppercase">
            {t("prerequisite.label")}
          </p>
          <p className="text-muted-foreground mt-1.5 text-sm leading-6">
            {t("prerequisite.description")}
          </p>
        </motion.div>

        <motion.div
          className={cn(
            "mt-11 grid gap-x-4 gap-y-9 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-5",
            // Five cards over an even column count leaves a lone card on the
            // last row; at `md` (2 cols) center that orphan at half width so
            // it does not read as a broken grid. `lg` (3 cols) ends 3 + 2 and
            // `xl` (5 cols) is a single row, so both reset it.
            "md:[&>*:last-child]:col-span-2 md:[&>*:last-child]:mx-auto md:[&>*:last-child]:w-[calc(50%-0.5rem)]",
            "lg:[&>*:last-child]:col-span-1 lg:[&>*:last-child]:w-auto",
          )}
          variants={fadeInUpContainer}
        >
          {enrollmentStepDefinitions.map((definition) => (
            <HomeEnrollmentStepCard
              key={definition.step}
              step={String(definition.step)}
              title={tStepTitles(`${definition.step}.title`)}
              description={t(`steps.${definition.step}.description`)}
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
