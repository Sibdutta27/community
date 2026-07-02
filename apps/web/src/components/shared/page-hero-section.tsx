"use client";

import type { ReactNode } from "react";

import { motion } from "framer-motion";

import { fadeInUpContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

type PageHeroSectionProps = Readonly<{
  backgroundClassName?: string;
  children: ReactNode;
  containerClassName: string;
}>;

const defaultBackgroundClassName =
  "bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.03),transparent_40%)]";

export function PageHeroSection({
  backgroundClassName = defaultBackgroundClassName,
  children,
  containerClassName,
}: PageHeroSectionProps) {
  return (
    <motion.section
      className="bg-background relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={fadeInUpContainer}
    >
      <div className={cn("absolute inset-0", backgroundClassName)} />

      <div
        className={cn(
          containerClassName,
          "relative pt-20 pb-14 sm:pt-24 sm:pb-16 lg:pt-28 lg:pb-20",
        )}
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {children}
        </div>
      </div>
    </motion.section>
  );
}
