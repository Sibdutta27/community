"use client";

import Image from "next/image";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "@/features/home/styles/home-shared.module.scss";

const storyStats = [
  { label: "Enrolled Members", value: "2,847" },
  { label: "Yucayeke Connections", value: "8 Regions" },
  { label: "Secure Community Access", value: "24/7" },
] as const;

export function AboutStorySection() {
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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:items-center">
          <motion.div variants={fadeInUpItem}>
            <h2 className="text-foreground max-w-3xl text-[clamp(1.6rem,3.1vw,2.8rem)] leading-[1.06] font-semibold tracking-[-0.05em]">
              Built to Protect Heritage, Identity, and Community Connection
            </h2>

            <div className="text-muted-foreground mt-4 space-y-4 text-[0.92rem] leading-[1.65] sm:text-[0.97rem]">
              <p>
                The Taíno Nation Digital Platform was created to give
                descendants a respectful way to document lineage, reconnect with
                ancestral heritage, and participate in a living Indigenous
                community.
              </p>
              <p>
                It is more than a records system. It is a sovereign digital home
                where identity, family history, and community participation are
                centered around Taíno values rather than generic administrative
                tools.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {storyStats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-border bg-surface shadow-card-soft rounded-2xl border p-4"
                >
                  <p className="text-foreground text-[1.2rem] font-semibold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[0.8rem] leading-[1.45]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-surface-muted shadow-card relative min-h-[18rem] overflow-hidden rounded-2xl sm:min-h-[24rem] lg:min-h-[30rem]"
            variants={fadeInUpItem}
          >
            <Image
              alt="Taíno landscape"
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              src="/images/taino-nature.svg"
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
