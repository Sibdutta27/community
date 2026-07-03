"use client";

import { motion } from "framer-motion";

import { PageHeroSection } from "@/components/shared/page-hero-section";
import { fadeInUpItem } from "@/lib/motion";

import homeSharedStyles from "@/features/home/styles/home-shared.module.scss";

export function AboutHero() {
  return (
    <PageHeroSection containerClassName={homeSharedStyles.sectionContainer}>
      <motion.h1
        className="text-foreground mt-4 max-w-4xl text-[clamp(1.7rem,4.1vw,3.5rem)] leading-[0.98] font-semibold tracking-[-0.055em] sm:mt-5 lg:mt-6"
        variants={fadeInUpItem}
      >
        About the Taíno Nation Digital Platform
      </motion.h1>

      <motion.p
        className="text-muted-foreground mt-5 max-w-3xl text-[0.95rem] leading-[1.6] sm:text-[1rem]"
        variants={fadeInUpItem}
      >
        A sovereign, community-centered platform designed to preserve lineage,
        strengthen cultural identity, and connect Taíno descendants through
        respectful technology.
      </motion.p>
    </PageHeroSection>
  );
}
