"use client";

import { motion } from "framer-motion";

import { HomeMissionFeature } from "@/features/home/components/home-mission-feature";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

import sharedStyles from "@/features/home/styles/home-shared.module.scss";

const missionItems = [
  "Honor Ancestors Through Technology",
  "Protect Community Privacy",
  "Support Enrollment and Participation",
] as const;

export function AboutMissionSection() {
  return (
    <motion.section
      className="overflow-hidden bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        <motion.article
          className="relative overflow-hidden rounded-4xl border border-[#d9c7af] bg-[#2d2018] px-5 py-8 text-[#fff9f2] shadow-[0_24px_56px_-34px_rgba(21,17,13,0.4)] sm:px-7 lg:px-9 lg:py-10"
          variants={fadeInUpItem}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,49,51,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(111,175,196,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]"
          />

          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
            <div className="max-w-[40rem]">
              <h2
                className={cn(
                  montserrat.className,
                  "text-[clamp(1.55rem,3vw,2.5rem)] leading-[1.06] font-semibold tracking-[-0.05em]",
                )}
              >
                Our Mission
              </h2>

              <p
                className={cn(
                  poppins.className,
                  "mt-4 text-[0.9rem] leading-[1.65] text-[#f7efe5]/92 sm:text-[0.96rem]",
                )}
              >
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
