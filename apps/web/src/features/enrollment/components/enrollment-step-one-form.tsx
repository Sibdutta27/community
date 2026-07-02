"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  EnrollmentCheckboxField,
  EnrollmentDateField,
  EnrollmentInputField,
  EnrollmentRadioGroupField,
  EnrollmentSelectField,
} from "@/features/enrollment/components/enrollment-form-fields";
import { EnrollmentStepFooter } from "@/features/enrollment/components/enrollment-step-layout";
import { EnrollmentStepSection } from "@/features/enrollment/components/enrollment-step-section";
import {
  accountQueryKeys,
  enrollmentQueryKeys,
  useAccountInfoQuery,
  useEnrollmentStepOneQuery,
  useEnrollmentStepOneUpsertMutation,
} from "@/features/enrollment/lib/enrollment-queries";
import {
  enrollmentStepOneSchema,
  enrollmentStepOneGenderOptions,
  enrollmentStepOneIdentityOptions,
  enrollmentStepOneMaritalStatusOptions,
  enrollmentStepOneSexOptions,
  enrollmentStepOneYesNoOptions,
  getEnrollmentStepOneDefaultValues,
  mapEnrollmentStepOneFormToPayload,
  type EnrollmentStepOneFormValues,
} from "@/features/enrollment/lib/enrollment-step-one-form";

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function EnrollmentStepOneForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accountInfoQuery = useAccountInfoQuery();
  const shouldFetchStepOnePrefill = Boolean(
    accountInfoQuery.data?.enrollment?.steps?.["1"] ??
    accountInfoQuery.data?.enrollmentStep?.["1"],
  );
  const stepOneQuery = useEnrollmentStepOneQuery(shouldFetchStepOnePrefill);
  const upsertMutation = useEnrollmentStepOneUpsertMutation();
  const lastHydratedDefaultsRef = useRef<string | null>(null);
  const maxBirthDate = formatDateInputValue(new Date());

  const form = useForm<EnrollmentStepOneFormValues>({
    resolver: zodResolver(enrollmentStepOneSchema),
    defaultValues: getEnrollmentStepOneDefaultValues(),
    mode: "onTouched",
  });

  const {
    clearErrors,
    control,
    formState: { errors, isDirty },
    reset,
    setError,
    setValue,
  } = form;

  const yucayekeUnknown = useWatch({
    control,
    name: "yucayekeUnknown",
  });
  const hasChildren = useWatch({
    control,
    name: "hasChildren",
  });

  useEffect(() => {
    if (!stepOneQuery.data || isDirty) {
      return;
    }

    const nextDefaultValues = getEnrollmentStepOneDefaultValues(
      stepOneQuery.data,
    );
    const nextDefaultsSignature = JSON.stringify(nextDefaultValues);

    if (nextDefaultsSignature === lastHydratedDefaultsRef.current) {
      return;
    }

    reset(nextDefaultValues);
    lastHydratedDefaultsRef.current = nextDefaultsSignature;
  }, [isDirty, reset, stepOneQuery.data]);

  useEffect(() => {
    if (yucayekeUnknown) {
      setValue("yucayeke", "", {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [setValue, yucayekeUnknown]);

  const stepOneErrorMessage =
    shouldFetchStepOnePrefill &&
    !stepOneQuery.data &&
    stepOneQuery.error instanceof Error
      ? stepOneQuery.error.message
      : null;

  const onSubmit = async (values: EnrollmentStepOneFormValues) => {
    clearErrors("root");

    try {
      await upsertMutation.mutateAsync(
        mapEnrollmentStepOneFormToPayload(values),
      );
      reset(values);
      await queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });
      await queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.stepOneDemographics,
      });
      router.push("/enrollment/step-2");
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your step 1 demographics right now.",
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
        {stepOneErrorMessage ? (
          <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
            {stepOneErrorMessage} You can still complete the form manually, but
            any previously saved step 1 values may not be prefilled.
          </div>
        ) : null}

        {errors.root?.message ? (
          <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
            {errors.root.message}
          </div>
        ) : null}

        <EnrollmentStepSection>
          <EnrollmentInputField
            control={control}
            label="First Name"
            name="firstName"
            placeholder="Enter your first name"
            required
          />
          <EnrollmentInputField
            control={control}
            label="Last Name"
            name="lastName"
            placeholder="Enter your last name"
            required
          />
          <EnrollmentInputField
            control={control}
            label="City / Town of Birth"
            name="cityOfBirth"
            placeholder="Enter city or town"
            required
          />
          <EnrollmentDateField
            control={control}
            label="Date of Birth"
            max={maxBirthDate}
            name="dateOfBirth"
            placeholder="Select date of birth"
            required
          />
          <EnrollmentInputField
            control={control}
            label="Municipality of Birth"
            name="municipalityOfBirth"
            placeholder="Enter municipality"
            required
          />
          <EnrollmentInputField
            autoComplete="country-name"
            control={control}
            label="Country of Birth"
            name="countryOfBirth"
            placeholder="Enter country of birth"
            required
          />
          <EnrollmentSelectField
            control={control}
            label="Sex"
            labelInfo="Sex assigned at birth"
            name="sex"
            options={enrollmentStepOneSexOptions}
            placeholder="Select your sex"
          />
          <EnrollmentSelectField
            control={control}
            label="Gender"
            labelInfo="Gender identity"
            name="gender"
            options={enrollmentStepOneGenderOptions}
            placeholder="Select your gender"
          />
          <EnrollmentSelectField
            control={control}
            label="Marital Status"
            name="maritalStatus"
            options={enrollmentStepOneMaritalStatusOptions}
            placeholder="Select marital status"
          />
          <EnrollmentInputField
            control={control}
            label="Occupation"
            name="occupation"
            placeholder="Enter occupation"
          />
        </EnrollmentStepSection>

        <EnrollmentStepSection
          description="Share how you identify and your connection to your Yucayeke and family."
          title="Your Yucayekeno Information"
        >
          <EnrollmentSelectField
            control={control}
            label="Identity"
            name="identity"
            options={enrollmentStepOneIdentityOptions}
            placeholder="Select your identity"
          />
          <EnrollmentInputField
            control={control}
            label="Yucayeke"
            name="yucayeke"
            placeholder="Enter your Yucayeke"
            readOnly={yucayekeUnknown}
          />
          <EnrollmentCheckboxField
            className="md:col-span-2"
            control={control}
            label="I don't know my Yucayeke"
            name="yucayekeUnknown"
            variant="plain"
          />
          <EnrollmentRadioGroupField
            control={control}
            label="Do you have children?"
            name="hasChildren"
            options={enrollmentStepOneYesNoOptions}
          />
          {hasChildren === "YES" ? (
            <EnrollmentRadioGroupField
              control={control}
              label="Any children under 18?"
              name="hasMinorChildren"
              options={enrollmentStepOneYesNoOptions}
            />
          ) : null}
        </EnrollmentStepSection>

        <EnrollmentStepFooter>
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
