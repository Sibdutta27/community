"use client";

import Image from "next/image";

import { motion } from "framer-motion";

import { fadeInUpItem } from "@/lib/motion";

type HomeYucayekeRegionCardProps = Readonly<{
  iconSrc: string;
  title: string;
  description?: string;
}>;

export function HomeYucayekeRegionCard({
  iconSrc,
  title,
  description,
}: HomeYucayekeRegionCardProps) {
  return (
    <motion.article
      className="border-border bg-surface shadow-card-soft rounded-xl border px-3 py-3.5 text-center"
      variants={fadeInUpItem}
    >
      <div className="border-border bg-surface-muted mx-auto flex size-9 items-center justify-center rounded-full border">
        <Image
          alt=""
          aria-hidden="true"
          className="h-4.5 w-4.5 object-contain"
          height={18}
          src={iconSrc}
          width={18}
        />
      </div>

      <h4 className="text-foreground mt-2 text-[0.8rem] leading-[1.22] font-semibold">
        {title}
      </h4>

      {description ? (
        <p className="text-muted-foreground mt-1 text-[0.72rem] leading-[1.3]">
          {description}
        </p>
      ) : null}
    </motion.article>
  );
}
