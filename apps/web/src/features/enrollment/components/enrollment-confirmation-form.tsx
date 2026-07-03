"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, PenLine } from "lucide-react";
import { Fragment } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  EnrollmentCheckboxField,
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
  enrollmentConfirmationSchema,
  getEnrollmentConfirmationDefaultValues,
  mapEnrollmentConfirmationFormToPayload,
  type EnrollmentConfirmationFormValues,
} from "@/features/enrollment/lib/enrollment-confirmation-form";

export function EnrollmentConfirmationForm() {
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

  const form = useForm<EnrollmentConfirmationFormValues>({
    resolver: zodResolver(enrollmentConfirmationSchema),
    defaultValues: getEnrollmentConfirmationDefaultValues(),
    mode: "onTouched",
  });

  const {
    clearErrors,
    control,
    formState: { errors },
    setError,
  } = form;

  const onSubmit = async (values: EnrollmentConfirmationFormValues) => {
    clearErrors("root");

    try {
      await completeEnrollmentMutation.mutateAsync(
        mapEnrollmentConfirmationFormToPayload(values),
      );
      await queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });
      router.push("/enrollment/success");
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit your enrollment application right now.",
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
          </div>
        ) : null}

        <p className="text-muted-foreground max-w-3xl text-[0.95rem] leading-7">
          Sign with your full legal name to confirm that the information in your
          application is true and complete. Submitting sends your application to
          the council for review.
        </p>

        <EnrollmentStepSection
          description="Type your full legal name as your electronic signature and confirm the agreements below to submit your enrollment application."
          icon={PenLine}
          title="E-Signature"
        >
          <EnrollmentInputField
            autoComplete="name"
            control={control}
            label="Sign your full legal name"
            name="signatureName"
            placeholder="Full legal name"
            required
          />
          <EnrollmentDateField
            control={control}
            label="Date"
            name="signatureDate"
            placeholder="Signature date"
            required
          />
          <EnrollmentCheckboxField
            className="md:col-span-2"
            control={control}
            label="I agree to submit my information"
            name="agreeToSubmit"
          />
          <EnrollmentCheckboxField
            className="md:col-span-2"
            control={control}
            label="I agree to the terms of service"
            name="agreeToTerms"
          />
        </EnrollmentStepSection>

        {hasIncompleteSteps && !accountInfoQuery.isPending ? (
          <div className="border-border bg-surface text-foreground rounded-xl border px-4 py-3 text-sm sm:px-5">
            Almost there — finish:{" "}
            {incompleteSteps.map((incompleteStep, index) => (
              <Fragment key={incompleteStep.step}>
                {index > 0 ? ", " : null}
                <Link
                  className="font-medium underline underline-offset-4"
                  href={incompleteStep.href}
                >
                  {incompleteStep.title}
                </Link>
              </Fragment>
            ))}{" "}
            before submitting your application.
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
            loadingText="Submitting..."
            rightIcon={<CheckCircle2 />}
            size="lg"
            type="submit"
          >
            Submit Application
          </Button>
        </EnrollmentStepFooter>
      </form>
    </Form>
  );
}
