"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Plus, Trash2, TreePine } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  EnrollmentDateField,
  EnrollmentInputField,
  EnrollmentRadioGroupField,
  EnrollmentTextareaField,
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
  emptyEnrollmentStepTwoLineageValue,
  enrollmentStepTwoLivingStatusOptions,
  enrollmentStepTwoSchema,
  getEnrollmentStepTwoDefaultValues,
  mapEnrollmentStepTwoFormToPayload,
  maternalLineageDefinitions,
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
    getValues,
    reset,
    setError,
    setValue,
  } = form;
  const includedLineages = useWatch({
    control,
    name: "includedLineages",
  });

  const resolvedIncludedLineages =
    includedLineages ?? maternalLineageDefinitions.map((_, index) => index < 2);

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

  const canAddMoreLineages = resolvedIncludedLineages.some(
    (isIncluded, index) => index >= 2 && !isIncluded,
  );

  const handleAddLineage = () => {
    const nextIndex = resolvedIncludedLineages.findIndex(
      (isIncluded, index) => index >= 2 && !isIncluded,
    );

    if (nextIndex < 0) {
      return;
    }

    const nextIncludedLineages = [...resolvedIncludedLineages];
    nextIncludedLineages[nextIndex] = true;

    setValue("includedLineages", nextIncludedLineages, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true,
    });
  };

  const handleRemoveLineage = (index: number) => {
    if (index < 2) {
      return;
    }

    const nextIncludedLineages = [...resolvedIncludedLineages];
    nextIncludedLineages[index] = false;

    const nextMaternalLineages = getValues("maternalLineages").map(
      (lineage, lineageIndex) =>
        lineageIndex === index
          ? { ...emptyEnrollmentStepTwoLineageValue }
          : lineage,
    );

    setValue("includedLineages", nextIncludedLineages, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true,
    });
    setValue("maternalLineages", nextMaternalLineages, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true,
    });
  };

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
        queryKey: enrollmentQueryKeys.stepTwoMaternalLineage,
      });
      router.push("/enrollment/step-3");
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your step 2 maternal lineage information right now.",
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
              Maternal Lineage Guidance
            </p>
            <p className="text-muted-foreground mt-2 max-w-4xl text-[0.92rem] leading-7">
              Mother and grandmother are required. Additional maternal ancestors
              can be added one by one as information becomes available. If you
              do not know the exact date of birth, leave that field blank and
              provide the approximate birth year instead.
            </p>
          </div>

          {maternalLineageDefinitions.map((lineage, index) => {
            const isRequiredLineage = index < 2;
            const isIncluded =
              isRequiredLineage || resolvedIncludedLineages[index];

            if (!isIncluded) {
              return null;
            }

            const fieldBase = `maternalLineages.${index}` as const;

            return (
              <EnrollmentFormSection
                key={lineage.relation}
                description={lineage.description}
                fieldsPerRow={[2, 2, 2, 2, 1]}
                footer="Use documented records when available, and otherwise capture the most reliable family knowledge you have."
                headerAction={
                  isRequiredLineage ? (
                    <div className="border-border bg-surface-muted text-foreground inline-flex items-center rounded-full border px-3 py-1.5 text-[0.74rem] font-semibold tracking-[0.08em] uppercase">
                      Required
                    </div>
                  ) : (
                    <Button
                      className="rounded-full"
                      leftIcon={<Trash2 />}
                      onClick={() => handleRemoveLineage(index)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Remove Lineage
                    </Button>
                  )
                }
                icon={TreePine}
                title={lineage.title}
              >
                <EnrollmentInputField
                  control={control}
                  label="Full Name"
                  name={`${fieldBase}.fullName`}
                  placeholder="Enter full name"
                  required
                />
                <EnrollmentInputField
                  control={control}
                  label="Maiden Name"
                  name={`${fieldBase}.maidenName`}
                  placeholder="Enter maiden name if known"
                />
                <EnrollmentDateField
                  control={control}
                  label="Date of Birth"
                  max={maxBirthDate}
                  name={`${fieldBase}.dateOfBirth`}
                  placeholder="Select date of birth"
                />
                <EnrollmentInputField
                  control={control}
                  inputMode="numeric"
                  label="Approximate Birth Year"
                  name={`${fieldBase}.approximateBirthYear`}
                  placeholder="1975"
                />
                <EnrollmentInputField
                  control={control}
                  label="Place of Birth"
                  name={`${fieldBase}.placeOfBirth`}
                  placeholder="City, town, or region"
                />
                <EnrollmentInputField
                  control={control}
                  label="Region of Origin"
                  name={`${fieldBase}.regionOfOrigin`}
                  placeholder="Enter region of origin"
                />
                <EnrollmentRadioGroupField
                  control={control}
                  label="Living Status"
                  name={`${fieldBase}.livingStatus`}
                  options={enrollmentStepTwoLivingStatusOptions}
                  required
                />
                <EnrollmentInputField
                  control={control}
                  label="Family Occupation"
                  name={`${fieldBase}.familyOccupation`}
                  placeholder="Teacher, farmer, homemaker"
                />
                <EnrollmentTextareaField
                  control={control}
                  label="Additional Notes"
                  name={`${fieldBase}.additionalNotes`}
                  placeholder="Record family history, oral tradition, or other lineage details"
                  rows={4}
                />
              </EnrollmentFormSection>
            );
          })}

          {canAddMoreLineages ? (
            <section className="rounded-2xl border border-dashed border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-foreground text-[1.02rem] font-semibold tracking-tight">
                    Add Another Maternal Ancestor
                  </h2>
                  <p className="text-muted-foreground mt-1 text-[0.84rem] leading-6 sm:text-[0.9rem]">
                    Continue building your maternal line with the next ancestor
                    level when you have enough family history to record it.
                  </p>
                </div>

                <Button
                  className="min-w-[12rem]"
                  leftIcon={<Plus />}
                  onClick={handleAddLineage}
                  size="md"
                  type="button"
                  variant="outline"
                >
                  Add More
                </Button>
              </div>
            </section>
          ) : null}

          <div className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-foreground text-[1.1rem] font-semibold tracking-tight">
                  Submit Step 2
                </h2>
                <p className="text-muted-foreground mt-1 text-[0.88rem] leading-6 sm:text-[0.92rem]">
                  Save your maternal lineage details and continue to the next
                  enrollment step.
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
