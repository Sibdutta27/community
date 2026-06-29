"use client";

import { motion } from "framer-motion";

import { fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

export type HomeEnrollmentStepTone = Readonly<{
  bubbleClassName: string;
  numberClassName: string;
}>;

export type HomeEnrollmentStepCardProps = Readonly<{
  step: string;
  title: string;
  description: string;
  tone: HomeEnrollmentStepTone;
}>;

export function HomeEnrollmentStepCard({
  step,
  title,
  description,
  tone,
}: HomeEnrollmentStepCardProps) {
  return (
    <motion.article
      className="relative rounded-[24px] border border-black/10 bg-white px-4.5 pt-[2.7rem] pb-5.5 text-center shadow-[0_18px_42px_-34px_rgba(16,24,40,0.24)] sm:px-5 sm:pt-12 sm:pb-6"
      variants={fadeInUpItem}
    >
      <div
        className={cn(
          "absolute top-0 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_18px_32px_-20px_rgba(0,0,0,0.28)] sm:size-[5.7rem]",
          tone.bubbleClassName,
        )}
      >
        <div className="text-center">
          <div
            className={cn(
              montserrat.className,
              "text-[1.75rem] leading-none font-medium sm:text-[2rem]",
              tone.numberClassName,
            )}
          >
            {step}
          </div>
          <div
            className={cn(
              poppins.className,
              "mt-1 text-[0.78rem] leading-none font-semibold sm:text-[0.86rem]",
              tone.numberClassName,
            )}
          >
            Step
          </div>
        </div>
      </div>

      <div className="min-h-13 sm:min-h-16">
        <h3
          className={cn(
            montserrat.className,
            "text-[1.08rem] leading-tight font-semibold tracking-[-0.04em] text-[#2D5F9F] sm:text-[1.22rem]",
          )}
        >
          {title}
        </h3>
      </div>
      <p
        className={cn(
          poppins.className,
          "mt-1.5 text-[0.86rem] leading-[1.5] text-[#4E4B47] sm:mt-2 sm:text-[0.92rem]",
        )}
      >
        {description}
      </p>
    </motion.article>
  );
}
