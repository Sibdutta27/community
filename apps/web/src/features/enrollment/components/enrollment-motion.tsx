"use client";

import type { ReactNode } from "react";

import { MotionConfig, motion } from "framer-motion";

import { enrollmentFieldGroup, enrollmentStepEnter } from "@/lib/motion";

/**
 * Enrollment motion wrappers — the SINGLE place the enrollment flow animates.
 *
 * - `EnrollmentStepEntrance` — subtle fade/slide-up when a step mounts
 *   (wraps the folder-tab row + elevated card as one unit).
 * - `EnrollmentFieldGroupReveal` — the same, quieter, per field group as it
 *   scrolls into view (`viewport={{ once: true }}`).
 *
 * To remove all enrollment motion: make both wrappers return
 * `<div className={className}>{children}</div>` (or unwrap the call sites)
 * and delete the enrollment block in `src/lib/motion.ts`.
 *
 * `<MotionConfig reducedMotion="user">` honors `prefers-reduced-motion`:
 * transform animation is dropped for those users (opacity-only).
 */

type EnrollmentMotionProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export function EnrollmentStepEntrance({
  children,
  className,
}: EnrollmentMotionProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        animate="visible"
        className={className}
        initial="hidden"
        variants={enrollmentStepEnter}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

export function EnrollmentFieldGroupReveal({
  children,
  className,
}: EnrollmentMotionProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial="hidden"
        variants={enrollmentFieldGroup}
        viewport={{ amount: 0.15, once: true }}
        whileInView="visible"
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
