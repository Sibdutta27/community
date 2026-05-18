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
      className="flex items-center gap-3 rounded-3xl border border-[#dcc7af] bg-[#f6ede1] px-5 py-5 text-[#201712] shadow-[0_14px_28px_-22px_rgba(0,0,0,0.28)] sm:px-6 sm:py-6"
      variants={fadeInUpItem}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#c53133] text-white shadow-[0_12px_24px_-18px_rgba(197,49,51,0.45)] sm:size-11">
        <CircleCheckBig className="size-5 sm:size-5.5" />
      </div>
      <span className="text-base font-semibold tracking-[-0.01em] text-[#201712] sm:text-lg">
        {label}
      </span>
    </motion.div>
  );
}
