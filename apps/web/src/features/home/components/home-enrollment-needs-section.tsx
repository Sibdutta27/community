"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { fadeInUpItem } from "@/lib/motion";

import {
  HomeEnrollmentNeedItem,
  type HomeEnrollmentNeedItemProps,
} from "@/features/home/components/home-enrollment-need-item";

type HomeEnrollmentNeedsSectionProps = Readonly<{
  items: ReadonlyArray<HomeEnrollmentNeedItemProps>;
}>;

export function HomeEnrollmentNeedsSection({
  items,
}: HomeEnrollmentNeedsSectionProps) {
  const t = useTranslations("home.process.needs");

  return (
    <motion.div
      className="flex h-full flex-col justify-center pr-0 lg:pr-4"
      variants={fadeInUpItem}
    >
      <h3 className="text-background text-xl font-semibold tracking-tight sm:text-2xl">
        {t("title")}
      </h3>

      <ul className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
        {items.map((item) => (
          <HomeEnrollmentNeedItem key={item.title} {...item} />
        ))}
      </ul>
    </motion.div>
  );
}
