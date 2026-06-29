"use client";

import Image from "next/image";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

import { HomeYucayekeRegionCard } from "@/features/home/components/home-yucayeke-region-card";

const regionCards = [
  {
    iconSrc: "/icons/home/regions/yucayeke-regions.svg",
    title: "12 Historical Yucayeke Regions",
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
      className="mt-6 w-full rounded-[1.35rem] border border-[#DDD3AA] bg-[linear-gradient(180deg,#FFFDEE_0%,#FFF9E3_100%)] p-3 shadow-[0_22px_48px_-44px_rgba(70,61,28,0.22)] sm:p-3.5 lg:p-4"
      variants={fadeInUpItem}
    >
      <div className="grid gap-3.5 lg:grid-cols-2 lg:items-start lg:gap-5">
        <motion.div
          className="mx-auto w-full overflow-hidden rounded-[0.9rem] lg:mx-0"
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

        <div className="px-1 lg:self-center lg:px-2">
          <motion.h3
            className={cn(
              montserrat.className,
              "text-center text-[1.5rem] leading-[1.08] font-semibold tracking-tight text-[#1A5B56] sm:text-[1.75rem] lg:text-left lg:text-[1.95rem]",
            )}
            variants={fadeInUpItem}
          >
            What is a Yucayeke?
          </motion.h3>

          <motion.div
            className={cn(
              poppins.className,
              "mt-2.5 text-justify text-[0.82rem] leading-5 tracking-[-0.02em] text-[#3B3A34] sm:mt-3 sm:space-y-2.5 sm:text-[0.86rem] sm:leading-6 lg:text-[0.9rem] lg:leading-6",
            )}
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
            className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
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
