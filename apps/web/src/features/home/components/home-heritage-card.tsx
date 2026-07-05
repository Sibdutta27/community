"use client";

import Image from "next/image";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fadeInUpItem } from "@/lib/motion";

type HeritageCardTone = "mint" | "cream" | "lilac";

// Minimal B&W design system: the legacy tones all resolve to the same
// neutral surface so existing callers keep working without earthy tints.
const toneClasses: Record<HeritageCardTone, string> = {
  mint: "bg-surface",
  cream: "bg-surface",
  lilac: "bg-surface",
};

type HeritageCardProps = {
  iconSrc: string;
  title: string;
  description: string;
  tone: HeritageCardTone;
};

export function HomeHeritageCard({
  iconSrc,
  title,
  description,
  tone,
}: HeritageCardProps) {
  return (
    <motion.article
      className={cn(
        "border-border shadow-card-soft rounded-2xl border p-5 sm:p-6",
        toneClasses[tone],
      )}
      variants={fadeInUpItem}
    >
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl sm:h-14 sm:w-14">
        <Image
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain"
          height={48}
          src={iconSrc}
          width={48}
        />
      </div>

      <h3 className="text-foreground mt-4 max-w-116.25 text-xl leading-[1.2] font-semibold sm:text-2xl">
        {title}
      </h3>

      <p className="text-muted-foreground mt-3 text-sm leading-6 sm:text-[15px]">
        {description}
      </p>
    </motion.article>
  );
}
