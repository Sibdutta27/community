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
  EnrollmentTextareaField,
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
  enrollmentStepOneMaritalStatusOptions,
  enrollmentStepOnePhoneTypeOptions,
  getEnrollmentStepOneDefaultValues,
  mapEnrollmentStepOneFormToPayload,
  type EnrollmentStepOneFormValues,
} from "@/features/enrollment/lib/enrollment-step-one-form";

const enrollmentSectionIcons = {
  basic: "/icons/enrollment/basic-info.svg",
  birth: "/icons/enrollment/birth-info.svg",
  gender: "/icons/enrollment/gender-info.svg",
  contact: "/icons/enrollment/contact-info.svg",
  address: "/icons/enrollment/address-info.svg",
  emergency: "/icons/enrollment/emergency-contact.svg",
  additional: "/icons/enrollment/additional-info.svg",
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

  const sameAsCurrentAddress = useWatch({
    control,
    name: "sameAsCurrentAddress",
  });
  const currentAddress = useWatch({
    control,
    name: "currentAddress",
  });
  const mailingAddress = useWatch({
    control,
    name: "mailingAddress",
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
    if (!sameAsCurrentAddress) {
      return;
    }

    const nextMailingAddress = currentAddress ?? {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    };
    const currentMailingAddress = mailingAddress ?? nextMailingAddress;

    if (
      nextMailingAddress.street === currentMailingAddress.street &&
      nextMailingAddress.city === currentMailingAddress.city &&
      nextMailingAddress.state === currentMailingAddress.state &&
      nextMailingAddress.zipCode === currentMailingAddress.zipCode &&
      nextMailingAddress.country === currentMailingAddress.country
    ) {
      return;
    }

    setValue("mailingAddress", nextMailingAddress, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [currentAddress, mailingAddress, sameAsCurrentAddress, setValue]);

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
        queryKey: enrollmentQueryKeys.stepOnePersonalInfo,
      });
      router.push("/enrollment/step-2");
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your step 1 enrollment information right now.",
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
            <div className="rounded-[22px] border border-[#e9d8aa] bg-[#fff9eb] px-4 py-3 text-sm font-medium text-[#8a6000] sm:px-5">
              {stepOneErrorMessage} You can still complete the form manually,
              but any previously saved step 1 values may not be prefilled.
            </div>
          ) : null}

          {errors.root?.message ? (
            <div className="rounded-[22px] border border-[#e7c6c2] bg-[#fff3f1] px-4 py-3 text-sm font-medium text-[#9e493f] sm:px-5">
              {errors.root.message}
            </div>
          ) : null}

          <EnrollmentFormSection
            description="Please provide your legal name exactly as it appears on your government-issued identification."
            fieldsPerRow={[2, 2, 1]}
            footer="This name will be used across your enrollment application and your member profile."
            iconSrc={enrollmentSectionIcons.basic}
            title="Basic Information"
          >
            <EnrollmentInputField
              control={control}
              label="First Name"
              name="legalName.firstName"
              placeholder="Enter your first name"
              required
            />
            <EnrollmentInputField
              control={control}
              label="Middle Name"
              name="legalName.middleName"
              placeholder="Enter your middle name"
            />
            <EnrollmentInputField
              control={control}
              label="Last Name"
              name="legalName.lastName"
              placeholder="Enter your last name"
              required
            />
            <EnrollmentInputField
              control={control}
              label="Maiden Name / Maternal Last Name"
              name="legalName.maternalLastName"
              placeholder="Enter your maternal last name"
            />
            <EnrollmentInputField
              control={control}
              label="Preferred Name"
              name="legalName.preferredName"
              placeholder="Enter your preferred name"
            />
          </EnrollmentFormSection>

          <EnrollmentFormSection
            description="Your date and place of birth help us verify your identity and trace your lineage."
            fieldsPerRow={[2, 2]}
            iconSrc={enrollmentSectionIcons.birth}
            iconWrapperClassName="bg-[#c85d57] shadow-[0_14px_28px_-22px_rgba(200,93,87,0.52)]"
            title="Birth Information"
          >
            <EnrollmentDateField
              control={control}
              label="Birth Date"
              max={maxBirthDate}
              name="birthInfo.dateOfBirth"
              placeholder="Select birth date"
              required
            />
            <EnrollmentInputField
              control={control}
              label="Country of Birth"
              name="birthInfo.countryOfBirth"
              placeholder="Enter country of birth"
              required
            />
            <EnrollmentInputField
              control={control}
              label="Birth City / Town"
              name="birthInfo.cityOfBirth"
              placeholder="Enter city or town"
              required
            />
            <EnrollmentInputField
              control={control}
              label="Municipality / Area"
              name="birthInfo.municipalityOfBirth"
              placeholder="Enter municipality or landmark"
              required
            />
          </EnrollmentFormSection>

          <EnrollmentFormSection
            description="These details help us address you respectfully throughout the enrollment process."
            fieldsPerRow={[1, 1]}
            iconSrc={enrollmentSectionIcons.gender}
            iconWrapperClassName="bg-[#4D0045] shadow-[0_14px_28px_-22px_rgba(77,0,69,0.4)]"
            title="Gender Identity"
          >
            <EnrollmentRadioGroupField
              control={control}
              label="How do you identify?"
              name="gender.gender"
              options={enrollmentStepOneGenderOptions}
              required
            />
            <EnrollmentInputField
              control={control}
              label="Pronouns"
              name="gender.pronouns"
              placeholder="he/him, she/her, they/them"
            />
          </EnrollmentFormSection>

          <EnrollmentFormSection
            description="We will use these details to contact you about your enrollment status and any required follow-up."
            fieldsPerRow={[2, 2]}
            iconSrc={enrollmentSectionIcons.contact}
            iconWrapperClassName="bg-[#1f6f8b] shadow-[0_14px_28px_-22px_rgba(31,111,139,0.52)]"
            title="Contact Information"
          >
            <EnrollmentInputField
              autoComplete="email"
              control={control}
              label="Email Address"
              name="contact.email"
              placeholder="Enter your email address"
              required
              type="email"
            />
            <EnrollmentInputField
              autoComplete="tel"
              control={control}
              inputMode="tel"
              label="Phone Number"
              name="contact.phoneNumber"
              placeholder="Enter your phone number"
              required
              type="tel"
            />
            <EnrollmentSelectField
              control={control}
              label="Phone Type"
              name="contact.phoneType"
              options={enrollmentStepOnePhoneTypeOptions}
              placeholder="Select phone type"
              required
            />
            <EnrollmentCheckboxField
              className="self-center"
              control={control}
              label="Allow SMS updates"
              name="contact.allowSMS"
              variant="plain"
            />
          </EnrollmentFormSection>

          <EnrollmentFormSection
            description="Where do you currently reside? This helps us provide location-specific services and events."
            fieldsPerRow={[2, 2, 1]}
            iconSrc={enrollmentSectionIcons.address}
            iconWrapperClassName="bg-[#FFBDBD] shadow-[0_14px_28px_-22px_rgba(255,189,189,0.42)]"
            title="Current Address"
          >
            <EnrollmentInputField
              autoComplete="address-line1"
              control={control}
              label="Street Address"
              name="currentAddress.street"
              placeholder="Enter street address"
              required
            />
            <EnrollmentInputField
              autoComplete="address-level2"
              control={control}
              label="City"
              name="currentAddress.city"
              placeholder="Enter city"
              required
            />
            <EnrollmentInputField
              autoComplete="address-level1"
              control={control}
              label="State / Province"
              name="currentAddress.state"
              placeholder="Enter state or province"
              required
            />
            <EnrollmentInputField
              autoComplete="postal-code"
              control={control}
              label="ZIP / Postal Code"
              name="currentAddress.zipCode"
              placeholder="Enter ZIP or postal code"
              required
            />
            <EnrollmentInputField
              autoComplete="country-name"
              control={control}
              label="Country"
              name="currentAddress.country"
              placeholder="Enter country"
              required
            />
          </EnrollmentFormSection>

          <EnrollmentFormSection
            description="If your mailing address differs from your current residence, include it here."
            fieldsPerRow={[2, 2, 1]}
            headerAction={
              <EnrollmentCheckboxField
                control={control}
                label="Same as Current Address"
                name="sameAsCurrentAddress"
                variant="inline"
              />
            }
            iconSrc={enrollmentSectionIcons.address}
            iconWrapperClassName="bg-[#FFBDBD] shadow-[0_14px_28px_-22px_rgba(255,189,189,0.42)]"
            title="Mailing Address"
          >
            <EnrollmentInputField
              autoComplete="address-line1"
              control={control}
              label="Street Address"
              name="mailingAddress.street"
              placeholder="Enter mailing street address"
              readOnly={sameAsCurrentAddress}
              required
            />
            <EnrollmentInputField
              autoComplete="address-level2"
              control={control}
              label="City"
              name="mailingAddress.city"
              placeholder="Enter city"
              readOnly={sameAsCurrentAddress}
              required
            />
            <EnrollmentInputField
              autoComplete="address-level1"
              control={control}
              label="State / Province"
              name="mailingAddress.state"
              placeholder="Enter state or province"
              readOnly={sameAsCurrentAddress}
              required
            />
            <EnrollmentInputField
              autoComplete="postal-code"
              control={control}
              label="ZIP / Postal Code"
              name="mailingAddress.zipCode"
              placeholder="Enter ZIP or postal code"
              readOnly={sameAsCurrentAddress}
              required
            />
            <EnrollmentInputField
              autoComplete="country-name"
              control={control}
              label="Country"
              name="mailingAddress.country"
              placeholder="Enter country"
              readOnly={sameAsCurrentAddress}
              required
            />
          </EnrollmentFormSection>

          <EnrollmentFormSection
            description="Provide someone we can contact if we are unable to reach you directly."
            fieldsPerRow={[2, 1]}
            iconSrc={enrollmentSectionIcons.emergency}
            iconWrapperClassName="bg-[#b5465e] shadow-[0_14px_28px_-22px_rgba(181,70,94,0.5)]"
            title="Emergency Contact"
          >
            <EnrollmentInputField
              control={control}
              label="Full Name"
              name="emergencyContact.fullName"
              placeholder="Enter emergency contact name"
              required
            />
            <EnrollmentInputField
              control={control}
              label="Relationship"
              name="emergencyContact.relationship"
              placeholder="Enter relationship"
              required
            />
            <EnrollmentInputField
              control={control}
              inputMode="tel"
              label="Phone Number"
              name="emergencyContact.phoneNumber"
              placeholder="Enter emergency contact phone"
              required
              type="tel"
            />
          </EnrollmentFormSection>

          <EnrollmentFormSection
            description="Add any optional background details that help us better understand your personal and community context."
            fieldsPerRow={[2, 1, 1, 1]}
            iconSrc={enrollmentSectionIcons.additional}
            iconWrapperClassName="bg-[#6d7b2e] shadow-[0_14px_28px_-22px_rgba(109,123,46,0.52)]"
            title="Additional Information"
          >
            <EnrollmentSelectField
              control={control}
              label="Marital Status"
              name="additionalInfo.maritalStatus"
              options={enrollmentStepOneMaritalStatusOptions}
              placeholder="Select marital status"
            />
            <EnrollmentInputField
              control={control}
              label="Education Level"
              name="additionalInfo.educationLevel"
              placeholder="High School, Bachelor's, Trade School"
            />
            <EnrollmentInputField
              control={control}
              label="Occupation"
              name="additionalInfo.occupation"
              placeholder="Enter occupation"
            />
            <EnrollmentInputField
              control={control}
              label="Languages Spoken"
              name="additionalInfo.languagesSpokenInput"
              placeholder="English, Spanish, Taíno"
            />
            <EnrollmentTextareaField
              control={control}
              label="Special Skills"
              name="additionalInfo.specialSkills"
              placeholder="Share any special skills, cultural knowledge, or community strengths"
              rows={4}
            />
          </EnrollmentFormSection>

          <div className="rounded-[26px] border border-[#dbe4df] bg-white px-5 py-5 shadow-[0_18px_34px_-28px_rgba(16,47,52,0.2)] sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-[1.1rem] font-semibold tracking-[-0.03em] text-[#243238]">
                  Submit Step 1
                </h2>
                <p className="mt-1 text-[0.88rem] leading-6 text-[#707773] sm:text-[0.92rem]">
                  Save your personal information to the enrollment application.
                  You can return and update this step before final submission.
                </p>
              </div>

              <Button
                className="bg-primary! min-w-[12rem] text-white! shadow-[0_18px_34px_-22px_rgba(197,49,51,0.42)] hover:bg-[#aa2a2d]! hover:text-white!"
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
