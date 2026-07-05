"use client";

import Image from "next/image";

import { motion } from "framer-motion";

import { SurfaceCard } from "@/components/shared/surface-card";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "@/features/home/styles/home-shared.module.scss";

const values = [
  {
    iconSrc: "/icons/home/heritage/sovereignty-first.svg",
    title: "Sovereign Data",
    description:
      "Community information is treated with care, privacy, and Indigenous sovereignty at the center of the platform’s design.",
  },
  {
    iconSrc: "/icons/home/heritage/cultural-identity.svg",
    title: "Identity & Lineage",
    description:
      "Members can preserve maternal lineage, strengthen cultural identity, and maintain records that honor family history.",
  },
  {
    iconSrc: "/icons/home/heritage/community-hub.svg",
    title: "Community Access",
    description:
      "The platform connects descendants to services, resources, regional belonging, and opportunities to participate in community life.",
  },
] as const;

export function AboutValuesSection() {
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
        <div className="mx-auto max-w-5xl text-center">
          <motion.span
            className="border-border bg-surface-muted text-foreground inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold tracking-tight sm:px-5 sm:text-sm"
            variants={fadeInUpItem}
          >
            What Guides Us
          </motion.span>

          <motion.h2
            className="text-foreground mx-auto mt-5 max-w-4xl text-[clamp(1.6rem,3.2vw,2.8rem)] leading-[1.06] font-semibold tracking-[-0.05em]"
            variants={fadeInUpItem}
          >
            Principles Behind the Platform
          </motion.h2>

          <motion.p
            className="text-muted-foreground mx-auto mt-4 max-w-4xl text-[clamp(0.9rem,1.15vw,1rem)] leading-[1.5]"
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
            <motion.div
              className="h-full"
              key={value.title}
              variants={fadeInUpItem}
            >
              <SurfaceCard as="article" className="flex h-full flex-col">
                {/* The heritage icons are self-contained ink tiles with white
                    glyphs — clip them to the shared inner-tile radius. */}
                <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl">
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-contain"
                    height={48}
                    src={value.iconSrc}
                    width={48}
                  />
                </div>

                <h3 className="text-foreground mt-4 text-[1.15rem] leading-tight font-semibold tracking-tight sm:text-[1.25rem]">
                  {value.title}
                </h3>

                <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-[15px]">
                  {value.description}
                </p>
              </SurfaceCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
