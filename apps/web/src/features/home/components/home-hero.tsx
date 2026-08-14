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
 * Three blocks, laid out two different ways.
 *
 * On a phone they run in DOM order — heading, card, actions — so the card is
 * the thing you meet right after the pitch, and the buttons sit under it where
 * a thumb already is.
 *
 * At `lg` the copy takes a two-row column on the left and the card spans both
 * rows on the right, off a symmetric split, sitting beside the copy as an
 * object rather than an illustration. Explicit row/column placement is what
 * lets one DOM order serve both: no duplicated markup, and the card stays a
 * single instance so its spin is never torn down and restarted at a
 * breakpoint.
 */
const heroLayoutClassName =
  "grid w-full grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-14 lg:gap-y-8 xl:gap-x-20";

export function HomeHero() {
  const t = useTranslations("home.hero");
  const media = useTranslations("media");

  return (
    <PageHeroSection
      backgroundClassName={sharedStyles.heroBackdrop}
      containerClassName={sharedStyles.sectionContainer}
      innerClassName={heroLayoutClassName}
    >
      {/* Block 1 — the pitch. Centred while the hero is one stacked column,
          left-aligned only once the card moves alongside it at `lg`: a
          left-aligned column of text above a centred card reads as a mistake
          on a phone. */}
      <div className="flex flex-col items-center text-center lg:col-start-1 lg:row-start-1 lg:items-start lg:text-left">
        <motion.h1
          className="text-foreground max-w-2xl text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance"
          variants={fadeInUpItem}
        >
          {t.rich("title", {
            highlight: (chunks) => (
              <span className={sharedStyles.gradientText}>{chunks}</span>
            ),
          })}
        </motion.h1>

        <motion.p
          className="text-muted-foreground mt-5 max-w-lg text-[0.95rem] leading-7 text-pretty sm:text-base"
          variants={fadeInUpItem}
        >
          {t("subtitle")}
        </motion.p>
      </div>

      {/* Block 2 — the card. Second on a phone, right-hand column at `lg`,
          where it spans both copy rows and centres against them. */}
      <motion.div
        className="flex w-full justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full lg:items-center lg:justify-end"
        variants={fadeInScaleItem}
      >
        <SpinningIdCard />
      </motion.div>

      {/* Block 3 — the actions, under the card on a phone so they land where a
          thumb already is, and under the copy at `lg`. */}
      <div className="flex flex-col items-center text-center lg:col-start-1 lg:row-start-2 lg:items-start lg:text-left">
        {/* `flex-col-reverse` is doing real work: the DOM order puts the quiet
            CTA first so it sits on the LEFT of the desktop row, but stacked on
            a phone that would push the primary action below the secondary.
            Reversing the column restores primary-first there without changing
            the row. */}
        <motion.div
          className="flex flex-col-reverse items-center gap-2 sm:flex-row sm:gap-3"
          variants={fadeInUpItem}
        >
          {/* Leftmost in the desktop row, the ghost's own padding would indent
              its label past the column edge every other line of copy sits on.
              Pulled back by exactly that padding — and only there, since
              everything below `lg` is centred and has no edge to meet. */}
          <Button asChild className="lg:-ml-6" size="lg" variant="ghost">
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
          className="mt-7 flex flex-col items-center gap-3 sm:flex-row"
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
    </PageHeroSection>
  );
}
