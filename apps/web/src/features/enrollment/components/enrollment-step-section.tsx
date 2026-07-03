import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import { EnrollmentFieldGroupReveal } from "@/features/enrollment/components/enrollment-motion";
import { cn } from "@/lib/utils";

type EnrollmentStepSectionProps = Readonly<{
  children: ReactNode;
  className?: string;
  description?: string;
  /** Small neutral (charcoal/muted) glyph beside the sub-header title. */
  icon?: LucideIcon;
  title?: string;
}>;

/**
 * Form section for the enrollment steps: an optional quiet sub-header
 * (small neutral icon + title, e.g. an ancestor's name or "Your Yucayekeno
 * Information") with an explainer, above a responsive two-column field grid.
 * Titled sections open with a hairline divider so grouped sections read as
 * distinct bands inside the elevated card. Fields that should span the full
 * row take `className="md:col-span-2"`. The grid fades in on scroll via
 * EnrollmentFieldGroupReveal (motion isolated in enrollment-motion.tsx).
 */
export function EnrollmentStepSection({
  children,
  className,
  description,
  icon: Icon,
  title,
}: EnrollmentStepSectionProps) {
  const hasHeader = Boolean(title || description);

  return (
    <section
      className={cn(
        // Hairline divider between grouped sections.
        hasHeader && "border-border border-t pt-8 sm:pt-9",
        className,
      )}
    >
      {title ? (
        <h2 className="text-foreground flex items-center gap-2 text-[1.05rem] leading-tight font-semibold tracking-tight sm:text-[1.15rem]">
          {Icon ? (
            <Icon
              aria-hidden="true"
              className="text-muted-foreground size-[1.05rem] shrink-0"
            />
          ) : null}
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="text-muted-foreground mt-1.5 max-w-3xl text-[0.88rem] leading-6">
          {description}
        </p>
      ) : null}

      <EnrollmentFieldGroupReveal
        className={cn(
          "grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2",
          hasHeader && "mt-5 sm:mt-6",
        )}
      >
        {children}
      </EnrollmentFieldGroupReveal>
    </section>
  );
}
