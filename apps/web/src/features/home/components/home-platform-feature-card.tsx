"use client";

import Image from "next/image";

import { motion } from "framer-motion";

import { fadeInUpItem } from "@/lib/motion";

type HomePlatformFeatureCardProps = {
  iconSrc: string;
  text: string;
};

export function HomePlatformFeatureCard({
  iconSrc,
  text,
}: HomePlatformFeatureCardProps) {
  return (
    <motion.article
      className="border-border bg-surface shadow-card-soft rounded-2xl border p-5 sm:p-6"
      variants={fadeInUpItem}
    >
      {/* The platform-feature SVGs are self-contained white glyphs; the ink
          tile keeps them legible on the light card (neutral iconography). */}
      <div className="bg-foreground flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl">
        <Image
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain"
          height={48}
          src={iconSrc}
          width={48}
        />
      </div>

      <p className="text-muted-foreground mt-4 text-sm leading-6 sm:mt-5 sm:text-[15px]">
        {text}
      </p>
    </motion.article>
  );
}
