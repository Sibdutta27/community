"use client";

import { motion } from "framer-motion";

import { PageHeroSection } from "@/components/shared/page-hero-section";
import { fadeInUpItem } from "@/lib/motion";

import sharedStyles from "../styles/community-shared.module.scss";

export function CommunityHero() {
  return (
    <PageHeroSection
      backgroundClassName="bg-[radial-gradient(circle_at_top,rgba(47,207,195,0.12),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(43,116,216,0.08),transparent_26%)]"
      containerClassName={sharedStyles.sectionContainer}
    >
      <motion.h1
        className="text-foreground mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:mt-5 sm:text-5xl lg:mt-6 lg:text-6xl"
        variants={fadeInUpItem}
      >
        Events & <span className={sharedStyles.gradientText}>Community</span>
      </motion.h1>

      <motion.p
        className="text-muted-foreground mt-6 max-w-3xl text-base leading-7 sm:text-lg"
        variants={fadeInUpItem}
      >
        Get the latest announcements, updates, and important information from
        Taíno Nation leadership and community organizers. Stay informed about
        events, services, and opportunities.
      </motion.p>
    </PageHeroSection>
  );
}
