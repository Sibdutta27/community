"use client";

import Image from "next/image";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { fadeInUpItem } from "@/lib/motion";

type HeritageCardTone = "mint" | "cream" | "lilac";

const toneClasses: Record<HeritageCardTone, string> = {
  mint: "bg-[linear-gradient(180deg,#EAFFFD_0%,#FFFFFF_100%)]",
  cream: "bg-[linear-gradient(180deg,#FFF8EA_0%,#FFFFFF_100%)]",
  lilac: "bg-[linear-gradient(180deg,#EFEAFF_0%,#FFFFFF_100%)]",
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
        "border-border/70 rounded-2xl border p-5 shadow-[0_18px_40px_-34px_rgba(16,47,52,0.28)] sm:p-6",
        toneClasses[tone],
      )}
      variants={fadeInUpItem}
    >
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl sm:h-14 sm:w-14">
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

      <p className="text-foreground/80 mt-3 text-sm leading-6 sm:text-[15px]">
        {description}
      </p>
    </motion.article>
  );
}
