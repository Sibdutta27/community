"use client";

import Link from "next/link";

import Image from "next/image";
import { CircleCheckBig } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

type HomeEnrollmentTipsCardProps = Readonly<{
  tips: ReadonlyArray<string>;
}>;

export function HomeEnrollmentTipsCard({ tips }: HomeEnrollmentTipsCardProps) {
  return (
    <motion.article
      className="rounded-[24px] border border-[#dcc7af] bg-[#f6ede1] px-4.5 py-5.5 text-[#201712] shadow-[0_14px_28px_-22px_rgba(0,0,0,0.28)] sm:px-5.5 sm:py-6.5"
      variants={fadeInUpItem}
    >
      <Image
        src="/icons/home/enrollment/helpful-tips.svg"
        alt=""
        aria-hidden="true"
        className="size-11 sm:size-13"
        width={56}
        height={56}
      />

      <h3
        className={cn(
          montserrat.className,
          "mt-4 text-[clamp(1.45rem,2vw,2rem)] font-semibold tracking-[-0.05em]",
        )}
      >
        Helpful Tips
      </h3>

      <ul className="mt-4.5 space-y-4">
        {tips.map((tip) => (
          <li key={tip} className="flex items-start gap-3">
            <CircleCheckBig className="text-primary mt-0.5 size-5 shrink-0" />
            <p
              className={cn(
                poppins.className,
                "text-[0.84rem] leading-[1.5] text-[#4f3d31] sm:text-[0.9rem]",
              )}
            >
              {tip}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-5.5">
        <Button
          asChild
          className="bg-primary h-11 w-full rounded-full px-5 text-[0.9rem] text-white shadow-[0_16px_34px_-18px_rgba(197,49,51,0.42)] hover:bg-[#ae2b2d]"
          size="lg"
          variant="outline"
        >
          <Link href="/contact">
            <Image
              src="/icons/home/enrollment/support-call.svg"
              alt=""
              aria-hidden="true"
              className="size-4.5"
              width={20}
              height={20}
            />
            <span className="text-white">Get Enrollment Support</span>
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}
