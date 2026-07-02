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
import { EnrollmentFormSection } from "@/features/enrollment/components/enrollment-form-section";
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

const enrollmentSectionIcons = {
  basic: "/icons/enrollment/basic-info.svg",
  birth: "/icons/enrollment/birth-info.svg",
  gender: "/icons/enrollment/gender-info.svg",
  additional: "/icons/enrollment/additional-info.svg",
  yucayeke: "/icons/enrollment/cultural-connection.svg",
} as const;

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
    <section className="mx-auto w-full max-w-7xl py-6 sm:py-8 lg:py-10">
      <Form {...form}>
        <form
          className="space-y-5 sm:space-y-6"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {stepOneErrorMessage ? (
            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground sm:px-5">
              {stepOneErrorMessage} You can still complete the form manually,
              but any previously saved step 1 values may not be prefilled.
            </div>
          ) : null}

          {errors.root?.message ? (
            <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground sm:px-5">
              {errors.root.message}
            </div>
          ) : null}

          <EnrollmentFormSection
            description="Please provide your legal name exactly as it appears on your government-issued identification."
            fieldsPerRow={[2]}
            footer="This name will be used across your enrollment application and your member profile."
            iconSrc={enrollmentSectionIcons.basic}
            title="Basic Information"
          >
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
          </EnrollmentFormSection>

          <EnrollmentFormSection
            description="Your date and place of birth help us verify your identity and trace your lineage."
            fieldsPerRow={[2, 2]}
            iconSrc={enrollmentSectionIcons.birth}
            title="Birth Information"
          >
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
              label="City / Town of Birth"
              name="cityOfBirth"
              placeholder="Enter city or town"
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
          </EnrollmentFormSection>

          <EnrollmentFormSection
            description="These details help us address you respectfully throughout the enrollment process."
            fieldsPerRow={[2]}
            iconSrc={enrollmentSectionIcons.gender}
            title="Sex & Gender"
          >
            <EnrollmentSelectField
              control={control}
              label="Sex"
              name="sex"
              options={enrollmentStepOneSexOptions}
              placeholder="Select your sex"
            />
            <EnrollmentSelectField
              control={control}
              label="Gender"
              name="gender"
              options={enrollmentStepOneGenderOptions}
              placeholder="Select your gender"
            />
          </EnrollmentFormSection>

          <EnrollmentFormSection
            description="Add optional background details that help us better understand your household."
            fieldsPerRow={[2]}
            iconSrc={enrollmentSectionIcons.additional}
            title="Marital Status & Occupation"
          >
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
          </EnrollmentFormSection>

          <EnrollmentFormSection
            description="Share how you identify and your connection to your Yucayeke and family."
            fieldsPerRow={[2, 1, 2]}
            iconSrc={enrollmentSectionIcons.yucayeke}
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
              className="self-center"
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
          </EnrollmentFormSection>

          <div className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-foreground text-[1.1rem] font-semibold tracking-tight">
                  Submit Step 1
                </h2>
                <p className="text-muted-foreground mt-1 text-[0.88rem] leading-6 sm:text-[0.92rem]">
                  Save your demographics to the enrollment application. You can
                  return and update this step before final submission.
                </p>
              </div>

              <Button
                className="min-w-[12rem]"
                loading={upsertMutation.isPending}
                loadingText="Saving Step 1..."
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
