"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, PenLine, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { EnrollmentConsentSummary } from "@/features/enrollment/components/enrollment-consent-summary";
import {
  EnrollmentDateField,
  EnrollmentInputField,
} from "@/features/enrollment/components/enrollment-form-fields";
import { EnrollmentStepFooter } from "@/features/enrollment/components/enrollment-step-layout";
import { EnrollmentStepSection } from "@/features/enrollment/components/enrollment-step-section";
import {
  getIncompleteEnrollmentSteps,
  resolveEnrollmentStepState,
} from "@/features/enrollment/config/enrollment-steps";
import {
  accountQueryKeys,
  useAccountInfoQuery,
  useCompleteEnrollmentMutation,
} from "@/features/enrollment/lib/enrollment-queries";
import {
  createEnrollmentConfirmationSchema,
  getEnrollmentConfirmationDefaultValues,
  getEnrollmentSubmitDocumentErrorKey,
  mapEnrollmentConfirmationFormToPayload,
  type EnrollmentConfirmationFormValues,
  type EnrollmentSubmitDocumentErrorKey,
} from "@/features/enrollment/lib/enrollment-confirmation-form";

export function EnrollmentConfirmationForm() {
  const t = useTranslations("enrollment");
  const tValidation = useTranslations("enrollment.validation");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const queryClient = useQueryClient();
  const accountInfoQuery = useAccountInfoQuery();
  const completeEnrollmentMutation = useCompleteEnrollmentMutation();

  // The backend rejects submission until steps 1-4 are complete
  // (`allStepsCompleted`); mirror that here so the Submit button is only
  // enabled once every required step is done.
  const stepState = resolveEnrollmentStepState(accountInfoQuery.data);
  const incompleteSteps = getIncompleteEnrollmentSteps(stepState);
  const hasIncompleteSteps = incompleteSteps.length > 0;
  // The consent record already returned by `/account/info` — no extra endpoint
  // exists or is needed for the read-only summary below.
  const acceptedConsents = accountInfoQuery.data?.enrollment?.consent ?? [];

  const schema = useMemo(
    () => createEnrollmentConfirmationSchema((key) => tValidation(key)),
    [tValidation],
  );

  const form = useForm<EnrollmentConfirmationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getEnrollmentConfirmationDefaultValues(),
    mode: "onTouched",
  });

  const {
    clearErrors,
    control,
    formState: { errors },
    setError,
  } = form;

  // A submit-time document rejection is the one server error the member can
  // fix themselves, so it renders localized copy plus a link back to Step 4
  // instead of the raw backend code.
  const [documentErrorKey, setDocumentErrorKey] =
    useState<EnrollmentSubmitDocumentErrorKey | null>(null);

  const onSubmit = async (values: EnrollmentConfirmationFormValues) => {
    clearErrors("root");
    setDocumentErrorKey(null);

    try {
      await completeEnrollmentMutation.mutateAsync(
        mapEnrollmentConfirmationFormToPayload(values),
      );
      await queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });
      router.push("/enrollment/success");
    } catch (error) {
      const submitDocumentErrorKey = getEnrollmentSubmitDocumentErrorKey(error);

      setDocumentErrorKey(submitDocumentErrorKey);
      setError("root", {
        type: "server",
        message: submitDocumentErrorKey
          ? tErrors(submitDocumentErrorKey)
          : error instanceof Error
            ? error.message
            : tErrors("enrollmentSubmit"),
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className="space-y-9 sm:space-y-10"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {errors.root?.message ? (
          <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
            {errors.root.message}
            {documentErrorKey ? (
              <>
                {" "}
                <Link
                  className="font-medium underline underline-offset-4"
                  href="/enrollment/step-4"
                >
                  {t("steps.4.title")}
                </Link>
              </>
            ) : null}
          </div>
        ) : null}

        <p className="text-muted-foreground max-w-3xl text-[0.95rem] leading-7">
          {t("confirmation.intro")}
        </p>

        {/* The consents were accepted once, before step 1 — this is the record
            of that, not another ask. Mirrors the admin panel's ConsentReview so
            the member sees exactly what a reviewer sees. */}
        <EnrollmentStepSection
          description={t("confirmation.consentSummary.sectionDescription")}
          icon={ShieldCheck}
          title={t("confirmation.consentSummary.sectionTitle")}
        >
          <EnrollmentConsentSummary consents={acceptedConsents} />
        </EnrollmentStepSection>

        <EnrollmentStepSection
          description={t("confirmation.sectionDescription")}
          icon={PenLine}
          title={t("confirmation.sectionTitle")}
        >
          {/* The declaration the signature is given under. Because sign-up never
              persists a terms attestation, this paragraph plus the signature
              below IS the platform's terms-of-service record — the backend
              derives `Enrollment.agreedToTerms` from a valid signature here. */}
          <p
            className="text-muted-foreground text-[0.92rem] leading-7 md:col-span-2"
            data-slot="enrollment-confirmation-declaration"
          >
            {t.rich("confirmation.declaration", {
              privacy: (chunks) => (
                <Link
                  className="text-foreground focus-visible:ring-ring rounded-sm font-medium underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  href="/privacy-policy"
                >
                  {chunks}
                </Link>
              ),
              terms: (chunks) => (
                <Link
                  className="text-foreground focus-visible:ring-ring rounded-sm font-medium underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  href="/terms-of-service"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>

          <EnrollmentInputField
            autoComplete="name"
            control={control}
            label={t("confirmation.signatureName.label")}
            name="signatureName"
            placeholder={t("confirmation.signatureName.placeholder")}
            required
          />
          <EnrollmentDateField
            control={control}
            label={t("confirmation.signatureDate.label")}
            name="signatureDate"
            placeholder={t("confirmation.signatureDate.placeholder")}
            required
          />
        </EnrollmentStepSection>

        {hasIncompleteSteps && !accountInfoQuery.isPending ? (
          <div className="border-border bg-surface text-foreground rounded-xl border px-4 py-3 text-sm sm:px-5">
            {t("confirmation.incompleteIntro")}{" "}
            {incompleteSteps.map((incompleteStep, index) => (
              <Fragment key={incompleteStep.step}>
                {index > 0 ? ", " : null}
                <Link
                  className="font-medium underline underline-offset-4"
                  href={incompleteStep.href}
                >
                  {t(
                    `steps.${String(incompleteStep.step) as "1" | "2" | "3" | "4" | "5"}.title`,
                  )}
                </Link>
              </Fragment>
            ))}{" "}
            {t("confirmation.incompleteOutro")}
          </div>
        ) : null}

        <EnrollmentStepFooter
          backDisabled={completeEnrollmentMutation.isPending}
          backHref="/enrollment/step-4"
          // Steps 1-4 are already saved server-side; the e-signature is only
          // meaningful at submission, so "Save & finish later" just returns
          // to the dashboard without submitting or validating.
          onSaveDraft={() => {
            router.push("/dashboard?draftSaved=1");
          }}
          saveDraftDisabled={completeEnrollmentMutation.isPending}
        >
          <Button
            className="min-w-[12rem]"
            disabled={
              completeEnrollmentMutation.isPending || hasIncompleteSteps
            }
            loading={completeEnrollmentMutation.isPending}
            loadingText={t("actions.submitting")}
            rightIcon={<CheckCircle2 />}
            size="lg"
            type="submit"
          >
            {t("actions.submitApplication")}
          </Button>
        </EnrollmentStepFooter>
      </form>
    </Form>
  );
}
