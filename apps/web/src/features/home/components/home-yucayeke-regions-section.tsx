"use client";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

import { HomeGuainiaMapSection } from "@/features/home/components/home-guainia-map-section";
import { HomeYucayekeOverviewSection } from "@/features/home/components/home-yucayeke-overview-section";

import sharedStyles from "../styles/home-shared.module.scss";

export function HomeYucayekeRegionsSection() {
  return (
    <motion.section
      className="overflow-hidden bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-12 sm:py-14 lg:py-16")}
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.span
            className={cn(
              sharedStyles.sectionBadge,
              poppins.className,
              "bg-[#DDF4EF] px-4.5 py-1.5 text-[0.8rem] tracking-[-0.02em] text-[#1B5B4F] shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]",
            )}
            variants={fadeInUpItem}
          >
            Yucayeke Regions
          </motion.span>

          <motion.h2
            className={cn(
              montserrat.className,
              "mt-5 text-[clamp(1.65rem,2.8vw,2.7rem)] leading-[1.1] font-semibold tracking-[-0.04em] text-[#103F36]",
            )}
            variants={fadeInUpItem}
          >
            Connect to Your <span className="text-primary">Ancestral</span> Land
          </motion.h2>

          <motion.p
            className={cn(
              poppins.className,
              "mx-auto mt-3.5 max-w-3xl text-[0.9rem] leading-6 tracking-[-0.02em] text-[#2A2927] sm:text-[0.94rem] sm:leading-7 lg:text-[0.96rem] lg:leading-7",
            )}
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
