"use client";

import { motion } from "framer-motion";

import { HomeHeritageCard } from "@/features/home/components/home-heritage-card";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

import sharedStyles from "@/features/home/styles/home-shared.module.scss";

const values = [
  {
    iconSrc: "/icons/home/heritage/sovereignty-first.svg",
    title: "Sovereign Data",
    description:
      "Community information is treated with care, privacy, and Indigenous sovereignty at the center of the platform’s design.",
    tone: "mint" as const,
  },
  {
    iconSrc: "/icons/home/heritage/cultural-identity.svg",
    title: "Identity & Lineage",
    description:
      "Members can preserve maternal lineage, strengthen cultural identity, and maintain records that honor family history.",
    tone: "cream" as const,
  },
  {
    iconSrc: "/icons/home/heritage/community-hub.svg",
    title: "Community Access",
    description:
      "The platform connects descendants to services, resources, regional belonging, and opportunities to participate in community life.",
    tone: "lilac" as const,
  },
] as const;

export function AboutValuesSection() {
  return (
    <motion.section
      className="overflow-hidden bg-[#FFFDEC]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.span
            className={cn(
              sharedStyles.sectionBadge,
              poppins.className,
              "bg-[#D7EFD3] px-5 py-2 text-[0.82rem] tracking-[-0.02em] text-[#1B5B4F]",
            )}
            variants={fadeInUpItem}
          >
            What Guides Us
          </motion.span>

          <motion.h2
            className={cn(
              montserrat.className,
              "mx-auto mt-5 max-w-4xl text-[clamp(1.6rem,3.2vw,2.8rem)] leading-[1.06] font-semibold tracking-[-0.05em] text-[#103F36]",
            )}
            variants={fadeInUpItem}
          >
            Principles Behind the Platform
          </motion.h2>

          <motion.p
            className={cn(
              poppins.className,
              "mx-auto mt-4 max-w-4xl text-[clamp(0.9rem,1.15vw,1rem)] leading-[1.5] tracking-[-0.02em] text-[#2A2927]",
            )}
            variants={fadeInUpItem}
          >
            Every feature is shaped around cultural respect, secure stewardship,
            and meaningful connection for Taíno descendants.
          </motion.p>
        </div>

        <motion.div
          className="mt-8 grid gap-4 lg:grid-cols-3"
          variants={fadeInUpContainer}
        >
          {values.map((value) => (
            <HomeHeritageCard key={value.title} {...value} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
