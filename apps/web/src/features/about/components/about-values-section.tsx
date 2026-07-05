"use client";

import Image from "next/image";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { SurfaceCard } from "@/components/shared/surface-card";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "@/features/home/styles/home-shared.module.scss";

const values = [
  {
    id: "sovereignData",
    iconSrc: "/icons/home/heritage/sovereignty-first.svg",
  },
  {
    id: "identityLineage",
    iconSrc: "/icons/home/heritage/cultural-identity.svg",
  },
  {
    id: "communityAccess",
    iconSrc: "/icons/home/heritage/community-hub.svg",
  },
] as const;

export function AboutValuesSection() {
  const t = useTranslations("about.values");

  return (
    <motion.section
      className="bg-background overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.span
            className="border-border bg-surface-muted text-foreground inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold tracking-tight sm:px-5 sm:text-sm"
            variants={fadeInUpItem}
          >
            {t("badge")}
          </motion.span>

          <motion.h2
            className="text-foreground mx-auto mt-5 max-w-4xl text-[clamp(1.6rem,3.2vw,2.8rem)] leading-[1.06] font-semibold tracking-[-0.05em]"
            variants={fadeInUpItem}
          >
            {t("title")}
          </motion.h2>

          <motion.p
            className="text-muted-foreground mx-auto mt-4 max-w-4xl text-[clamp(0.9rem,1.15vw,1rem)] leading-[1.5]"
            variants={fadeInUpItem}
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <motion.div
          className="mt-8 grid gap-4 lg:grid-cols-3"
          variants={fadeInUpContainer}
        >
          {values.map((value) => (
            <motion.div
              className="h-full"
              key={value.id}
              variants={fadeInUpItem}
            >
              <SurfaceCard as="article" className="flex h-full flex-col">
                {/* The heritage icons are self-contained ink tiles with white
                    glyphs — clip them to the shared inner-tile radius. */}
                <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl">
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-contain"
                    height={48}
                    src={value.iconSrc}
                    width={48}
                  />
                </div>

                <h3 className="text-foreground mt-4 text-[1.15rem] leading-tight font-semibold tracking-tight sm:text-[1.25rem]">
                  {t(`cards.${value.id}.title`)}
                </h3>

                <p className="text-muted-foreground mt-2 text-sm leading-6 sm:text-[15px]">
                  {t(`cards.${value.id}.description`)}
                </p>
              </SurfaceCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
