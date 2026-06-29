"use client";

import { motion } from "framer-motion";

import { PageHeroSection } from "@/components/shared/page-hero-section";
import { fadeInUpItem } from "@/lib/motion";

import homeSharedStyles from "@/features/home/styles/home-shared.module.scss";

export function EnrollmentHero() {
  return (
    <PageHeroSection containerClassName={homeSharedStyles.sectionContainer}>
      <motion.h1
        className="mt-4 max-w-4xl text-[clamp(1.7rem,4.1vw,3.5rem)] leading-[0.98] font-semibold tracking-[-0.055em] text-[#0E3E36] sm:mt-5 lg:mt-6"
        variants={fadeInUpItem}
      >
        Begin Your Journey to Official Taíno Nation Membership
      </motion.h1>

      <motion.p
        className="mt-4 max-w-3xl text-[0.95rem] leading-[1.6] text-[#2A2927] sm:mt-5 sm:text-[1rem]"
        variants={fadeInUpItem}
      >
        Learn how enrollment works, what documents you will need, and the key
        questions members ask before starting their application.
      </motion.p>
    </PageHeroSection>
  );
}
