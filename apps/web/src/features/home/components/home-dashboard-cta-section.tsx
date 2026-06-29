"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

import sharedStyles from "../styles/home-shared.module.scss";

export function HomeDashboardCtaSection() {
  return (
    <motion.section
      className="overflow-hidden bg-white"
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
        <motion.article
          className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(197,49,51,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(111,175,196,0.16),transparent_38%),linear-gradient(180deg,#2d2018_0%,#1f1712_100%)] px-5 py-12 text-center text-white shadow-[0_28px_64px_-38px_rgba(27,18,13,0.42)] sm:px-8 sm:py-14 lg:px-12 lg:py-18"
          variants={fadeInUpItem}
        >
          <div className="mx-auto max-w-5xl">
            <h2
              className={cn(
                montserrat.className,
                "text-[clamp(1.45rem,2.85vw,2.45rem)] leading-[1.08] font-semibold tracking-[-0.05em]",
              )}
            >
              Join 2,847 Enrolled Members
            </h2>

            <p
              className={cn(
                poppins.className,
                "mx-auto mt-3.5 max-w-4xl text-[clamp(0.86rem,1.02vw,0.96rem)] leading-[1.5] text-white/95",
              )}
            >
              Become part of a growing community of Taíno descendants
              reconnecting with their heritage and building a stronger future
              together.
            </p>

            <div className="mt-9 flex justify-center">
              <Link
                className={cn(
                  montserrat.className,
                  "flex min-h-14 w-full max-w-[36rem] cursor-pointer items-center justify-center gap-3 rounded-full bg-white px-7 text-[0.9rem] font-semibold tracking-[-0.03em] text-[#125560] shadow-[0_18px_38px_-26px_rgba(7,39,47,0.35)] transition-transform duration-200 hover:-translate-y-0.5 sm:text-[0.94rem]",
                )}
                href="/dashboard"
              >
                <Image
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-5 object-contain"
                  height={20}
                  src="/icons/home/begin-application.svg"
                  width={20}
                />
                <span className="text-[#125560]">Begin Your Application</span>
              </Link>
            </div>
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}
