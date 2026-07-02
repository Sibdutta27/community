"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, PenLine } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  EnrollmentCheckboxField,
  EnrollmentDateField,
  EnrollmentInputField,
} from "@/features/enrollment/components/enrollment-form-fields";
import { EnrollmentFormSection } from "@/features/enrollment/components/enrollment-form-section";
import {
  accountQueryKeys,
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
  const completeEnrollmentMutation = useCompleteEnrollmentMutation();

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
    <section className="mx-auto w-full max-w-7xl py-6 sm:py-8 lg:py-10">
      <Form {...form}>
        <form
          className="space-y-5 sm:space-y-6"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {errors.root?.message ? (
            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground sm:px-5">
              {errors.root.message}
            </div>
          ) : null}

          <div className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-muted-foreground text-[0.78rem] font-semibold tracking-[0.24em] uppercase">
              Confirmation Guidance
            </p>
            <p className="text-muted-foreground mt-2 max-w-4xl text-[0.92rem] leading-7">
              Sign with your full legal name to confirm that the information in
              your application is true and complete. Submitting sends your
              application to the council for review.
            </p>
          </div>

          <EnrollmentFormSection
            description="Type your full legal name as your electronic signature and confirm the agreements below to submit your enrollment application."
            fieldsPerRow={[2, 1, 1]}
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
              control={control}
              label="I agree to submit my information"
              name="agreeToSubmit"
            />
            <EnrollmentCheckboxField
              control={control}
              label="I agree to the terms of service"
              name="agreeToTerms"
            />
          </EnrollmentFormSection>

          <div className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-foreground text-[1.1rem] font-semibold tracking-tight">
                  Submit Application
                </h2>
                <p className="text-muted-foreground mt-1 text-[0.88rem] leading-6 sm:text-[0.92rem]">
                  Once submitted, your application is locked for council review
                  and can no longer be edited.
                </p>
              </div>

              <Button
                className="min-w-[12rem]"
                disabled={completeEnrollmentMutation.isPending}
                leftIcon={<ArrowLeft />}
                onClick={() => router.push("/enrollment/step-4")}
                size="lg"
                type="button"
                variant="outline"
              >
                Previous Step
              </Button>

              <Button
                className="min-w-[12rem]"
                disabled={completeEnrollmentMutation.isPending}
                loading={completeEnrollmentMutation.isPending}
                loadingText="Submitting..."
                rightIcon={<CheckCircle2 />}
                size="lg"
                type="submit"
              >
                Submit Application
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
