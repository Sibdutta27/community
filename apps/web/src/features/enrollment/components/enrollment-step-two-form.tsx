"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  EnrollmentDateField,
  EnrollmentInputField,
  EnrollmentRadioGroupField,
} from "@/features/enrollment/components/enrollment-form-fields";
import { useEnrollmentSaveDraft } from "@/features/enrollment/components/enrollment-save-draft-context";
import { EnrollmentStepFooter } from "@/features/enrollment/components/enrollment-step-layout";
import { EnrollmentStepSection } from "@/features/enrollment/components/enrollment-step-section";
import {
  accountQueryKeys,
  enrollmentQueryKeys,
  useAccountInfoQuery,
  useEnrollmentStepTwoQuery,
  useEnrollmentStepTwoSaveDraftMutation,
  useEnrollmentStepTwoUpsertMutation,
} from "@/features/enrollment/lib/enrollment-queries";
import {
  enrollmentKinshipYesNoOptions,
  enrollmentStepTwoSchema,
  getEnrollmentStepTwoDefaultValues,
  mapEnrollmentStepTwoFormToDraftPayload,
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
  // Fetch the prefill whenever an enrollment exists — partial drafts
  // ("Save & finish later") must hydrate even before the step is complete.
  const shouldFetchStepTwoPrefill = Boolean(
    accountInfoQuery.data?.enrollment ?? accountInfoQuery.data?.hasEnrollment,
  );
  const stepTwoQuery = useEnrollmentStepTwoQuery(shouldFetchStepTwoPrefill);
  const upsertMutation = useEnrollmentStepTwoUpsertMutation();
  const saveDraftMutation = useEnrollmentStepTwoSaveDraftMutation();
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

  // "Save & finish later": persist whatever is currently entered as a
  // partial draft — getValues() deliberately skips validation — then return
  // to the dashboard, which confirms the save.
  const handleSaveDraft = async () => {
    clearErrors("root");

    try {
      await saveDraftMutation.mutateAsync(
        mapEnrollmentStepTwoFormToDraftPayload(form.getValues()),
      );
      await queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });
      await queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.stepTwoMaternalKinship,
      });
      router.push("/dashboard?draftSaved=1");
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your step 2 progress right now.",
      });
    }
  };

  // Mirror the footer action in the layout's top utility row — same handler,
  // same pending/disabled gating (see EnrollmentSaveDraftContext).
  useEnrollmentSaveDraft({
    disabled: upsertMutation.isPending,
    onSaveDraft: () => {
      void handleSaveDraft();
    },
    pending: saveDraftMutation.isPending,
  });

  return (
    <Form {...form}>
      <form
        className="space-y-9 sm:space-y-10"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {stepTwoErrorMessage ? (
          <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
            {stepTwoErrorMessage} You can still complete the form manually, but
            any previously saved step 2 values may not be prefilled.
          </div>
        ) : null}

        {errors.root?.message ? (
          <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
            {errors.root.message}
          </div>
        ) : null}

        <p className="text-muted-foreground max-w-3xl text-[0.95rem] leading-7">
          Record what you know about your mother and maternal grandparents.
          Every field is optional — share the most reliable family knowledge you
          have, and leave anything unknown blank.
        </p>

        {maternalKinshipDefinitions.map((ancestor) => (
          <EnrollmentStepSection
            key={ancestor.key}
            description={ancestor.description}
            icon={UserRound}
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
              className="md:col-span-2"
              control={control}
              label={ancestor.heritageQuestion}
              name={`${ancestor.key}.isBorikuaTaino`}
              options={enrollmentKinshipYesNoOptions}
            />
          </EnrollmentStepSection>
        ))}

        <EnrollmentStepFooter
          backDisabled={upsertMutation.isPending}
          backHref="/enrollment/step-1"
          onSaveDraft={() => {
            void handleSaveDraft();
          }}
          saveDraftDisabled={upsertMutation.isPending}
          saveDraftPending={saveDraftMutation.isPending}
        >
          <Button
            className="min-w-[10rem]"
            loading={upsertMutation.isPending}
            loadingText="Saving..."
            rightIcon={<ArrowRight />}
            size="lg"
            type="submit"
          >
            Next
          </Button>
        </EnrollmentStepFooter>
      </form>
    </Form>
  );
}
