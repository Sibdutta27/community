"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import {
  accountQueryKeys,
  useAccountInfoQuery,
  enrollmentQueryKeys,
  useAcceptEnrollmentConsentsMutation,
  useActiveConsentsQuery,
  useStartEnrollmentMutation,
} from "@/features/dashboard/lib/enrollment-queries";
import {
  buildDashboardEnrollmentSteps,
  getEnrollmentStatusDisplay,
  resolveEnrollmentStepState,
} from "@/features/enrollment/config/enrollment-steps";
import { cn } from "@/lib/utils";

import { DashboardConsentDialog } from "./dashboard-consent-dialog";
import { EnrollmentStepCard } from "./enrollment-step-card";
import sharedStyles from "../styles/dashboard-shared.module.scss";

type DashboardEnrollmentSectionProps = Readonly<{
  eyebrow: string;
  description: string;
  applicationStatusLabel: string;
  sectionTitle: string;
}>;

export function DashboardEnrollmentSection({
  eyebrow,
  description,
  applicationStatusLabel,
  sectionTitle,
}: DashboardEnrollmentSectionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accountInfoQuery = useAccountInfoQuery();
  const activeConsentsQuery = useActiveConsentsQuery();
  const startEnrollmentMutation = useStartEnrollmentMutation();
  const acceptEnrollmentConsentsMutation =
    useAcceptEnrollmentConsentsMutation();
  const [dialogErrorMessage, setDialogErrorMessage] = useState<string | null>(
    null,
  );
  const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false);
  const [sectionErrorMessage, setSectionErrorMessage] = useState<string | null>(
    null,
  );
  const [selectedConsentIds, setSelectedConsentIds] = useState<string[]>([]);
  const hasEnrollment = Boolean(accountInfoQuery.data?.hasEnrollment);
  const resolvedStepState = resolveEnrollmentStepState(accountInfoQuery.data);

  const enrollmentSteps = buildDashboardEnrollmentSteps(resolvedStepState).map(
    (step) => {
      if (step.step !== 1 || !hasEnrollment) {
        return step;
      }

      return {
        ...step,
        ctaLabel: resolvedStepState?.["1"]
          ? "Review Step 1"
          : "Continue Step 1",
      };
    },
  );
  const stepOne = enrollmentSteps.find((step) => step.step === 1);
  const stepOneHref = stepOne?.href ?? "/enrollment/step-1";
  const activeConsents = activeConsentsQuery.data ?? [];
  const accountInfoErrorMessage =
    !accountInfoQuery.data && accountInfoQuery.error instanceof Error
      ? accountInfoQuery.error.message
      : null;
  const applicationStatusDisplay = accountInfoErrorMessage
    ? "Unavailable"
    : accountInfoQuery.isLoading
      ? "Loading..."
      : getEnrollmentStatusDisplay(
          accountInfoQuery.data?.enrollmentStatus ??
            accountInfoQuery.data?.enrollment?.status,
          accountInfoQuery.data?.hasEnrollment,
        );
  const hasAcceptedAllRequiredConsents = activeConsents.every(
    (consent) => !consent.required || selectedConsentIds.includes(consent.id),
  );
  const isPreparingStepOne =
    startEnrollmentMutation.isPending || activeConsentsQuery.isFetching;
  const isSubmittingConsent = acceptEnrollmentConsentsMutation.isPending;

  const closeConsentDialog = () => {
    if (acceptEnrollmentConsentsMutation.isPending) {
      return;
    }

    setDialogErrorMessage(null);
    setIsConsentDialogOpen(false);
    setSelectedConsentIds([]);
  };

  const handleToggleConsent = (consentId: string) => {
    setDialogErrorMessage(null);
    setSelectedConsentIds((currentSelections) =>
      currentSelections.includes(consentId)
        ? currentSelections.filter((selectedId) => selectedId !== consentId)
        : [...currentSelections, consentId],
    );
  };

  const handleStepOneNavigation = async () => {
    setSectionErrorMessage(null);
    setDialogErrorMessage(null);

    try {
      if (!hasEnrollment) {
        await startEnrollmentMutation.mutateAsync();
      }

      const consentResult = await activeConsentsQuery.refetch();

      if (consentResult.error) {
        throw consentResult.error;
      }

      queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });

      const consents = consentResult.data ?? [];

      if (consents.length === 0) {
        router.push(stepOneHref);
        return;
      }

      setSelectedConsentIds([]);
      setIsConsentDialogOpen(true);
    } catch (error) {
      setSectionErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start the enrollment flow right now.",
      );
    }
  };

  const handleAcceptConsents = async () => {
    if (!hasAcceptedAllRequiredConsents) {
      setDialogErrorMessage(
        "Please accept every required consent before continuing to Step 1.",
      );
      return;
    }

    setDialogErrorMessage(null);
    try {
      await acceptEnrollmentConsentsMutation.mutateAsync({
        acceptRequired: true,
      });

      queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.activeConsents,
      });
      queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });
      setIsConsentDialogOpen(false);
      router.push(stepOneHref);
    } catch (error) {
      setDialogErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the required consents right now.",
      );
    }
  };

  return (
    <>
      <section id="enrollment-dashboard" className={sharedStyles.sectionPanel}>
        <div className="bg-primary text-primary-foreground flex flex-col gap-3 px-4 py-5 sm:gap-5 sm:px-8 sm:py-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p
              className={cn(
                sharedStyles.headerTitle,
                "text-[1.25rem] leading-tight font-semibold sm:text-[1.75rem] lg:text-[2rem]",
              )}
            >
              {eyebrow}
            </p>
            <p className="mt-1.5 max-w-[18rem] text-[0.95rem] leading-6 text-white/82 sm:mt-2 sm:max-w-none sm:text-base">
              {description}
            </p>
          </div>

          <div className="max-w-fit self-start rounded-[20px] border border-white/14 bg-white/8 px-3.5 py-2.5 text-left lg:max-w-none lg:self-auto lg:border-transparent lg:bg-transparent lg:px-0 lg:py-1 lg:text-right">
            <p className="text-[0.7rem] font-medium tracking-[0.12em] text-white/80 uppercase sm:text-xs sm:tracking-[0.08em]">
              {applicationStatusLabel}
            </p>
            <p className="mt-1 text-[1.05rem] font-semibold text-[#f4cc4f] sm:text-sm">
              {applicationStatusDisplay}
            </p>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-8 sm:py-10">
          <h2
            className={cn(
              sharedStyles.sectionTitle,
              "text-[1.85rem] leading-tight font-semibold sm:text-2xl",
            )}
          >
            {sectionTitle}
          </h2>

          {sectionErrorMessage ? (
            <div className="mt-5 rounded-[20px] border border-[#e7c6c2] bg-[#fff3f1] px-4 py-3 text-sm font-medium text-[#9e493f]">
              {sectionErrorMessage}
            </div>
          ) : null}

          {accountInfoErrorMessage ? (
            <div className="mt-5 rounded-[20px] border border-[#e9d8aa] bg-[#fff9eb] px-4 py-3 text-sm font-medium text-[#8a6000]">
              {accountInfoErrorMessage} Current enrollment progress could not be
              loaded, so the step status may be incomplete until the dashboard
              reconnects.
            </div>
          ) : null}

          <div className="mt-5 grid gap-3.5 sm:mt-8 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
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

      <DashboardConsentDialog
        activeConsents={activeConsents}
        errorMessage={dialogErrorMessage}
        isOpen={isConsentDialogOpen}
        isSubmitting={isSubmittingConsent}
        onClose={closeConsentDialog}
        onSubmit={handleAcceptConsents}
        onToggleConsent={handleToggleConsent}
        selectedConsentIds={selectedConsentIds}
      />
    </>
  );
}
