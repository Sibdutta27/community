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
      className="rounded-[0.8rem] border border-[#E8DFB8] bg-[#F1EED0] px-3 py-3.5 text-center shadow-[0_14px_30px_-30px_rgba(81,74,33,0.18)]"
      variants={fadeInUpItem}
    >
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-[0.7rem] bg-white/55">
        <Image
          alt=""
          aria-hidden="true"
          className="h-4.5 w-4.5 object-contain"
          height={18}
          src={iconSrc}
          width={18}
        />
      </div>

      <h3 className="mt-2 text-[0.8rem] leading-[1.22] font-semibold text-[#174F47]">
        {title}
      </h3>

      {description ? (
        <p className="mt-1 text-[0.72rem] leading-[1.3] text-[#31413E]">
          {description}
        </p>
      ) : null}
    </motion.article>
  );
}
