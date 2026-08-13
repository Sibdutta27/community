"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
      className="border-border bg-background shadow-card-soft flex h-full flex-col rounded-2xl border p-5 sm:p-6"
      variants={fadeInUpItem}
    >
      <div className="flex items-center gap-3">
        {/* Ink tile with a white glyph — the neutral iconography tiles. */}
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl",
            toneClassName,
          )}
        >
          <Image
            alt=""
            aria-hidden="true"
            className="h-6 w-6 object-contain"
            height={26}
            src={iconSrc}
            width={26}
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-foreground text-[1rem] leading-tight font-semibold tracking-tight sm:text-[1.14rem]">
            {title}
          </h3>

          <p className="text-muted-foreground mt-1 text-[0.8rem] leading-[1.35] sm:text-[0.86rem]">
            {description}
          </p>
        </div>
      </div>

      <ul className="text-muted-foreground mt-4 space-y-2 text-[0.8rem] leading-5.5 sm:text-[0.84rem]">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3">
            <span
              aria-hidden="true"
              className="bg-foreground mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
            />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <Button asChild fullWidth size="md" variant="primary">
          <Link href={href}>{buttonLabel}</Link>
        </Button>
      </div>
    </motion.article>
  );
}
