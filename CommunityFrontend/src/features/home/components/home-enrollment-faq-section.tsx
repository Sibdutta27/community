"use client";

import { useState } from "react";
import Image from "next/image";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

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
      className="overflow-hidden bg-[#FFFDEC]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-6 sm:py-8 lg:py-10")}
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.span
            className={cn(
              sharedStyles.sectionBadge,
              poppins.className,
              "bg-[#D7EFD3] px-4.5 py-1.75 text-[0.78rem] tracking-[-0.02em] text-[#183F38] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
            )}
            variants={fadeInUpItem}
          >
            Frequently Asked Questions
          </motion.span>

          <motion.h2
            className={cn(
              montserrat.className,
              "mx-auto mt-4 max-w-4xl text-[clamp(1.55rem,3.15vw,3rem)] leading-[1.08] font-semibold tracking-[-0.05em] text-[#0B3B33]",
            )}
            variants={fadeInUpItem}
          >
            Questions About Enrollment?
          </motion.h2>

          <motion.p
            className={cn(
              poppins.className,
              "mx-auto mt-3 max-w-4xl text-[clamp(0.88rem,1.15vw,0.98rem)] leading-[1.45] tracking-[-0.02em] text-[#24211D]",
            )}
            variants={fadeInUpItem}
          >
            Find answers to common questions about the enrollment process,
            membership benefits, and platform features.
          </motion.p>
        </div>

        <div className="mt-6 grid gap-3.5 lg:mt-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <motion.div
            className="relative min-h-[15rem] overflow-hidden rounded-[1.5rem] bg-white shadow-[0_24px_56px_-38px_rgba(16,24,40,0.22)] sm:min-h-[19rem] lg:min-h-[28rem]"
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
                  className="overflow-hidden rounded-[1.2rem] border border-[#DCD8C8] bg-white shadow-[0_18px_42px_-32px_rgba(17,24,39,0.18)]"
                  variants={fadeInUpItem}
                >
                  <button
                    aria-controls={`faq-panel-${item.id}`}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left sm:px-4.5 sm:py-4.5 lg:px-5"
                    type="button"
                    onClick={() =>
                      setOpenItemId((currentId) =>
                        currentId === item.id ? null : item.id,
                      )
                    }
                  >
                    <span
                      className={cn(
                        montserrat.className,
                        "text-[clamp(0.9rem,1.08vw,1rem)] leading-[1.22] font-semibold tracking-[-0.03em] transition-colors",
                        isOpen ? "text-[#0F625C]" : "text-[#10100F]",
                      )}
                    >
                      {item.question}
                    </span>

                    <span
                      aria-hidden="true"
                      className={cn(
                        montserrat.className,
                        "min-w-5 text-center text-[1.15rem] leading-none font-semibold tracking-[-0.06em] text-[#11110F]",
                      )}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen ? (
                    <div
                      className="border-t border-[#DCD8C8] px-4 pt-3 pb-4 sm:px-4.5 sm:pb-4.5 lg:px-5 lg:pb-5"
                      id={`faq-panel-${item.id}`}
                    >
                      <p
                        className={cn(
                          poppins.className,
                          "max-w-3xl text-[0.82rem] leading-[1.55] tracking-[-0.01em] text-[#5B5B58] sm:text-[0.86rem]",
                        )}
                      >
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
