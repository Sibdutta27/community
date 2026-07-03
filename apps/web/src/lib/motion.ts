import type { Variants } from "framer-motion";

const smoothEase = [0.22, 1, 0.36, 1] as const;

export const fadeInUpContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.06,
    },
  },
};

export const fadeInUpItem: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: smoothEase,
    },
  },
};

export const fadeInScaleItem: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: smoothEase,
    },
  },
};

/* ─────────────────────────────────────────────────────────────────────────
 * Enrollment step motion — ISOLATED BLOCK.
 * All enrollment-flow animation lives in these variants plus the wrappers in
 * `features/enrollment/components/enrollment-motion.tsx`. To remove the
 * enrollment motion entirely, delete this block and have those wrappers
 * render plain <div>s (one-file change). `prefers-reduced-motion` is
 * respected by the wrappers via <MotionConfig reducedMotion="user">.
 * ───────────────────────────────────────────────────────────────────────── */

/** Step entrance: the folder-tab + card unit fades and slides up once. */
export const enrollmentStepEnter: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: smoothEase,
    },
  },
};

/** Field-group reveal: a quieter fade-in-up as a section scrolls into view. */
export const enrollmentFieldGroup: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: smoothEase,
    },
  },
};

/* ───────────────────────── end enrollment block ─────────────────────────── */

export const mobileMenuVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -12,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      ease: smoothEase,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: {
      duration: 0.24,
      ease: smoothEase,
    },
  },
};
