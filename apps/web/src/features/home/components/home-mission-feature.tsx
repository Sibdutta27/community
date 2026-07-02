"use client";

import { motion } from "framer-motion";
import { CircleCheckBig } from "lucide-react";

import { fadeInUpItem } from "@/lib/motion";

type HomeMissionFeatureProps = {
  label: string;
};

export function HomeMissionFeature({ label }: HomeMissionFeatureProps) {
  return (
    <motion.div
      className="border-border bg-surface text-foreground flex items-center gap-3 rounded-2xl border px-5 py-5 shadow-[0_14px_28px_-24px_rgba(0,0,0,0.2)] sm:px-6 sm:py-6"
      variants={fadeInUpItem}
    >
      <div className="bg-foreground text-background flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11">
        <CircleCheckBig className="size-5 sm:size-5.5" />
      </div>
      <span className="text-foreground text-base font-semibold tracking-[-0.01em] sm:text-lg">
        {label}
      </span>
    </motion.div>
  );
}
