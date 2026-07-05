"use client";

import { useState } from "react";
import Image from "next/image";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/home-shared.module.scss";

const faqItems = [
  {
    id: "eligibility",
    question: "Who is eligible to enroll in the Taíno Nation?",
    answer:
      "Taíno descendants who can provide personal identification and documentation supporting their maternal lineage are eligible to begin the enrollment process. If you are still gathering records, you can review the requirements first and prepare your materials before submitting.",
  },
  {
    id: "timeline",
    question: "How long does the enrollment process take?",
    answer:
      "The enrollment application typically takes 20 to 30 minutes to complete. After submission, our review team carefully examines your application and supporting documents. The full review process usually takes 4 to 6 weeks, and you will receive status updates along the way.",
  },
  {
    id: "security",
    question: "Is my personal information secure?",
    answer:
      "Yes. Personal information is encrypted and stored on secure sovereign servers. Access is limited to authorized reviewers involved in the enrollment process, and your data is not shared with third parties.",
  },
  {
    id: "benefits",
    question: "What benefits do enrolled members receive?",
    answer:
      "Enrolled members can access their Tribal ID, document maternal lineage, connect with their assigned Yucayeke, use the secure document vault, and explore member services such as health, legal, educational, and community support resources.",
  },
  {
    id: "fee",
    question: "Is there a fee to enroll?",
    answer:
      "No. There is no fee to begin the enrollment application. What you will need most is time to complete the form accurately and supporting documents to help verify your lineage.",
  },
] as const;

export function HomeEnrollmentFaqSection() {
  const [openItemId, setOpenItemId] = useState<
    (typeof faqItems)[number]["id"] | null
  >("timeline");

  return (
    <motion.section
      id="enrollment-faq"
      className="bg-background overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(
          sharedStyles.sectionContainer,
          "pt-2 pb-12 sm:pb-14 lg:pb-16",
        )}
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.p
            className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase"
            variants={fadeInUpItem}
          >
            Frequently Asked Questions
          </motion.p>

          <motion.h2
            className="text-foreground mx-auto mt-3 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
            variants={fadeInUpItem}
          >
            Questions About Enrollment?
          </motion.h2>

          <motion.p
            className="text-muted-foreground mx-auto mt-4 max-w-4xl text-sm leading-6 sm:text-base"
            variants={fadeInUpItem}
          >
            Find answers to common questions about the enrollment process,
            membership benefits, and platform features.
          </motion.p>
        </div>

        <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <motion.div
            className="border-border bg-surface-muted shadow-card-soft relative min-h-[15rem] overflow-hidden rounded-2xl border sm:min-h-[19rem] lg:min-h-[28rem]"
            variants={fadeInUpItem}
          >
            <Image
              alt="Taíno coastal landscape"
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              src="/images/taino-nature.svg"
            />
          </motion.div>

          <motion.div className="space-y-3" variants={fadeInUpContainer}>
            {faqItems.map((item) => {
              const isOpen = item.id === openItemId;

              return (
                <motion.article
                  key={item.id}
                  className="border-border bg-surface shadow-card-soft overflow-hidden rounded-2xl border"
                  variants={fadeInUpItem}
                >
                  <h3>
                    <button
                      aria-controls={`faq-panel-${item.id}`}
                      aria-expanded={isOpen}
                      className="focus-visible:ring-ring flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none sm:px-4.5 sm:py-4.5 lg:px-5"
                      type="button"
                      onClick={() =>
                        setOpenItemId((currentId) =>
                          currentId === item.id ? null : item.id,
                        )
                      }
                    >
                      <span
                        className={cn(
                          "text-[0.95rem] leading-[1.3] font-semibold tracking-tight transition-colors sm:text-[1rem]",
                          isOpen ? "text-foreground" : "text-foreground/80",
                        )}
                      >
                        {item.question}
                      </span>

                      <span
                        aria-hidden="true"
                        className="text-foreground min-w-5 text-center text-[1.15rem] leading-none font-semibold"
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                  </h3>

                  {isOpen ? (
                    <div
                      className="border-border border-t px-4 pt-3 pb-4 sm:px-4.5 sm:pb-4.5 lg:px-5 lg:pb-5"
                      id={`faq-panel-${item.id}`}
                    >
                      <p className="text-muted-foreground max-w-3xl text-[0.84rem] leading-[1.55] sm:text-[0.88rem]">
                        {item.answer}
                      </p>
                    </div>
                  ) : null}
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
