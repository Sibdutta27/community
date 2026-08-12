"use client";

import Image from "next/image";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";

export function HomeGuainiaMapSection() {
  const t = useTranslations("home.yucayeke");
  const media = useTranslations("media");

  return (
    <motion.section
      className="bg-background overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUpContainer}
    >
      <motion.div
        className="w-full pt-0 pb-12 sm:pb-14 lg:pb-16"
        variants={fadeInUpItem}
      >
        <Image
          alt={t("guainiaMapAlt")}
          className="h-auto w-full"
          height={871}
          priority={false}
          src={media("home.guainiaMap")}
          width={1808}
        />
      </motion.div>
    </motion.section>
  );
}
