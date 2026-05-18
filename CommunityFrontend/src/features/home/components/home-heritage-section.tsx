"use client";

import { motion } from "framer-motion";

import { HomeHeritageCard } from "@/features/home/components/home-heritage-card";
import { HomeMissionFeature } from "@/features/home/components/home-mission-feature";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/home-shared.module.scss";

const heritageCards = [
  {
    iconSrc: "/icons/home/heritage/sovereignty-first.svg",
    title: "Sovereign Data",
    description:
      "Your information belongs to the Taíno community. We maintain complete sovereignty over our data, ensuring it remains protected, private, and culturally respected.",
    tone: "mint",
  },
  {
    iconSrc: "/icons/home/heritage/cultural-identity.svg",
    title: "Cultural Identity",
    description:
      "Receive your official Tribal ID, trace your maternal lineage, and connect with your ancestral Yucayeke to strengthen your Indigenous identity.",
    tone: "cream",
  },
  {
    iconSrc: "/icons/home/heritage/community-hub.svg",
    title: "Community Help",
    description:
      "Access health services, legal assistance, cultural events, and community resources designed specifically for Taíno Nation members.",
    tone: "lilac",
  },
] as const;

const missionItems = [
  "Culturally Respectful Design",
  "Secure & Private",
  "Mobile & Web Access",
] as const;

export function HomeHeritageSection() {
  return (
    <motion.section
      className="overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.14 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(
          sharedStyles.sectionContainer,
          "relative pt-2 pb-16 lg:pt-4 lg:pb-20",
        )}
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.span
            className={cn(
              sharedStyles.sectionBadge,
              "bg-[#e8f8f3] px-5 py-2 text-[#2c7d6f]",
            )}
            variants={fadeInUpItem}
          >
            About Our Platform
          </motion.span>

          <motion.h2
            className="text-foreground mt-5 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
            variants={fadeInUpItem}
          >
            Preserving{" "}
            <span className={sharedStyles.gradientText}>Heritage</span> Through
            Technology
          </motion.h2>

          <motion.p
            className="text-muted-foreground mt-4 text-sm leading-6 sm:text-base"
            variants={fadeInUpItem}
          >
            The Taíno Nation Digital Platform is a sovereign, community-owned
            system designed to honor our ancestors, preserve our lineage, and
            strengthen our bonds as Indigenous descendants of Borikén.
          </motion.p>
        </div>

        <motion.div
          className="mt-10 grid gap-4 lg:grid-cols-3"
          variants={fadeInUpContainer}
        >
          {heritageCards.map((card) => (
            <HomeHeritageCard
              key={card.title}
              description={card.description}
              iconSrc={card.iconSrc}
              title={card.title}
              tone={card.tone}
            />
          ))}
        </motion.div>

        <motion.article
          className="relative mt-12 overflow-hidden rounded-4xl border border-[#d9c7af] bg-[#2d2018] px-5 py-8 text-[#fff9f2] shadow-[0_24px_56px_-34px_rgba(21,17,13,0.4)] sm:px-7 lg:px-9 lg:py-10"
          variants={fadeInUpItem}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,49,51,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(111,175,196,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]"
          />

          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
            <div className="max-w-105">
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Our Mission
              </h3>

              <p className="mt-5 text-justify text-sm leading-6 text-[#f7efe5]/92">
                To create a secure, culturally grounded digital platform that
                empowers Taíno descendants to reclaim their heritage, document
                their lineage, and participate in a thriving Indigenous
                community. We honor the wisdom of our ancestors while embracing
                modern technology to ensure our culture, traditions, and
                identity endure for generations to come.
              </p>
            </div>

            <div className="grid gap-4">
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
