"use client";

import { motion } from "framer-motion";

import { HomeMissionFeature } from "@/features/home/components/home-mission-feature";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "@/features/home/styles/home-shared.module.scss";

const missionItems = [
  "Honor Ancestors Through Technology",
  "Protect Community Privacy",
  "Support Enrollment and Participation",
] as const;

export function AboutMissionSection() {
  return (
    <motion.section
      className="bg-surface overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        <motion.article
          className="bg-foreground text-background shadow-card relative overflow-hidden rounded-2xl px-5 py-8 sm:px-7 lg:px-9 lg:py-10"
          variants={fadeInUpItem}
        >
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
            <div className="max-w-[40rem]">
              <h2 className="text-[clamp(1.55rem,3vw,2.5rem)] leading-[1.06] font-semibold tracking-[-0.05em]">
                Our Mission
              </h2>

              <p className="text-background/80 mt-4 text-[0.9rem] leading-[1.65] sm:text-[0.96rem]">
                We aim to create a secure, culturally grounded digital platform
                that empowers Taíno descendants to preserve lineage, reclaim
                heritage, and participate in a thriving community. The goal is
                not only access, but continuity across generations.
              </p>
            </div>

            <div className="grid gap-3">
              {missionItems.map((item) => (
                <HomeMissionFeature key={item} label={item} />
              ))}
            </div>
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}
