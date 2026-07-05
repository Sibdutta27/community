"use client";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { HomeGuainiaMapSection } from "@/features/home/components/home-guainia-map-section";
import { HomeYucayekeOverviewSection } from "@/features/home/components/home-yucayeke-overview-section";

import sharedStyles from "../styles/home-shared.module.scss";

export function HomeYucayekeRegionsSection() {
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
            Yucayeke Regions
          </motion.p>

          <motion.h2
            className="text-foreground mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
            variants={fadeInUpItem}
          >
            Connect to Your Ancestral Land
          </motion.h2>

          <motion.p
            className="text-muted-foreground mx-auto mt-4 max-w-3xl text-sm leading-6 sm:text-base"
            variants={fadeInUpItem}
          >
            Each enrolled member is assigned to a Yucayeke, a traditional
            land-based community that connects you to your ancestral territory
            and fellow descendants from your region.
          </motion.p>
        </div>
        <HomeYucayekeOverviewSection />
      </div>
      <HomeGuainiaMapSection />
    </motion.section>
  );
}
