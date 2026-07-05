"use client";

import Link from "next/link";

import Image from "next/image";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeInUpItem } from "@/lib/motion";

const supportLinkClassName =
  "text-primary rounded-sm font-semibold underline underline-offset-4 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function HomeEnrollmentCta() {
  return (
    <motion.div className="mt-8 text-center" variants={fadeInUpItem}>
      {/* Ink chip keeps the white application glyph legible (neutral
          white-on-ink iconography). */}
      <div className="bg-foreground mx-auto mb-2.5 flex size-8 items-center justify-center rounded-full">
        <Image
          src="/icons/home/enrollment/application.svg"
          alt=""
          aria-hidden="true"
          className="size-4"
          width={18}
          height={18}
        />
      </div>

      <Button asChild className="mx-auto w-full max-w-sm" size="lg">
        <Link href="/dashboard">
          <Image
            src="/icons/home/enrollment/application.svg"
            alt=""
            aria-hidden="true"
            className="size-4"
            width={18}
            height={18}
          />
          <span>Begin Your Application</span>
        </Link>
      </Button>

      <p className="text-muted-foreground mt-2.5 text-[0.88rem] leading-[1.5]">
        Questions?{" "}
        <Link className={supportLinkClassName} href="#enrollment-faq">
          Read our enrollment FAQ
        </Link>{" "}
        or{" "}
        <Link className={supportLinkClassName} href="/contact">
          contact us
        </Link>
      </p>
    </motion.div>
  );
}
