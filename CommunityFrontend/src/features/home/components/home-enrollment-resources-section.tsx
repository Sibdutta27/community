"use client";

import { motion } from "framer-motion";

import { fadeInUpContainer } from "@/lib/motion";

import { HomeEnrollmentNeedsSection } from "@/features/home/components/home-enrollment-needs-section";
import { HomeEnrollmentTipsCard } from "@/features/home/components/home-enrollment-tips-card";
import type { HomeEnrollmentNeedItemProps } from "@/features/home/components/home-enrollment-need-item";

type HomeEnrollmentResourcesSectionProps = Readonly<{
  items: ReadonlyArray<HomeEnrollmentNeedItemProps>;
  tips: ReadonlyArray<string>;
}>;

export function HomeEnrollmentResourcesSection({
  items,
  tips,
}: HomeEnrollmentResourcesSectionProps) {
  return (
    <motion.div
      className="rounded-[1.7rem] border border-[#d9c7af] bg-[#2d2018] bg-[radial-gradient(circle_at_top_right,rgba(197,49,51,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(111,175,196,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0)),#2d2018] p-3.5 shadow-[0_24px_56px_-34px_rgba(21,17,13,0.4)] sm:p-4"
      variants={fadeInUpContainer}
    >
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <HomeEnrollmentNeedsSection items={items} />
        <HomeEnrollmentTipsCard tips={tips} />
      </div>
    </motion.div>
  );
}
