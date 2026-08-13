"use client";

import Image from "next/image";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { HomeMemberServiceCard } from "@/features/home/components/home-member-service-card";

import sharedStyles from "../styles/home-shared.module.scss";

const memberServices = [
  {
    id: "health",
    iconSrc: "/icons/home/support/health-wellness.svg",
    toneClassName: "bg-foreground",
    href: "/services?category=health#popular-services",
    bulletKeys: [
      "cards.health.bullets.healing",
      "cards.health.bullets.mentalHealth",
      "cards.health.bullets.navigation",
      "cards.health.bullets.workshops",
    ],
  },
  {
    id: "legal",
    iconSrc: "/icons/home/support/legal-assistance.svg",
    toneClassName: "bg-foreground",
    href: "/services?category=legal#popular-services",
    bulletKeys: [
      "cards.legal.bullets.advocacy",
      "cards.legal.bullets.landClaims",
      "cards.legal.bullets.referrals",
      "cards.legal.bullets.documents",
    ],
  },
  {
    id: "education",
    iconSrc: "/icons/home/support/education-training.svg",
    toneClassName: "bg-foreground",
    href: "/services?category=education_training#popular-services",
    bulletKeys: [
      "cards.education.bullets.language",
      "cards.education.bullets.workshops",
      "cards.education.bullets.scholarships",
      "cards.education.bullets.vocational",
    ],
  },
  {
    id: "community",
    iconSrc: "/icons/home/support/community-support.svg",
    toneClassName: "bg-foreground",
    href: "/services?category=community_support#popular-services",
    bulletKeys: [
      "cards.community.bullets.emergency",
      "cards.community.bullets.housing",
      "cards.community.bullets.food",
      "cards.community.bullets.elders",
    ],
  },
] as const;

export function HomeMemberServicesSection() {
  const t = useTranslations("home.services");

  return (
    <motion.section
      className="bg-surface overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
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
          className="mt-10 grid gap-4 lg:grid-cols-2"
          variants={fadeInUpContainer}
        >
          {memberServices.map((service) => (
            <HomeMemberServiceCard
              key={service.id}
              title={t(`cards.${service.id}.title`)}
              description={t(`cards.${service.id}.description`)}
              buttonLabel={t(`cards.${service.id}.button`)}
              bullets={service.bulletKeys.map((bulletKey) => t(bulletKey))}
              href={service.href}
              iconSrc={service.iconSrc}
              toneClassName={service.toneClassName}
            />
          ))}
        </motion.div>

        <motion.article
          className="bg-foreground text-background shadow-card mt-10 rounded-2xl p-6 text-center sm:p-8 lg:p-10"
          variants={fadeInUpItem}
        >
          <div className="mx-auto max-w-3xl">
            <div className="border-background/20 bg-background/10 mx-auto flex h-11 w-11 items-center justify-center rounded-full border">
              <span
                aria-hidden="true"
                className="text-background/90 text-[1.4rem] leading-none"
              >
                i
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("help.title")}
            </h3>

            <p className="text-background/80 mx-auto mt-3 max-w-2xl text-sm leading-6 sm:text-base">
              {t("help.body")}
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                className="focus-visible:ring-ring border-background/80 text-background flex min-h-12 min-w-[15rem] cursor-pointer items-center justify-center gap-2.5 rounded-full border bg-transparent px-6 text-[0.92rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none"
                type="button"
              >
                <Image
                  alt=""
                  aria-hidden="true"
                  className="h-4.5 w-4.5 object-contain"
                  height={18}
                  src="/icons/home/support/email.svg"
                  width={18}
                />
                <span>{t("help.emailSupport")}</span>
              </button>
            </div>
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}
