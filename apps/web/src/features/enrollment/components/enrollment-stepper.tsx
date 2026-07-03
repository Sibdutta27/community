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
 * Number+name tab stepper. Each of the five tabs pairs a small numbered
 * circle with its section name, joined by thin connector lines so the row
 * fills the header width. Every tab is a link — members can jump to any
 * step at any time (free jump-nav). The active step has a filled deep-teal
 * circle; completed steps a pale-teal circle with a check; the rest stay
 * outlined and muted. On small screens only the active step keeps its
 * name; the other tabs collapse to their circles.
 */
export function EnrollmentStepper({
  className,
  currentStep,
  stepState,
}: EnrollmentStepperProps) {
  return (
    <ol
      aria-label="Enrollment steps"
      className={cn("flex w-full items-center gap-1.5 sm:gap-2", className)}
    >
      {enrollmentStepDefinitions.map((definition, index) => {
        const stepKey = String(definition.step) as keyof EnrollmentStepState;
        const isActive = definition.step === currentStep;
        const isCompleted = !isActive && Boolean(stepState?.[stepKey]);
        const isNavigable = isEnrollmentStepNavigable(
          stepState,
          definition.step,
        );

        const tabClassName = cn(
          "group flex min-w-0 items-center gap-2 rounded-full outline-none",
          "focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:ring-offset-2",
        );

        const circleClassName = cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold tracking-tight transition-colors sm:size-9 sm:text-sm",
          isActive
            ? "border-primary bg-primary text-primary-foreground"
            : isCompleted
              ? "border-secondary bg-secondary text-secondary-foreground"
              : "border-border text-muted-foreground bg-transparent transition-colors group-hover:border-primary group-hover:text-foreground",
        );

        const nameClassName = cn(
          "min-w-0 truncate text-sm transition-colors",
          isActive
            ? "text-foreground font-semibold"
            : isCompleted
              ? "text-foreground font-medium sm:group-hover:text-primary"
              : "text-muted-foreground font-medium group-hover:text-foreground",
          // Small screens: keep it airy — circles only, except the active name.
          isActive ? "inline" : "hidden md:inline",
        );

        const tabContent = (
          <>
            <span aria-hidden="true" className={circleClassName}>
              {isCompleted ? (
                <Check className="size-4 stroke-[3]" />
              ) : (
                definition.step
              )}
            </span>
            <span className={nameClassName}>{definition.title}</span>
          </>
        );

        return (
          <li
            className={cn(
              "flex min-w-0 items-center",
              // Connectors stretch so the row fills the header width.
              index > 0 && "min-w-4 flex-1 gap-1.5 sm:gap-2",
            )}
            key={definition.step}
          >
            {index > 0 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px min-w-2 flex-1",
                  isActive || isCompleted ? "bg-secondary" : "bg-border",
                )}
              />
            ) : null}
            {isNavigable ? (
              <Link
                aria-current={isActive ? "step" : undefined}
                aria-label={`Go to step ${definition.step}: ${definition.title}`}
                className={tabClassName}
                href={definition.href}
              >
                {tabContent}
              </Link>
            ) : (
              <span
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${definition.step}: ${definition.title}`}
                className={tabClassName}
              >
                {tabContent}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
