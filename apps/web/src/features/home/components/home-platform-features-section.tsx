"use client";

import { motion } from "framer-motion";

import { HomePlatformFeatureCard } from "@/features/home/components/home-platform-feature-card";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/home-shared.module.scss";

const platformFeatureIcons = {
  identification: "/icons/home/platform-features/id-card.svg",
  lineage: "/icons/home/platform-features/family-tree.svg",
  documents: "/icons/home/platform-features/document-vault.svg",
} as const;

const platformFeatures = [
  {
    iconType: "identification",
    text: "Receive your official Taíno Nation identification card with a unique member number, photo, and verification details.",
  },
  {
    iconType: "lineage",
    text: "Document and visualize your maternal lineage with an interactive family tree showing your ancestral connections.",
  },
  {
    iconType: "documents",
    text: "Store and access your enrollment documents, certificates, and lineage records securely in your personal vault.",
  },
  {
    iconType: "identification",
    text: "Stay informed with announcements, news, and important updates from tribal leadership and community organizers.",
  },
  {
    iconType: "lineage",
    text: "Discover and register for cultural ceremonies, educational workshops, regional gatherings, and community celebrations.",
  },
  {
    iconType: "documents",
    text: "Access health services, legal assistance, educational resources, and community support programs exclusively for members.",
  },
  {
    iconType: "identification",
    text: "Connect with other members from your assigned Yucayeke region and participate in regional community activities.",
  },
  {
    iconType: "lineage",
    text: "Download our iOS and Android apps to access your profile, documents, and community features on the go.",
  },
  {
    iconType: "documents",
    text: "Access educational resources, language lessons, historical archives, and cultural preservation materials.",
  },
] as const;

export function HomePlatformFeaturesSection() {
  return (
    <motion.section
      className="overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(197,49,51,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(111,175,196,0.12),transparent_30%),linear-gradient(180deg,#2d2018_0%,#1f1712_100%)] text-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.span
            className={cn(
              sharedStyles.sectionBadge,
              "border border-white/16 bg-white/6 px-4.5 py-2 text-[0.82rem] text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
            )}
            variants={fadeInUpItem}
          >
            Platform Features
          </motion.span>

          <motion.h2
            className="mt-6 text-[clamp(1.7rem,3.2vw,3rem)] font-semibold tracking-[-0.05em] lg:leading-[1.08]"
            variants={fadeInUpItem}
          >
            Everything You Need in One Place
          </motion.h2>

          <motion.p
            className="mx-auto mt-4 max-w-4xl text-[clamp(0.9rem,1.15vw,1rem)] leading-[1.5] text-white/90"
            variants={fadeInUpItem}
          >
            Our comprehensive platform provides all the tools and resources you
            need to connect with your heritage, access services, and participate
            in community life.
          </motion.p>
        </div>

        <motion.div
          className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3"
          variants={fadeInUpContainer}
        >
          {platformFeatures.map((feature) => (
            <HomePlatformFeatureCard
              key={feature.text}
              iconSrc={platformFeatureIcons[feature.iconType]}
              text={feature.text}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
