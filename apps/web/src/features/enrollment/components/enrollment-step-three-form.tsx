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
import { EnrollmentStepFooter } from "@/features/enrollment/components/enrollment-step-layout";
import { EnrollmentStepSection } from "@/features/enrollment/components/enrollment-step-section";
import {
  accountQueryKeys,
  enrollmentQueryKeys,
  useAccountInfoQuery,
  useEnrollmentStepThreeQuery,
  useEnrollmentStepThreeSaveDraftMutation,
  useEnrollmentStepThreeUpsertMutation,
} from "@/features/enrollment/lib/enrollment-queries";
import {
  enrollmentKinshipYesNoOptions,
  enrollmentStepThreeSchema,
  getEnrollmentStepThreeDefaultValues,
  mapEnrollmentStepThreeFormToDraftPayload,
  mapEnrollmentStepThreeFormToPayload,
  paternalKinshipDefinitions,
  type EnrollmentStepThreeFormValues,
} from "@/features/enrollment/lib/enrollment-step-three-form";

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function EnrollmentStepThreeForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accountInfoQuery = useAccountInfoQuery();
  // Fetch the prefill whenever an enrollment exists — partial drafts
  // ("Save & finish later") must hydrate even before the step is complete.
  const shouldFetchStepThreePrefill = Boolean(
    accountInfoQuery.data?.enrollment ?? accountInfoQuery.data?.hasEnrollment,
  );
  const stepThreeQuery = useEnrollmentStepThreeQuery(
    shouldFetchStepThreePrefill,
  );
  const upsertMutation = useEnrollmentStepThreeUpsertMutation();
  const saveDraftMutation = useEnrollmentStepThreeSaveDraftMutation();
  const lastHydratedDefaultsRef = useRef<string | null>(null);
  const maxBirthDate = formatDateInputValue(new Date());

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

  const onSubmit = async (values: EnrollmentStepThreeFormValues) => {
    clearErrors("root");

    try {
      await upsertMutation.mutateAsync(
        mapEnrollmentStepThreeFormToPayload(values),
      );
      reset(values);
      await queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });
      await queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.stepThreePaternalKinship,
      });
      router.push("/enrollment/step-4");
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your step 3 paternal kinship information right now.",
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
        mapEnrollmentStepThreeFormToDraftPayload(form.getValues()),
      );
      await queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });
      await queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.stepThreePaternalKinship,
      });
      router.push("/dashboard?draftSaved=1");
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your step 3 progress right now.",
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
        {stepThreeErrorMessage ? (
          <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
            {stepThreeErrorMessage} You can still complete the form manually,
            but any previously saved step 3 values may not be prefilled.
          </div>
        ) : null}

        {errors.root?.message ? (
          <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
            {errors.root.message}
          </div>
        ) : null}

        <p className="text-muted-foreground max-w-3xl text-[0.95rem] leading-7">
          Record what you know about your father and paternal grandparents.
          Every field is optional — share the most reliable family knowledge you
          have, and leave anything unknown blank.
        </p>

        {paternalKinshipDefinitions.map((ancestor) => (
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
            {ancestor.key === "father" ? (
              <EnrollmentDateField
                control={control}
                label="Date of Birth"
                max={maxBirthDate}
                name="father.dateOfBirth"
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
          backHref="/enrollment/step-2"
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
