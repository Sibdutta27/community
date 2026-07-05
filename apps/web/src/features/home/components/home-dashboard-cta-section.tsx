"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/home-shared.module.scss";

export function HomeDashboardCtaSection() {
  return (
    <motion.section
      className="bg-background overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(
          sharedStyles.sectionContainer,
          "pt-2 pb-10 sm:pb-12 lg:pb-14",
        )}
      >
        <motion.article
          className="bg-foreground text-background shadow-card rounded-2xl px-5 py-12 text-center sm:px-8 sm:py-14 lg:px-12 lg:py-16"
          variants={fadeInUpItem}
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Join 2,847 Enrolled Members
            </h2>

            <p className="text-background/80 mx-auto mt-3.5 max-w-4xl text-sm leading-6 sm:text-base">
              Become part of a growing community of Taíno descendants
              reconnecting with their heritage and building a stronger future
              together.
            </p>

            <div className="mt-9 flex justify-center">
              <Button
                asChild
                className="text-primary w-full max-w-[36rem] gap-3"
                size="xl"
                variant="outline"
              >
                <Link href="/dashboard">
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="h-5 w-5 object-contain"
                    height={20}
                    src="/icons/home/begin-application.svg"
                    width={20}
                  />
                  <span>Begin Your Application</span>
                </Link>
              </Button>
            </div>
          </div>
        </motion.article>
      </div>
    </motion.section>
  );
}
