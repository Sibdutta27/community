"use client";

import Link from "next/link";

import Image from "next/image";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { poppins } from "@/styles/fonts";

const supportLinkClassName =
  "text-foreground font-semibold underline underline-offset-4 hover:text-muted-foreground";

export function HomeEnrollmentCta() {
  return (
    <motion.div className="mt-8 text-center" variants={fadeInUpItem}>
      <div className="border-border bg-surface mx-auto mb-2.5 flex size-8 items-center justify-center rounded-full border">
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
        className="bg-primary! text-primary-foreground! mx-auto h-11 w-full max-w-sm rounded-full px-5! text-[0.9rem]! font-semibold! hover:opacity-90!"
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
          "text-muted-foreground mt-2.5 text-[0.88rem] leading-[1.5]",
        )}
      >
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
