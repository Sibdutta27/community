"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EnrollmentStepEntrance } from "@/features/enrollment/components/enrollment-motion";
import { EnrollmentStepper } from "@/features/enrollment/components/enrollment-stepper";
import {
  enrollmentTotalSteps,
  getEnrollmentStepDefinition,
  resolveEnrollmentStepState,
} from "@/features/enrollment/config/enrollment-steps";
import { useAccountInfoQuery } from "@/features/enrollment/lib/enrollment-queries";
import { cn } from "@/lib/utils";

type EnrollmentStepLayoutProps = Readonly<{
  children: ReactNode;
  step: number;
}>;

/**
 * Shared shell for the five enrollment step pages, styled as a manila
 * folder: a light utility row (Back pill + "Step N of 5"), then the
 * folder-tab stepper attached to an elevated `bg-surface` card that holds
 * the step heading, description, and form. The active tab and the card
 * share the same surface and merge seamlessly (see EnrollmentStepper).
 * The tab row + card animate in as one unit via EnrollmentStepEntrance —
 * all motion is isolated there and in `lib/motion.ts`.
 */
export function EnrollmentStepLayout({
  children,
  step,
}: EnrollmentStepLayoutProps) {
  const accountInfoQuery = useAccountInfoQuery();
  const stepState = resolveEnrollmentStepState(accountInfoQuery.data);
  const definition = getEnrollmentStepDefinition(step);
  const backHref = step > 1 ? `/enrollment/step-${step - 1}` : "/dashboard";

  return (
    <div className="mx-auto w-full max-w-5xl pt-24 pb-16 sm:pt-28 lg:pt-32">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <Button asChild size="sm" variant="outline">
          <Link href={backHref}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            <span>Back</span>
          </Link>
        </Button>

        <p className="text-muted-foreground text-xs font-medium tracking-[0.08em] uppercase">
          Step {step} of {enrollmentTotalSteps}
        </p>
      </header>

      <EnrollmentStepEntrance className="mt-6 sm:mt-8">
        <EnrollmentStepper currentStep={step} stepState={stepState} />

        {/* Elevated form card the active folder tab merges into. Top-left
            corner stays square where the first tab attaches. */}
        <div
          className="border-border bg-surface relative rounded-b-2xl rounded-tr-2xl border p-6 shadow-[0_28px_56px_-40px_rgba(31,30,28,0.35),0_10px_24px_-20px_rgba(31,30,28,0.25)] sm:p-8 lg:p-10"
          data-slot="enrollment-step-card"
        >
          {definition ? (
            <div className="max-w-3xl">
              <h1 className="text-foreground text-[1.55rem] leading-tight font-semibold tracking-tight sm:text-[1.9rem]">
                {definition.step}. {definition.headingTitle}
              </h1>
              <p className="text-muted-foreground mt-2 text-[0.92rem] leading-6">
                {definition.description}
              </p>
            </div>
          ) : null}

          <div className={definition ? "mt-7 sm:mt-9" : undefined}>
            {children}
          </div>
        </div>
      </EnrollmentStepEntrance>
    </div>
  );
}

type EnrollmentStepFooterProps = Readonly<{
  backDisabled?: boolean;
  backHref?: string;
  children: ReactNode;
  className?: string;
}>;

/**
 * Footer band for a step form: a full-bleed, softly tinted row pinned to the
 * bottom of the elevated card (negative margins match the card padding),
 * divided from the fields by a hairline border — outlined "Back" pill on the
 * left (when given a target), the step's primary teal action(s) on the right.
 */
export function EnrollmentStepFooter({
  backDisabled = false,
  backHref,
  children,
  className,
}: EnrollmentStepFooterProps) {
  return (
    <div
      className={cn(
        "border-border bg-surface-muted/50 mt-10 flex flex-col-reverse gap-3 rounded-b-[calc(1rem-1px)] border-t px-6 py-5 sm:flex-row sm:items-center sm:px-8 sm:py-6 lg:px-10",
        // Bleed to the card edges (mirrors the card's p-6 sm:p-8 lg:p-10).
        "-mx-6 -mb-6 sm:-mx-8 sm:-mb-8 lg:-mx-10 lg:-mb-10",
        backHref ? "sm:justify-between" : "sm:justify-end",
        className,
      )}
      data-slot="enrollment-step-footer"
    >
      {backHref ? (
        backDisabled ? (
          <Button
            className="min-w-[8rem]"
            disabled
            leftIcon={<ArrowLeft />}
            size="lg"
            type="button"
            variant="outline"
          >
            Back
          </Button>
        ) : (
          <Button asChild className="min-w-[8rem]" size="lg" variant="outline">
            <Link href={backHref}>
              <ArrowLeft aria-hidden="true" className="size-5" />
              <span>Back</span>
            </Link>
          </Button>
        )
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {children}
      </div>
    </div>
  );
}
