import { KitSection, TokenChip } from "./kit-primitives";

/**
 * Motion section — the shared framer-motion presets in `src/lib/motion.ts`.
 * Listed rather than animated: the kit documents when to reach for each.
 */

type MotionPreset = Readonly<{
  description: string;
  name: string;
  usage: string;
}>;

const presets: readonly MotionPreset[] = [
  {
    name: "fadeInUpContainer",
    description:
      "Orchestrating parent — staggers children by 0.14s (0.06s delay). The signature page reveal.",
    usage: "Wrap section content; trigger with whileInView + viewport={{ once: true }}.",
  },
  {
    name: "fadeInUpItem",
    description:
      "Child of the container — fades in while rising 22px over ~0.72s.",
    usage: "Cards, headings and copy inside a fadeInUpContainer.",
  },
  {
    name: "fadeInScaleItem",
    description:
      "Softer variant — fades in from 96% scale with a 12px rise over 0.6s.",
    usage: "Imagery and stat tiles that should settle rather than slide.",
  },
  {
    name: "enrollmentStepEnter",
    description:
      "Step entrance — the folder-tab + card unit fades and slides up once (16px, 0.55s). Part of the isolated enrollment motion block.",
    usage: "Only via EnrollmentStepEntrance in enrollment-motion.tsx.",
  },
  {
    name: "enrollmentFieldGroup",
    description:
      "Quieter fade-in-up (12px, 0.5s) as a form section scrolls into view. Same isolated block.",
    usage: "Only via the enrollment motion wrappers.",
  },
  {
    name: "mobileMenuVariants",
    description:
      "Mobile nav panel — fades/scales in from above with staggered links, and animates out on close.",
    usage: "The navbar's mobile dropdown panel (AnimatePresence).",
  },
];

export function MotionSection() {
  return (
    <KitSection
      description="One restrained vocabulary from src/lib/motion.ts, all eased with cubic-bezier(0.22, 1, 0.36, 1): a single orchestrated reveal per view, not scattered micro-interactions. prefers-reduced-motion is honored everywhere — MotionConfig reducedMotion=&quot;user&quot; for framer-motion, motion-reduce utilities for the CSS hover lifts."
      id="motion"
      kicker="Movement"
      title="Motion"
    >
      <ul className="divide-border border-border bg-surface list-none divide-y rounded-xl border p-0">
        {presets.map((preset) => (
          <li
            className="grid gap-2 p-5 sm:grid-cols-[13rem_1fr] sm:gap-6"
            key={preset.name}
          >
            <TokenChip>{preset.name}</TokenChip>
            <div className="space-y-1">
              <p className="text-foreground text-sm leading-6">
                {preset.description}
              </p>
              <p className="text-muted-foreground text-[0.8rem] leading-5">
                {preset.usage}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </KitSection>
  );
}
