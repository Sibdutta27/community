"use client";

import { motion } from "framer-motion";

import { PageHeroSection } from "@/components/shared/page-hero-section";
import { fadeInUpItem } from "@/lib/motion";

type DashboardHeroSectionProps = Readonly<{
  title: {
    prefix: string;
    highlight: string;
    suffix: string;
  };
  description: string;
}>;

export function DashboardHeroSection({
  title,
  description,
}: DashboardHeroSectionProps) {
  return (
    <PageHeroSection containerClassName="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.h1
        className="text-foreground mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:mt-5 sm:text-5xl lg:mt-6 lg:text-6xl"
        variants={fadeInUpItem}
      >
        {title.prefix} <span className="text-primary">{title.highlight}</span>{" "}
        {title.suffix}
      </motion.h1>

      <motion.p
        className="text-muted-foreground mt-6 max-w-3xl text-base leading-7 sm:text-lg"
        variants={fadeInUpItem}
      >
        {description}
      </motion.p>
    </PageHeroSection>
  );
}
