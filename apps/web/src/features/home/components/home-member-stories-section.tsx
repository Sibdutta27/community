"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { fadeInScaleItem, fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/home-shared.module.scss";

// Member names are proper nouns and stay untranslated; the quotes live in the
// message catalogs under `home.stories.members.*`.
const memberStories = [
  { id: "isabela", name: "Isabela Rivera", imageSrc: "/images/member1.png" },
  { id: "daniel", name: "Daniel Morales", imageSrc: "/images/member2.png" },
  { id: "mariana", name: "Mariana Santos", imageSrc: "/images/member3.png" },
] as const;

export function HomeMemberStoriesSection() {
  const t = useTranslations("home.stories");
  const [activeStoryIndex, setActiveStoryIndex] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const activeStory = memberStories[activeStoryIndex];

  // Auto-advance pauses permanently once the visitor picks a story, and
  // never runs for reduced-motion users (WCAG 2.2.2).
  useEffect(() => {
    if (!isAutoPlaying || prefersReducedMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveStoryIndex((currentIndex) =>
        currentIndex === memberStories.length - 1 ? 0 : currentIndex + 1,
      );
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [isAutoPlaying, prefersReducedMotion]);

  return (
    <motion.section
      className="bg-surface overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.p
            className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase"
            variants={fadeInUpItem}
          >
            {t("label")}
          </motion.p>

          <motion.h2
            className="text-foreground mx-auto mt-3 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
            variants={fadeInUpItem}
          >
            {t("title")}
          </motion.h2>

          <motion.p
            className="text-muted-foreground mx-auto mt-4 max-w-4xl text-sm leading-6 sm:text-base"
            variants={fadeInUpItem}
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <motion.div
          className="mx-auto mt-8 max-w-4xl text-center"
          variants={fadeInUpContainer}
        >
          <motion.div
            className="mx-auto flex h-12 w-12 items-center justify-center"
            variants={fadeInScaleItem}
          >
            <Image
              alt=""
              aria-hidden="true"
              className="h-11 w-11 object-contain opacity-85"
              height={44}
              src="/icons/quotation.svg"
              width={44}
            />
          </motion.div>

          <motion.blockquote
            className="text-foreground mx-auto mt-4.5 max-w-3xl text-base leading-7 sm:text-lg"
            variants={fadeInUpItem}
          >
            {t(`members.${activeStory.id}`)}
          </motion.blockquote>

          <motion.p
            className="text-foreground mt-4.5 text-[1.15rem] leading-none font-semibold tracking-tight"
            variants={fadeInUpItem}
          >
            {activeStory.name}
          </motion.p>

          <motion.div
            className="mt-4.5 flex justify-center"
            variants={fadeInScaleItem}
          >
            <div className="shadow-card-soft overflow-hidden rounded-full">
              <Image
                alt={t("portraitAlt", { name: activeStory.name })}
                className="h-14 w-14 object-cover sm:h-16 sm:w-16"
                height={64}
                src={activeStory.imageSrc}
                width={64}
              />
            </div>
          </motion.div>

          <motion.div
            className="mt-3 flex items-center justify-center gap-1"
            variants={fadeInUpItem}
          >
            {memberStories.map((story, index) => {
              const isActive = index === activeStoryIndex;

              return (
                <button
                  key={story.id}
                  aria-label={t("showStory", { name: story.name })}
                  aria-pressed={isActive}
                  className="group focus-visible:ring-ring focus-visible:ring-offset-background flex h-10 w-10 cursor-pointer items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  type="button"
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setActiveStoryIndex(index);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "rounded-full transition-all duration-200",
                      isActive
                        ? "bg-primary h-3 w-3"
                        : "bg-border group-hover:bg-muted-foreground/50 h-2.5 w-2.5",
                    )}
                  />
                </button>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
