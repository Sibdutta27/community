"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import {
  accountQueryKeys,
  useAccountInfoQuery,
  useStartEnrollmentMutation,
} from "@/features/dashboard/lib/enrollment-queries";
import {
  buildDashboardEnrollmentSteps,
  enrollmentOverviewHref,
  resolveEnrollmentStepState,
} from "@/features/enrollment/config/enrollment-steps";

import { EnrollmentStepCard } from "./enrollment-step-card";

const STATUS_LABEL_KEYS = {
  DRAFT: "status.draft",
  SUBMITTED: "status.submitted",
  APPROVED: "status.approved",
  REJECTED: "status.rejected",
} as const;

export function DashboardEnrollmentSection() {
  const t = useTranslations("dashboard");
  const tStepTitles = useTranslations("enrollment.steps");
  const router = useRouter();
  const queryClient = useQueryClient();
  const accountInfoQuery = useAccountInfoQuery();
  const startEnrollmentMutation = useStartEnrollmentMutation();
  const [sectionErrorMessage, setSectionErrorMessage] = useState<string | null>(
    null,
  );
  const hasEnrollment = Boolean(accountInfoQuery.data?.hasEnrollment);
  const resolvedStepState = resolveEnrollmentStepState(accountInfoQuery.data);

  const enrollmentSteps = buildDashboardEnrollmentSteps(resolvedStepState).map(
    (step) => {
      const translatedStep = {
        ...step,
        title: tStepTitles(`${step.step}.title`),
        description: t(`steps.descriptions.${step.step}`),
        ctaLabel: t("steps.cta.start", { step: step.step }),
      };

      if (translatedStep.step !== 1 || !hasEnrollment) {
        return translatedStep;
      }

      return {
        ...translatedStep,
        ctaLabel: resolvedStepState?.["1"]
          ? t("steps.cta.reviewStepOne")
          : t("steps.cta.continueStepOne"),
      };
    },
  );
  const stepOne = enrollmentSteps.find((step) => step.step === 1);
  // First-timers land on the enrollment overview (who they are enrolling with,
  // what the five steps ask for, what to have to hand, and the one consent
  // ask); members who already completed step 1 go straight to the form so
  // returning costs no extra click.
  const stepOneHref = resolvedStepState?.["1"]
    ? (stepOne?.href ?? "/enrollment/step-1")
    : enrollmentOverviewHref;
  const accountInfoErrorMessage =
    !accountInfoQuery.data && accountInfoQuery.error instanceof Error
      ? accountInfoQuery.error.message
      : null;
  const rawEnrollmentStatus =
    accountInfoQuery.data?.enrollmentStatus ??
    accountInfoQuery.data?.enrollment?.status;
  const statusLabelKey =
    typeof rawEnrollmentStatus === "string"
      ? STATUS_LABEL_KEYS[
          rawEnrollmentStatus.toUpperCase() as keyof typeof STATUS_LABEL_KEYS
        ]
      : undefined;
  const applicationStatusDisplay = accountInfoErrorMessage
    ? t("status.unavailable")
    : accountInfoQuery.isLoading
      ? t("status.loading")
      : !hasEnrollment
        ? t("status.notStarted")
        : t(statusLabelKey ?? "status.draft");
  const isPreparingStepOne = startEnrollmentMutation.isPending;

  /**
   * The dashboard no longer asks for consent — it only makes sure an
   * enrollment exists and hands the member to `/enrollment/start`, the single
   * consent surface, which decides whether anything still needs accepting.
   * Members already past step 1 skip the introduction entirely.
   */
  const handleStepOneNavigation = async () => {
    setSectionErrorMessage(null);

    try {
      if (!hasEnrollment) {
        await startEnrollmentMutation.mutateAsync();
        queryClient.invalidateQueries({ queryKey: accountQueryKeys.info });
      }

      router.push(stepOneHref);
    } catch (error) {
      setSectionErrorMessage(
        error instanceof Error ? error.message : t("errors.startFlow"),
      );
    }
  };

  return (
    <>
      {/* Hero-level enrollment-status panel: the shared elevated-surface
          recipe (hairline border + full shadow-card) with an ink header
          band — text on the band uses the background token, never raw
          white literals. */}
      <section
        id="enrollment-dashboard"
        className="border-border bg-surface shadow-card overflow-hidden rounded-2xl border"
      >
        <div className="bg-foreground text-background flex flex-col gap-3 px-4 py-5 sm:gap-5 sm:px-8 sm:py-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[1.25rem] leading-tight font-semibold tracking-tight sm:text-[1.75rem] lg:text-[2rem]">
              {t("enrollment.eyebrow")}
            </p>
            <p className="text-background/80 mt-1.5 max-w-[18rem] text-[0.95rem] leading-6 sm:mt-2 sm:max-w-none sm:text-base">
              {t("enrollment.description")}
            </p>
          </div>

          <div className="border-background/15 bg-background/10 max-w-fit self-start rounded-xl border px-3.5 py-2.5 text-left lg:max-w-none lg:self-auto lg:border-transparent lg:bg-transparent lg:px-0 lg:py-1 lg:text-right">
            <p className="text-background/80 text-[0.7rem] font-medium tracking-[0.12em] uppercase sm:text-xs sm:tracking-[0.08em]">
              {t("enrollment.applicationStatusLabel")}
            </p>
            <p className="text-background mt-1 text-[1.05rem] font-semibold sm:text-sm">
              {applicationStatusDisplay}
            </p>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-8 sm:py-10">
          <h2 className="text-foreground text-[1.85rem] leading-tight font-semibold tracking-tight sm:text-2xl">
            {t("enrollment.sectionTitle")}
          </h2>

          {sectionErrorMessage ? (
            <div
              className="border-destructive/20 bg-destructive/10 text-destructive mt-5 rounded-xl border px-4 py-3 text-sm font-medium"
              role="alert"
            >
              {sectionErrorMessage}
            </div>
          ) : null}

          {accountInfoErrorMessage ? (
            <div
              className="border-border bg-surface-muted text-foreground mt-5 rounded-xl border px-4 py-3 text-sm font-medium"
              role="status"
            >
              {accountInfoErrorMessage} {t("enrollment.accountInfoErrorSuffix")}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3.5 sm:mt-8 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {enrollmentSteps.map((step) => (
              <EnrollmentStepCard
                key={step.step}
                {...step}
                href={step.step === 1 ? undefined : step.href}
                isLoading={step.step === 1 && isPreparingStepOne}
                onAction={step.step === 1 ? handleStepOneNavigation : undefined}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
