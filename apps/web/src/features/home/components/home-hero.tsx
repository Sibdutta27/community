"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeroSection } from "@/components/shared/page-hero-section";
import { Button } from "@/components/ui/button";
import { fadeInScaleItem, fadeInUpContainer, fadeInUpItem } from "@/lib/motion";

import sharedStyles from "../styles/home-shared.module.scss";

const memberAvatarSrcs = [
  "/images/member1.png",
  "/images/member2.png",
  "/images/member3.png",
] as const;

export function HomeHero() {
  const t = useTranslations("home.hero");

  return (
    <PageHeroSection containerClassName={sharedStyles.sectionContainer}>
      <motion.h1
        className="text-foreground mt-3 max-w-4xl text-3xl font-semibold tracking-tight sm:mt-4 sm:text-4xl lg:mt-5 lg:text-5xl"
        variants={fadeInUpItem}
      >
        {t.rich("title", {
          highlight: (chunks) => (
            <span className={sharedStyles.gradientText}>{chunks}</span>
          ),
        })}
      </motion.h1>

      <motion.p
        className="text-muted-foreground mt-5 max-w-3xl text-sm leading-6 sm:text-base"
        variants={fadeInUpItem}
      >
        {t("subtitle")}
      </motion.p>

      <motion.div
        className="mt-7 flex flex-wrap items-center justify-center gap-3"
        variants={fadeInUpItem}
      >
        <Button asChild size="xl" variant="emphasis">
          <Link href="/dashboard">
            <span>{t("ctaEnroll")}</span>
            <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline" size="xl">
          <Link href="/community">{t("ctaExplore")}</Link>
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
          {memberAvatarSrcs.map((src, index) => (
            <motion.div
              key={src}
              className="border-surface bg-surface overflow-hidden rounded-full border-2"
              variants={fadeInScaleItem}
            >
              <Image
                alt={t("memberAvatarAlt", { index: index + 1 })}
                className="h-10 w-10 object-cover"
                height={40}
                priority={false}
                src={src}
                width={40}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-muted-foreground text-xs leading-5 sm:text-sm"
          variants={fadeInUpItem}
        >
          {/* TODO: verified count pending researcher */}
          {t.rich("tribalCitizens", {
            count: (chunks) => (
              <span className="text-foreground font-semibold">{chunks}</span>
            ),
          })}
        </motion.div>
      </motion.div>
    </PageHeroSection>
  );
}
