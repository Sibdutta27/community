"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, TreePine } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  EnrollmentDateField,
  EnrollmentInputField,
  EnrollmentRadioGroupField,
} from "@/features/enrollment/components/enrollment-form-fields";
import { EnrollmentFormSection } from "@/features/enrollment/components/enrollment-form-section";
import {
  accountQueryKeys,
  enrollmentQueryKeys,
  useAccountInfoQuery,
  useEnrollmentStepTwoQuery,
  useEnrollmentStepTwoUpsertMutation,
} from "@/features/enrollment/lib/enrollment-queries";
import {
  enrollmentKinshipYesNoOptions,
  enrollmentStepTwoSchema,
  getEnrollmentStepTwoDefaultValues,
  mapEnrollmentStepTwoFormToPayload,
  maternalKinshipDefinitions,
  type EnrollmentStepTwoFormValues,
} from "@/features/enrollment/lib/enrollment-step-two-form";

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function EnrollmentStepTwoForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accountInfoQuery = useAccountInfoQuery();
  const shouldFetchStepTwoPrefill = Boolean(
    accountInfoQuery.data?.enrollment?.steps?.["2"] ??
    accountInfoQuery.data?.enrollmentStep?.["2"],
  );
  const stepTwoQuery = useEnrollmentStepTwoQuery(shouldFetchStepTwoPrefill);
  const upsertMutation = useEnrollmentStepTwoUpsertMutation();
  const lastHydratedDefaultsRef = useRef<string | null>(null);
  const maxBirthDate = formatDateInputValue(new Date());

  const form = useForm<EnrollmentStepTwoFormValues>({
    resolver: zodResolver(enrollmentStepTwoSchema),
    defaultValues: getEnrollmentStepTwoDefaultValues(),
    mode: "onTouched",
  });

  const {
    clearErrors,
    control,
    formState: { errors, isDirty },
    reset,
    setError,
  } = form;

  useEffect(() => {
    if (!stepTwoQuery.data || isDirty) {
      return;
    }

    const nextDefaultValues = getEnrollmentStepTwoDefaultValues(
      stepTwoQuery.data,
    );
    const nextDefaultsSignature = JSON.stringify(nextDefaultValues);

    if (nextDefaultsSignature === lastHydratedDefaultsRef.current) {
      return;
    }

    reset(nextDefaultValues);
    lastHydratedDefaultsRef.current = nextDefaultsSignature;
  }, [isDirty, reset, stepTwoQuery.data]);

  const stepTwoErrorMessage =
    shouldFetchStepTwoPrefill &&
    !stepTwoQuery.data &&
    stepTwoQuery.error instanceof Error
      ? stepTwoQuery.error.message
      : null;

  const onSubmit = async (values: EnrollmentStepTwoFormValues) => {
    clearErrors("root");

    try {
      await upsertMutation.mutateAsync(
        mapEnrollmentStepTwoFormToPayload(values),
      );
      reset(values);
      await queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });
      await queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.stepTwoMaternalKinship,
      });
      router.push("/enrollment/step-3");
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your step 2 maternal kinship information right now.",
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
          {stepTwoErrorMessage ? (
            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground sm:px-5">
              {stepTwoErrorMessage} You can still complete the form manually,
              but any previously saved step 2 values may not be prefilled.
            </div>
          ) : null}

          {errors.root?.message ? (
            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground sm:px-5">
              {errors.root.message}
            </div>
          ) : null}

          <div className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-muted-foreground text-[0.78rem] font-semibold tracking-[0.24em] uppercase">
              Maternal Kinship Guidance
            </p>
            <p className="text-muted-foreground mt-2 max-w-4xl text-[0.92rem] leading-7">
              Record what you know about your mother and maternal grandparents.
              Every field is optional — share the most reliable family
              knowledge you have, and leave anything unknown blank.
            </p>
          </div>

          {maternalKinshipDefinitions.map((ancestor) => (
            <EnrollmentFormSection
              key={ancestor.key}
              description={ancestor.description}
              fieldsPerRow={[2, 2, 1]}
              icon={TreePine}
              title={ancestor.title}
            >
              <EnrollmentInputField
                control={control}
                label="Full Name"
                name={`${ancestor.key}.name`}
                placeholder="Enter full name"
              />
              {ancestor.key === "mother" ? (
                <EnrollmentDateField
                  control={control}
                  label="Date of Birth"
                  max={maxBirthDate}
                  name="mother.dateOfBirth"
                  placeholder="Select date of birth"
                />
              ) : null}
              <EnrollmentInputField
                control={control}
                label="Nationality"
                name={`${ancestor.key}.nationality`}
                placeholder="Enter nationality"
              />
              <EnrollmentInputField
                control={control}
                label="Municipality"
                name={`${ancestor.key}.municipality`}
                placeholder="Enter municipality"
              />
              <EnrollmentInputField
                control={control}
                label="Yucayeke"
                name={`${ancestor.key}.yucayeke`}
                placeholder="Enter Yucayeke if known"
              />
              <EnrollmentRadioGroupField
                control={control}
                label={ancestor.heritageQuestion}
                name={`${ancestor.key}.isBorikuaTaino`}
                options={enrollmentKinshipYesNoOptions}
              />
            </EnrollmentFormSection>
          ))}

          <div className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-foreground text-[1.1rem] font-semibold tracking-tight">
                  Submit Step 2
                </h2>
                <p className="text-muted-foreground mt-1 text-[0.88rem] leading-6 sm:text-[0.92rem]">
                  Save your maternal kinship details and continue to the
                  paternal kinship step.
                </p>
              </div>

              <Button
                className="min-w-[12rem]"
                disabled={upsertMutation.isPending}
                leftIcon={<ArrowLeft />}
                onClick={() => router.push("/enrollment/step-1")}
                size="lg"
                type="button"
                variant="outline"
              >
                Previous Step
              </Button>

              <Button
                className="min-w-[12rem]"
                loading={upsertMutation.isPending}
                loadingText="Saving Step 2..."
                rightIcon={<ArrowRight />}
                size="lg"
                type="submit"
              >
                Save and Next
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
