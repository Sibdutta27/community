"use client";

import type { ReactNode } from "react";

import { motion } from "framer-motion";

import { fadeInUpContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

type PageHeroSectionProps = Readonly<{
  backgroundClassName?: string;
  children: ReactNode;
  containerClassName: string;
  innerClassName?: string;
}>;

// Decorative wash tinted with the ink `--foreground` token (via color-mix so
// no raw hex leaks in), matching the soft ink-tinted shadow convention —
// never a raw pure-black overlay.
const defaultBackgroundClassName =
  "bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--foreground)_4%,transparent),transparent_40%)]";

// A centred reading column, which is what every headline+paragraph hero wants.
// `innerClassName` replaces it wholesale for the one hero that is a layout
// rather than a column (home, which is two-column and left-aligned) — passing
// it through `cn` would leave `items-center`/`text-center` fighting the
// override, since tailwind-merge cannot tell those two apart.
const defaultInnerClassName =
  "mx-auto flex max-w-4xl flex-col items-center text-center";

export function PageHeroSection({
  backgroundClassName = defaultBackgroundClassName,
  children,
  containerClassName,
  innerClassName = defaultInnerClassName,
}: PageHeroSectionProps) {
  return (
    <motion.section
      className="bg-background relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={fadeInUpContainer}
    >
      <div
        aria-hidden="true"
        className={cn("absolute inset-0", backgroundClassName)}
      />

      <div
        className={cn(
          containerClassName,
          "relative pt-20 pb-14 sm:pt-24 sm:pb-16 lg:pt-28 lg:pb-20",
        )}
      >
        <div className={innerClassName}>{children}</div>
      </div>
    </motion.section>
  );
}
