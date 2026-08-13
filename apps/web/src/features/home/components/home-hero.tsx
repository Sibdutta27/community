"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeroSection } from "@/components/shared/page-hero-section";
import { Button } from "@/components/ui/button";
import { fadeInScaleItem, fadeInUpContainer, fadeInUpItem } from "@/lib/motion";

import { SpinningIdCard } from "./spinning-id-card";
import sharedStyles from "../styles/home-shared.module.scss";

// Slot keys, not paths. The images themselves come from the reserved `media`
// namespace, so an editor can swap a portrait without a deploy.
const memberAvatarSlots = [
  "home.hero.portrait.1",
  "home.hero.portrait.2",
  "home.hero.portrait.3",
] as const;

/**
 * Two columns, off a symmetric split: the copy holds the reading measure and
 * the card sits beside it as an object rather than an illustration. Below
 * `lg` the same two things stack — copy, then the card — inside the one hero
 * frame, and the card keeps its drift and its drag.
 */
const heroLayoutClassName =
  "grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14 xl:gap-20";

export function HomeHero() {
  const t = useTranslations("home.hero");
  const media = useTranslations("media");

  return (
    <PageHeroSection
      backgroundClassName={sharedStyles.heroBackdrop}
      containerClassName={sharedStyles.sectionContainer}
      innerClassName={heroLayoutClassName}
    >
      <div className="flex flex-col items-start text-left">
        <motion.h1
          className="text-foreground max-w-2xl text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.04em]"
          variants={fadeInUpItem}
        >
          {t.rich("title", {
            highlight: (chunks) => (
              <span className={sharedStyles.gradientText}>{chunks}</span>
            ),
          })}
        </motion.h1>

        <motion.p
          className="text-muted-foreground mt-5 max-w-xl text-sm leading-6 sm:text-base"
          variants={fadeInUpItem}
        >
          {t("subtitle")}
        </motion.p>

        {/* `flex-col-reverse` is doing real work: the DOM order puts the quiet
            CTA first so it sits on the LEFT of the desktop row, but stacked on
            a phone that would push the primary action below the secondary.
            Reversing the column restores primary-first there without changing
            the row. */}
        <motion.div
          className="mt-7 flex flex-col-reverse items-start gap-1.5 sm:flex-row sm:items-center sm:gap-2.5"
          variants={fadeInUpItem}
        >
          {/* Stacked at the bottom on narrow screens, the ghost's own padding
              would indent its label past the column edge every other line of
              copy sits on. Pulled back by exactly that padding, and only while
              stacked. */}
          <Button asChild className="-ml-6 sm:ml-0" size="lg" variant="ghost">
            <Link href="/community">{t("ctaExplore")}</Link>
          </Button>
          <Button asChild size="lg" variant="emphasis">
            <Link href="/dashboard">
              <span>{t("ctaEnroll")}</span>
              <ArrowRight />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
          variants={fadeInUpItem}
        >
          <motion.div
            className="flex items-center -space-x-3"
            variants={fadeInUpContainer}
          >
            {memberAvatarSlots.map((slotKey, index) => (
              <motion.div
                key={slotKey}
                className="border-surface bg-surface overflow-hidden rounded-full border-2"
                variants={fadeInScaleItem}
              >
                <Image
                  alt={t("memberAvatarAlt", { index: index + 1 })}
                  className="h-10 w-10 object-cover"
                  height={40}
                  priority={false}
                  src={media(slotKey)}
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
      </div>

      <motion.div
        className="flex w-full justify-center lg:justify-end"
        variants={fadeInScaleItem}
      >
        <SpinningIdCard />
      </motion.div>
    </PageHeroSection>
  );
}
