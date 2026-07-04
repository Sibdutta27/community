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

type EnrollmentTabState = "active" | "completed" | "upcoming";

/**
 * Folder-tab stepper. The five steps render as top-attached manila-folder
 * tabs (number badge + section name) that sit directly on the elevated form
 * card below (see EnrollmentStepLayout). The ACTIVE tab shares the card's
 * `bg-surface`, keeps top+side borders but a transparent bottom edge, and
 * overlaps the card's top border by 1px (`-mb-px` on the row) so it merges
 * seamlessly into the card — with a deep-azul top edge and number badge as
 * the accent. Inactive tabs are shorter and recessed on `bg-surface-muted`;
 * their own bottom border continues the card's top divider line beneath them.
 *
 * Every tab is a link — members can jump to any step at any time (free
 * jump-nav). On narrow screens the row scrolls horizontally (hidden
 * scrollbar) instead of wrapping or overflowing.
 */
export function EnrollmentStepper({
  className,
  currentStep,
  stepState,
}: EnrollmentStepperProps) {
  return (
    <ol
      aria-label="Enrollment steps"
      className={cn(
        // `relative z-10 -mb-px` lets the active tab paint over the card's
        // top border for the seamless folder merge.
        "relative z-10 -mb-px flex w-full items-end gap-1 overflow-x-auto pt-1.5 sm:gap-1.5",
        // Momentum scrolling with a hidden scrollbar on mobile.
        "[-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {enrollmentStepDefinitions.map((definition) => {
        const stepKey = String(definition.step) as keyof EnrollmentStepState;
        const isActive = definition.step === currentStep;
        const isCompleted = !isActive && Boolean(stepState?.[stepKey]);
        const tabState: EnrollmentTabState = isActive
          ? "active"
          : isCompleted
            ? "completed"
            : "upcoming";
        const isNavigable = isEnrollmentStepNavigable(
          stepState,
          definition.step,
        );

        const tabClassName = cn(
          "group relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-t-xl border px-3.5 text-sm outline-none transition-colors sm:px-4",
          "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-offset-2",
          isActive
            ? // Active: same surface as the card, open bottom edge — the tab
              // and card read as one folder.
              "border-border bg-surface border-b-transparent pt-3 pb-3.5"
            : // Inactive: slightly shorter + recessed; its bottom border
              // continues the card's top divider line underneath it.
              "border-border bg-surface-muted hover:bg-surface mt-1.5 pt-2.5 pb-2.5",
        );

        const badgeClassName = cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold tracking-tight transition-colors sm:size-7 sm:text-[13px]",
          isActive
            ? "border-primary bg-primary text-primary-foreground"
            : isCompleted
              ? "border-secondary bg-secondary text-secondary-foreground"
              : "border-border text-muted-foreground bg-transparent group-hover:border-primary group-hover:text-foreground",
        );

        const nameClassName = cn(
          "min-w-0 truncate transition-colors",
          isActive
            ? "text-foreground font-semibold"
            : isCompleted
              ? "text-foreground group-hover:text-primary font-medium"
              : "text-muted-foreground group-hover:text-foreground font-medium",
        );

        const tabContent = (
          <>
            {isActive ? (
              // Teal top edge — the folder tab's active accent.
              <span
                aria-hidden="true"
                className="bg-primary absolute inset-x-3 top-0 h-0.5 rounded-b-full"
              />
            ) : null}
            <span
              aria-hidden="true"
              className={badgeClassName}
              data-slot="enrollment-tab-number"
            >
              {isCompleted ? (
                <Check className="size-3.5 stroke-[3]" />
              ) : (
                definition.step
              )}
            </span>
            <span className={nameClassName}>{definition.title}</span>
          </>
        );

        return (
          <li className="flex shrink-0 items-end" key={definition.step}>
            {isNavigable ? (
              <Link
                aria-current={isActive ? "step" : undefined}
                aria-label={`Go to step ${definition.step}: ${definition.title}`}
                className={tabClassName}
                data-state={tabState}
                href={definition.href}
              >
                {tabContent}
              </Link>
            ) : (
              <span
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${definition.step}: ${definition.title}`}
                className={tabClassName}
                data-state={tabState}
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
