"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EnrollmentStepper } from "@/features/enrollment/components/enrollment-stepper";
import {
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
 * Shared shell for the five enrollment step pages: a light header row
 * (Back pill on the left, clickable 1-5 stepper + "En Español" on the
 * right), the big "N. Title" heading, and the step's form as children.
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
    <div className="mx-auto w-full max-w-5xl pt-8 pb-16 sm:pt-10 lg:pt-12">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <Button asChild size="sm" variant="outline">
            <Link href={backHref}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              <span>Back</span>
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <EnrollmentStepper currentStep={step} stepState={stepState} />
            {/* Placeholder language toggle — label only, no translation yet. */}
            <a
              className="text-muted-foreground hover:text-foreground text-sm font-medium underline underline-offset-4 transition-colors"
              href="?lang=es"
            >
              En Español
            </a>
          </div>
        </div>

        {definition ? (
          <h1 className="text-foreground mt-8 text-[2rem] leading-tight font-semibold tracking-tight sm:mt-10 sm:text-[2.5rem]">
            {definition.step}. {definition.headingTitle}
          </h1>
        ) : null}
      </header>

      <div className="mt-8 sm:mt-10">{children}</div>
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
 * Bottom navigation row for a step form: an outlined "Back" pill on the
 * left (when given a target) and the step's primary action(s) — passed as
 * children — on the right.
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
        "border-border mt-10 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center",
        backHref ? "sm:justify-between" : "sm:justify-end",
        className,
      )}
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
