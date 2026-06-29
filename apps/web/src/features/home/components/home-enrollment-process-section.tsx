"use client";

import { motion } from "framer-motion";

import { fadeInUpContainer, fadeInUpItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { montserrat, poppins } from "@/styles/fonts";

import { HomeEnrollmentCta } from "@/features/home/components/home-enrollment-cta";
import { HomeEnrollmentResourcesSection } from "@/features/home/components/home-enrollment-resources-section";
import { HomeEnrollmentStepCard } from "@/features/home/components/home-enrollment-step-card";
import sharedStyles from "../styles/home-shared.module.scss";

const enrollmentSteps = [
  {
    step: "1",
    title: "Create Account",
    description:
      "Sign up with your email and create a secure password to access the enrollment portal.",
    tone: {
      bubbleClassName: "bg-[linear-gradient(180deg,#26B9B0_0%,#1C9F97_100%)]",
      numberClassName: "text-white",
    },
  },
  {
    step: "2",
    title: "Personal Information",
    description:
      "Provide your basic details including name, date of birth, and contact information.",
    tone: {
      bubbleClassName: "bg-[linear-gradient(180deg,#C68179_0%,#B66A62_100%)]",
      numberClassName: "text-white",
    },
  },
  {
    step: "3",
    title: "Maternal Lineage",
    description:
      "Document your maternal ancestry with names, dates, and places of birth for your lineage.",
    tone: {
      bubbleClassName: "bg-[linear-gradient(180deg,#6787E4_0%,#5574D8_100%)]",
      numberClassName: "text-white",
    },
  },
  {
    step: "4",
    title: "Upload Documents",
    description:
      "Submit supporting documents such as birth certificates, family records, and lineage proof.",
    tone: {
      bubbleClassName: "bg-[linear-gradient(180deg,#2D8BAE_0%,#1D6F86_100%)]",
      numberClassName: "text-white",
    },
  },
] as const;

const needItems = [
  {
    iconSrc: "/icons/home/enrollment/government-id.svg",
    title: "Government-Issued ID",
    description: "Driver's license, passport, or state ID",
  },
  {
    iconSrc: "/icons/home/enrollment/certificate.svg",
    title: "Birth Certificate",
    description: "Your official birth certificate (certified copy)",
  },
  {
    iconSrc: "/icons/home/enrollment/lineage-record.svg",
    title: "Maternal Lineage Records",
    description:
      "Birth certificates for mother, grandmother, great-grandmother (if available)",
  },
  {
    iconSrc: "/icons/home/enrollment/supporting-doc.svg",
    title: "Supporting Documentation",
    description: "Family trees, historical records, or tribal documentation",
  },
] as const;

const tipItems = [
  "Save your progress at any time and return later to complete your application",
  "Scan documents in high quality (PDF or JPG format, under 10MB each)",
  "Review all information carefully before submitting your application",
] as const;

export function HomeEnrollmentProcessSection() {
  return (
    <motion.section
      className="overflow-hidden bg-[#FFFDEC]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={fadeInUpContainer}
    >
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.span
            className={cn(
              sharedStyles.sectionBadge,
              poppins.className,
              "bg-[#D7EFD3] px-5 py-2 text-[0.84rem] tracking-[-0.02em] text-[#1B5B4F] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
            )}
            variants={fadeInUpItem}
          >
            Enrollment Process
          </motion.span>

          <motion.h2
            className={cn(
              montserrat.className,
              "mt-6 text-[clamp(1.7rem,3.2vw,3rem)] leading-[1.06] font-semibold tracking-[-0.05em] text-[#103F36]",
            )}
            variants={fadeInUpItem}
          >
            How to Join the <span className="text-primary">Taíno</span> Nation
          </motion.h2>

          <motion.p
            className={cn(
              poppins.className,
              "mx-auto mt-4 max-w-4xl text-[clamp(0.9rem,1.15vw,1rem)] leading-[1.5] tracking-[-0.02em] text-[#2A2927]",
            )}
            variants={fadeInUpItem}
          >
            Our enrollment process is designed to be simple, respectful, and
            thorough. Follow these steps to begin your journey toward official
            tribal membership.
          </motion.p>
        </div>

        <motion.div
          className="mt-11 grid gap-x-4 gap-y-9 md:grid-cols-2 md:gap-4 xl:grid-cols-4"
          variants={fadeInUpContainer}
        >
          {enrollmentSteps.map((card) => (
            <HomeEnrollmentStepCard key={card.step} {...card} />
          ))}
        </motion.div>

        <motion.div className="mt-9" variants={fadeInUpContainer}>
          <HomeEnrollmentResourcesSection items={needItems} tips={tipItems} />
        </motion.div>

        <HomeEnrollmentCta />
      </div>
    </motion.section>
  );
}
