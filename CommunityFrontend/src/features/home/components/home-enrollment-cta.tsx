"use client";

import Link from "next/link";

import Image from "next/image";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { poppins } from "@/styles/fonts";

const supportLinkStyle = {
  color: "#24ACC3",
  textDecorationColor: "#24ACC3",
  textDecorationLine: "underline",
  textUnderlineOffset: "4px",
} as const;

export function HomeEnrollmentCta() {
  return (
    <motion.div className="mt-8 text-center" variants={fadeInUpItem}>
      <div className="mx-auto mb-2.5 flex size-8 items-center justify-center rounded-full bg-white/70 shadow-[0_10px_24px_-18px_rgba(16,24,40,0.2)]">
        <Image
          src="/icons/home/enrollment/application.svg"
          alt=""
          aria-hidden="true"
          className="size-4"
          width={18}
          height={18}
        />
      </div>

      <Button
        asChild
        className="bg-primary! mx-auto h-11 w-full max-w-sm rounded-full px-5! text-[0.9rem]! font-semibold! text-white! shadow-[0_18px_34px_-20px_rgba(197,49,51,0.42)]! hover:brightness-95!"
        size="lg"
      >
        <Link href="/dashboard">
          <Image
            src="/icons/home/enrollment/application.svg"
            alt=""
            aria-hidden="true"
            className="size-4"
            width={18}
            height={18}
          />
          <span className="text-white">Begin Your Application</span>
        </Link>
      </Button>

      <p
        className={cn(
          poppins.className,
          "mt-2.5 text-[0.88rem] leading-[1.5] text-[#2a2927]",
        )}
      >
        Questions?{" "}
        <Link
          className="font-semibold text-[#24ACC3] underline underline-offset-4 hover:decoration-[#24ACC3]"
          style={supportLinkStyle}
          href="#enrollment-faq"
        >
          Read our enrollment FAQ
        </Link>{" "}
        or{" "}
        <Link
          className="font-semibold text-[#24ACC3] underline underline-offset-4 hover:decoration-[#24ACC3]"
          style={supportLinkStyle}
          href="/contact"
        >
          contact us
        </Link>
      </p>
    </motion.div>
  );
}
