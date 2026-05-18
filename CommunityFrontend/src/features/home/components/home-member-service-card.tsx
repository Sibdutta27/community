"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

import { fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

type HomeMemberServiceCardProps = Readonly<{
  buttonLabel: string;
  bullets: readonly string[];
  description: string;
  href: string;
  iconSrc: string;
  title: string;
  toneClassName: string;
}>;

export function HomeMemberServiceCard({
  buttonLabel,
  bullets,
  description,
  href,
  iconSrc,
  title,
  toneClassName,
}: HomeMemberServiceCardProps) {
  return (
    <motion.article
      className="flex h-full flex-col rounded-[1.2rem] border border-[#E8E1CB] bg-white p-3.5 shadow-[0_18px_42px_-34px_rgba(44,38,19,0.22)] sm:p-4"
      variants={fadeInUpItem}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-[0.85rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] sm:h-15 sm:w-15",
            toneClassName,
          )}
        >
          <Image
            alt=""
            aria-hidden="true"
            className="h-6 w-6 object-contain sm:h-6.5 sm:w-6.5"
            height={26}
            src={iconSrc}
            width={26}
          />
        </div>

        <div className="min-w-0">
          <h3
            className={cn(
              montserrat.className,
              "text-[1rem] leading-[1.08] font-semibold tracking-[-0.05em] text-[#4A1C1D] sm:text-[1.14rem]",
            )}
          >
            {title}
          </h3>

          <p
            className={cn(
              poppins.className,
              "mt-1 text-[0.8rem] leading-[1.2] text-[#66615A] sm:text-[0.86rem]",
            )}
          >
            {description}
          </p>
        </div>
      </div>

      <ul
        className={cn(
          poppins.className,
          "mt-3.5 space-y-2 text-[0.8rem] leading-5.5 text-[#1E1D1A] sm:text-[0.84rem]",
        )}
      >
        {bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#171614]" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <Link
          className={cn(
            montserrat.className,
            "flex h-11 w-full items-center justify-center rounded-[0.65rem] px-4 text-[0.84rem] font-semibold tracking-[-0.03em] text-white shadow-[0_16px_32px_-24px_rgba(44,38,19,0.5)] transition-transform duration-200 hover:-translate-y-0.5",
            toneClassName,
          )}
          href={href}
        >
          {buttonLabel}
        </Link>
      </div>
    </motion.article>
  );
}
