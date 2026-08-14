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
 * On a phone they run in DOM order — heading, actions, card — so the pitch
 * runs straight into the buttons and the card follows as the thing you can
 * play with.
 *
 * At `lg` the copy takes a two-row column on the left and the card spans both
 * rows on the right, off a symmetric split, sitting beside the copy as an
 * object rather than an illustration. Explicit row/column placement is what
 * lets one DOM order serve both: no duplicated markup, and the card stays a
 * single instance so its spin is never torn down and restarted at a
 * breakpoint.
 */
const heroLayoutClassName =
  "grid w-full grid-cols-1 gap-y-7 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-10 lg:gap-y-8 xl:grid-cols-[minmax(0,38rem)_minmax(0,1fr)] xl:gap-x-12";

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

      {/* Block 2 — the actions, straight under the copy at every width. */}
      <div className="flex flex-col items-center text-center lg:col-start-1 lg:row-start-2 lg:items-start lg:text-left">
        {/* One row — quiet CTA left, flag-red right — at every width a phone
            actually is. Both shrink below `sm`, overriding the `size="lg"` cva
            values rather than replacing the size, so the desktop row is
            untouched: at `lg` proportions the pair needs ~405px and a 390px
            phone offers 362px of content box.

            `flex-wrap` is the safety valve, not the intent. Even shrunk the
            pair needs ~324px, which clears 360px and 375px phones but not a
            320px one — there it wraps to two rows rather than overflowing the
            viewport and clipping a button against the section's
            `overflow-hidden`. */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          variants={fadeInUpItem}
        >
          {/* Leftmost in the desktop row, the ghost's own padding would indent
              its label past the column edge every other line of copy sits on.
              Pulled back by exactly that padding — and only there, since
              everything below `lg` is centred and has no edge to meet. */}
          <Button
            asChild
            className="h-11 px-3 text-sm sm:h-12 sm:px-6 sm:text-base lg:-ml-6"
            size="lg"
            variant="ghost"
          >
            <Link href="/community">{t("ctaExplore")}</Link>
          </Button>
          <Button
            asChild
            className="h-11 px-3 text-sm sm:h-12 sm:px-6 sm:text-base [&_svg]:size-4 sm:[&_svg]:size-5"
            size="lg"
            variant="emphasis"
          >
            <Link href="/dashboard">
              <span>{t("ctaEnroll")}</span>
              <ArrowRight />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          className="mt-4 flex flex-col items-center gap-3 sm:flex-row lg:mt-7"
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

      {/* Block 3 — the card. Last on a phone, so the pitch runs straight into
          the buttons; at `lg` explicit placement lifts it into the right-hand
          column beside the copy, spanning both rows. DOM order is therefore
          the mobile order only. */}
      <motion.div
        className="flex w-full justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full lg:items-center lg:justify-start"
        variants={fadeInScaleItem}
      >
        <SpinningIdCard />
      </motion.div>
    </PageHeroSection>
  );
}
