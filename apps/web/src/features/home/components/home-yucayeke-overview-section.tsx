"use client";

import Image from "next/image";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";

import { HomeYucayekeRegionCard } from "@/features/home/components/home-yucayeke-region-card";

const regionCards = [
  {
    iconSrc: "/icons/home/regions/yucayeke-regions.svg",
    // TODO: 18 pending researcher verification
    title: "18 Historical Yucayeke Regions",
  },
  {
    iconSrc: "/icons/home/regions/yucayeke-connect.svg",
    title: "Connect with Regional Community Members",
  },
  {
    iconSrc: "/icons/home/regions/yucake-events-gathering.svg",
    title: "Access Regional Events & Gatherings",
  },
] as const;

export function HomeYucayekeOverviewSection() {
  return (
    <motion.article
      className="border-border bg-surface shadow-card mt-8 w-full rounded-2xl border p-5 sm:p-6"
      variants={fadeInUpItem}
    >
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
        <motion.div
          className="mx-auto w-full overflow-hidden rounded-xl lg:mx-0"
          variants={fadeInUpItem}
        >
          <div className="relative aspect-[1/0.9] w-full lg:max-h-[26rem]">
            <Image
              alt="Illustrated map of Boriken representing Yucayeke regions"
              className="object-cover"
              fill
              priority={false}
              sizes="(min-width: 1024px) 38vw, 92vw"
              src="/images/yucayeke-map.svg"
            />
          </div>
        </motion.div>

        <div className="lg:self-center">
          <motion.h3
            className="text-foreground text-center text-xl leading-tight font-semibold tracking-tight sm:text-2xl lg:text-left lg:text-[1.75rem]"
            variants={fadeInUpItem}
          >
            What is a Yucayeke?
          </motion.h3>

          <motion.div
            className="text-muted-foreground mt-3 space-y-2.5 text-[0.82rem] leading-5 sm:text-[0.86rem] sm:leading-6 lg:text-[0.9rem]"
            variants={fadeInUpItem}
          >
            <p>
              In Taíno culture, a Yucayeke was a village or settlement led by a
              cacique. These communities were organized around territories
              throughout Borikén, each with its own identity, traditions, and
              leadership.
            </p>

            <p>
              Today, we honor this tradition by assigning members to historical
              Yucayeke regions based on their maternal lineage and ancestral
              connections. This helps preserve our territorial heritage and
              strengthens bonds within regional communities.
            </p>
          </motion.div>

          <motion.div
            className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            variants={fadeInUpContainer}
          >
            {regionCards.map((card) => (
              <HomeYucayekeRegionCard key={card.title} {...card} />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}
