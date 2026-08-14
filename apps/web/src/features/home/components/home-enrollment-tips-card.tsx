"use client";

import Link from "next/link";

import Image from "next/image";
import { CircleCheckBig } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { fadeInUpItem } from "@/lib/motion";

type HomeEnrollmentTipsCardProps = Readonly<{
  tips: ReadonlyArray<string>;
}>;

export function HomeEnrollmentTipsCard({ tips }: HomeEnrollmentTipsCardProps) {
  const t = useTranslations("home.process.tips");

  return (
    <motion.article
      className="border-border bg-surface text-foreground shadow-card-soft rounded-2xl border p-5 sm:p-6"
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

      <h3 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
        {t("title")}
      </h3>

      <ul className="mt-4.5 space-y-4">
        {tips.map((tip) => (
          <li key={tip} className="flex items-start gap-3">
            <CircleCheckBig
              aria-hidden="true"
              className="text-foreground mt-0.5 size-5 shrink-0"
            />
            <p className="text-muted-foreground text-[0.84rem] leading-[1.5] sm:text-[0.9rem]">
              {tip}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-5.5">
        <Button asChild fullWidth size="lg" variant="primary">
          <Link href="/contact">
            <Image
              src="/icons/home/enrollment/support-call.svg"
              alt=""
              aria-hidden="true"
              className="size-4.5"
              width={20}
              height={20}
            />
            <span>{t("supportCta")}</span>
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}
