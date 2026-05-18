"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { PageHeroSection } from "@/components/shared/page-hero-section";
import { Button } from "@/components/ui/button";
import { fadeInScaleItem, fadeInUpContainer, fadeInUpItem } from "@/lib/motion";

import sharedStyles from "../styles/home-shared.module.scss";

const memberAvatars = [
  { src: "/images/member1.png", alt: "Community member portrait 1" },
  { src: "/images/member2.png", alt: "Community member portrait 2" },
  { src: "/images/member3.png", alt: "Community member portrait 3" },
] as const;

export function HomeHero() {
  return (
    <PageHeroSection containerClassName={sharedStyles.sectionContainer}>
      <motion.h1
        className="text-foreground mt-3 max-w-4xl text-3xl font-semibold tracking-tight sm:mt-4 sm:text-4xl lg:mt-5 lg:text-5xl"
        variants={fadeInUpItem}
      >
        Welcome to the{" "}
        <span className={sharedStyles.gradientText}>Taíno Nation</span> Digital
        Platform
      </motion.h1>

      <motion.p
        className="text-muted-foreground mt-5 max-w-3xl text-sm leading-6 sm:text-base"
        variants={fadeInUpItem}
      >
        Reconnect with your ancestral roots, preserve your lineage, and join a
        sovereign community dedicated to honoring our Indigenous heritage and
        cultural identity.
      </motion.p>

      <motion.div
        className="mt-7 flex flex-wrap items-center justify-center gap-3"
        variants={fadeInUpItem}
      >
        <Button className="text-white!" asChild size="xl">
          <Link href="/dashboard">
            <span className="text-white">Start Your Enrollment</span>
            <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline" size="xl">
          <Link href="/community">Explore Community</Link>
        </Button>
      </motion.div>

      <motion.div
        className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        variants={fadeInUpItem}
      >
        <motion.div
          className="flex items-center -space-x-3"
          variants={fadeInUpContainer}
        >
          {memberAvatars.map((member) => (
            <motion.div
              key={member.src}
              className="border-surface bg-surface overflow-hidden rounded-full border-2"
              variants={fadeInScaleItem}
            >
              <Image
                alt={member.alt}
                className="h-10 w-10 object-cover"
                height={40}
                priority={false}
                src={member.src}
                width={40}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-muted-foreground text-xs leading-5 sm:text-sm"
          variants={fadeInUpItem}
        >
          <span className="text-foreground font-semibold">5M+</span> Yucayeke
          Member Joined
        </motion.div>
      </motion.div>
    </PageHeroSection>
  );
}
