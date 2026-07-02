"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { EnrollmentFormSection } from "@/features/enrollment/components/enrollment-form-section";
import {
  accountQueryKeys,
  enrollmentQueryKeys,
  useAccountInfoQuery,
  useEnrollmentStepThreeQuery,
  useEnrollmentStepThreeConnectionListQuery,
  useEnrollmentStepThreeUpsertMutation,
} from "@/features/enrollment/lib/enrollment-queries";
import {
  enrollmentStepThreeSchema,
  getEnrollmentStepThreeDefaultValues,
  mapEnrollmentStepThreeFormToPayload,
  type EnrollmentStepThreeFormValues,
} from "@/features/enrollment/lib/enrollment-step-three-form";

const enrollmentSectionIcons = {
  cultural: "/icons/enrollment/cultural-connection.svg",
} as const;

function toUniqueKeys(values: readonly string[]) {
  return Array.from(new Set(values));
}

export function EnrollmentStepThreeForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accountInfoQuery = useAccountInfoQuery();
  const shouldFetchStepThreePrefill = Boolean(
    accountInfoQuery.data?.enrollment?.steps?.["3"] ??
    accountInfoQuery.data?.enrollmentStep?.["3"],
  );
  const stepThreeQuery = useEnrollmentStepThreeQuery(
    shouldFetchStepThreePrefill,
  );
  const culturalConnectionListQuery =
    useEnrollmentStepThreeConnectionListQuery();
  const upsertMutation = useEnrollmentStepThreeUpsertMutation();
  const lastHydratedDefaultsRef = useRef<string | null>(null);

  const form = useForm<EnrollmentStepThreeFormValues>({
    resolver: zodResolver(enrollmentStepThreeSchema),
    defaultValues: getEnrollmentStepThreeDefaultValues(),
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
    if (!stepThreeQuery.data || isDirty) {
      return;
    }

    const nextDefaultValues = getEnrollmentStepThreeDefaultValues(
      stepThreeQuery.data,
    );
    const nextDefaultsSignature = JSON.stringify(nextDefaultValues);

    if (nextDefaultsSignature === lastHydratedDefaultsRef.current) {
      return;
    }

    reset(nextDefaultValues);
    lastHydratedDefaultsRef.current = nextDefaultsSignature;
  }, [isDirty, reset, stepThreeQuery.data]);

  const stepThreeErrorMessage =
    shouldFetchStepThreePrefill &&
    !stepThreeQuery.data &&
    stepThreeQuery.error instanceof Error
      ? stepThreeQuery.error.message
      : null;

  const culturalConnectionListErrorMessage =
    !culturalConnectionListQuery.data &&
    culturalConnectionListQuery.error instanceof Error
      ? culturalConnectionListQuery.error.message
      : null;

  const culturalConnectionOptions = culturalConnectionListQuery.data ?? [];
  const isListLoading =
    culturalConnectionListQuery.isPending && !culturalConnectionListQuery.data;
  const isSubmitDisabled =
    upsertMutation.isPending ||
    isListLoading ||
    culturalConnectionOptions.length === 0;

  const onSubmit = async (values: EnrollmentStepThreeFormValues) => {
    clearErrors("root");

    try {
      await upsertMutation.mutateAsync(
        mapEnrollmentStepThreeFormToPayload(values, culturalConnectionOptions),
      );
      reset(values);
      await queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });
      await queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.stepThreeCulturalConnection,
      });
      router.push("/enrollment/step-4");
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your step 3 cultural connection information right now.",
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
          {stepThreeErrorMessage ? (
            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground sm:px-5">
              {stepThreeErrorMessage} You can still continue, but previously
              saved step 3 values may not be prefilled.
            </div>
          ) : null}

          {culturalConnectionListErrorMessage ? (
            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground sm:px-5">
              {culturalConnectionListErrorMessage} Please refresh and try again
              before submitting Step 3.
            </div>
          ) : null}

          {errors.root?.message ? (
            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground sm:px-5">
              {errors.root.message}
            </div>
          ) : null}

          <div className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-muted-foreground text-[0.78rem] font-semibold tracking-[0.24em] uppercase">
              Cultural Connection Guidance
            </p>
            <p className="text-muted-foreground mt-2 max-w-4xl text-[0.92rem] leading-7">
              Select the traditions, practices, and cultural knowledge areas
              that reflect your family and community connection. Choose all that
              apply.
            </p>
          </div>

          <EnrollmentFormSection
            description="These selections help us understand how your family has preserved and practiced Taíno cultural heritage over generations."
            fieldsPerRow={[1]}
            footer="You can update these selections later while your enrollment remains in draft status."
            iconSrc={enrollmentSectionIcons.cultural}
            title="Cultural Connections"
          >
            <FormField
              control={control}
              name="culturalConnectionKeys"
              render={({ field }) => {
                const selectedKeys = Array.isArray(field.value)
                  ? field.value
                  : [];

                return (
                  <FormItem className="w-full max-w-none">
                    {isListLoading ? (
                      <div className="rounded-xl border border-border bg-surface-muted px-4 py-4 text-[0.92rem] font-medium text-foreground">
                        Loading cultural connection options...
                      </div>
                    ) : culturalConnectionOptions.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {culturalConnectionOptions.map((option) => {
                          const isChecked = selectedKeys.includes(option.key);
                          const optionDescription =
                            typeof option.description === "string" &&
                            option.description.trim().length > 0
                              ? option.description
                              : "Description unavailable";

                          return (
                            <label
                              className="border-border bg-surface hover:bg-surface-muted flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors"
                              key={option.key}
                            >
                              <Checkbox
                                checked={isChecked}
                                className="mt-0.5"
                                onBlur={field.onBlur}
                                onCheckedChange={(checked) => {
                                  const nextValues = checked
                                    ? toUniqueKeys([
                                        ...selectedKeys,
                                        option.key,
                                      ])
                                    : selectedKeys.filter(
                                        (key) => key !== option.key,
                                      );

                                  field.onChange(nextValues);
                                }}
                              />
                              <span className="min-w-0">
                                <span className="text-foreground block cursor-pointer text-[0.9rem] leading-6 font-medium tracking-tight">
                                  {optionDescription}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border bg-surface-muted px-4 py-4 text-[0.9rem] text-muted-foreground">
                        No cultural connection options are available right now.
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </EnrollmentFormSection>

          <div className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-foreground text-[1.1rem] font-semibold tracking-tight">
                  Submit Step 3
                </h2>
                <p className="text-muted-foreground mt-1 text-[0.88rem] leading-6 sm:text-[0.92rem]">
                  Save your cultural connection details and continue to the
                  document upload step.
                </p>
              </div>

              <Button
                className="min-w-[12rem]"
                disabled={upsertMutation.isPending}
                leftIcon={<ArrowLeft />}
                onClick={() => router.push("/enrollment/step-2")}
                size="lg"
                type="button"
                variant="outline"
              >
                Previous Step
              </Button>

              <Button
                className="min-w-[12rem]"
                disabled={isSubmitDisabled}
                loading={upsertMutation.isPending}
                loadingText="Saving Step 3..."
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
