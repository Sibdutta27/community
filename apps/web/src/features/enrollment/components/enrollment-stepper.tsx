"use client";

import Link from "next/link";

import { Check } from "lucide-react";

import {
  enrollmentStepDefinitions,
  isEnrollmentStepNavigable,
} from "@/features/enrollment/config/enrollment-steps";
import { cn } from "@/lib/utils";
import type { EnrollmentStepState } from "@/types/enrollment";

type EnrollmentStepperProps = Readonly<{
  className?: string;
  currentStep: number;
  stepState: EnrollmentStepState | null;
}>;

/**
 * Numbered 1-5 circle stepper. Every circle is a link — members can jump to
 * any step at any time. The current step is a filled (monochrome foreground)
 * circle; completed steps are filled with a check; the rest are outlined.
 */
export function EnrollmentStepper({
  className,
  currentStep,
  stepState,
}: EnrollmentStepperProps) {
  return (
    <ol
      aria-label="Enrollment steps"
      className={cn("flex items-center gap-2 sm:gap-2.5", className)}
    >
      {enrollmentStepDefinitions.map((definition) => {
        const stepKey = String(definition.step) as keyof EnrollmentStepState;
        const isActive = definition.step === currentStep;
        const isCompleted = !isActive && Boolean(stepState?.[stepKey]);
        const isNavigable = isEnrollmentStepNavigable(
          stepState,
          definition.step,
        );

        const circleClassName = cn(
          "flex size-10 items-center justify-center rounded-full border text-sm font-semibold tracking-tight transition-colors",
          isActive || isCompleted
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-transparent text-foreground hover:border-foreground",
        );

        const circleContent = isCompleted ? (
          <Check aria-hidden="true" className="size-4 stroke-[3]" />
        ) : (
          definition.step
        );

        return (
          <li key={definition.step}>
            {isNavigable ? (
              <Link
                aria-current={isActive ? "step" : undefined}
                aria-label={`Go to step ${definition.step}: ${definition.title}`}
                className={cn(
                  circleClassName,
                  "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                )}
                href={definition.href}
              >
                {circleContent}
              </Link>
            ) : (
              <span
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${definition.step}: ${definition.title}`}
                className={circleClassName}
              >
                {circleContent}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
