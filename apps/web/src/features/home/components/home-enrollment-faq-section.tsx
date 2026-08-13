"use client";

import { useState } from "react";
import Image from "next/image";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/home-shared.module.scss";

const faqItemIds = [
  "eligibility",
  "timeline",
  "security",
  "benefits",
  "fee",
] as const;

type FaqItemId = (typeof faqItemIds)[number];

export function HomeEnrollmentFaqSection() {
  const t = useTranslations("home.faq");
  const [openItemId, setOpenItemId] = useState<FaqItemId | null>("timeline");

  return (
    <motion.section
      id="enrollment-faq"
      className="bg-surface overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(
          sharedStyles.sectionContainer,
          "pt-2 pb-12 sm:pb-14 lg:pb-16",
        )}
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

        <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <motion.div
            className="border-border bg-surface-muted shadow-card-soft relative min-h-[15rem] overflow-hidden rounded-2xl border sm:min-h-[19rem] lg:min-h-[28rem]"
            variants={fadeInUpItem}
          >
            <Image
              alt={t("imageAlt")}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              src="/images/taino-nature.svg"
            />
          </motion.div>

          <motion.div className="space-y-3" variants={fadeInUpContainer}>
            {faqItemIds.map((itemId) => {
              const isOpen = itemId === openItemId;

              return (
                <motion.article
                  key={itemId}
                  className="border-border bg-background shadow-card-soft overflow-hidden rounded-2xl border"
                  variants={fadeInUpItem}
                >
                  <h3>
                    <button
                      aria-controls={`faq-panel-${itemId}`}
                      aria-expanded={isOpen}
                      className="focus-visible:ring-ring flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:px-4.5 sm:py-4.5 lg:px-5"
                      type="button"
                      onClick={() =>
                        setOpenItemId((currentId) =>
                          currentId === itemId ? null : itemId,
                        )
                      }
                    >
                      <span
                        className={cn(
                          "text-[0.95rem] leading-[1.3] font-semibold tracking-tight transition-colors sm:text-[1rem]",
                          isOpen ? "text-foreground" : "text-foreground/80",
                        )}
                      >
                        {t(`items.${itemId}.question`)}
                      </span>

                      <span
                        aria-hidden="true"
                        className="text-foreground min-w-5 text-center text-[1.15rem] leading-none font-semibold"
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                  </h3>

                  {isOpen ? (
                    <div
                      className="border-border border-t px-4 pt-3 pb-4 sm:px-4.5 sm:pb-4.5 lg:px-5 lg:pb-5"
                      id={`faq-panel-${itemId}`}
                    >
                      <p className="text-muted-foreground max-w-3xl text-[0.84rem] leading-[1.55] sm:text-[0.88rem]">
                        {t(`items.${itemId}.answer`)}
                      </p>
                    </div>
                  ) : null}
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
