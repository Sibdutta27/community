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
      className="bg-foreground shadow-card rounded-2xl p-5 sm:p-6"
      variants={fadeInUpContainer}
    >
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <HomeEnrollmentNeedsSection items={items} />
        <HomeEnrollmentTipsCard tips={tips} />
      </div>
    </motion.div>
  );
}
