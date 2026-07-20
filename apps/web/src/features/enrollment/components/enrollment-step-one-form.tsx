"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Sprout } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { useEnrollmentSaveDraft } from "@/features/enrollment/components/enrollment-save-draft-context";
import { EnrollmentStepFooter } from "@/features/enrollment/components/enrollment-step-layout";
import { EnrollmentStepSection } from "@/features/enrollment/components/enrollment-step-section";
import {
  accountQueryKeys,
  enrollmentQueryKeys,
  useAccountInfoQuery,
  useEnrollmentStepOneQuery,
  useEnrollmentStepOneSaveDraftMutation,
  useEnrollmentStepOneUpsertMutation,
  useYucayekeOptionsQuery,
} from "@/features/enrollment/lib/enrollment-queries";
import {
  createEnrollmentStepOneSchema,
  enrollmentStepOneGenderValues,
  enrollmentStepOneIdentityValues,
  enrollmentStepOneMaritalStatusValues,
  enrollmentStepOneSexValues,
  enrollmentStepOneYesNoValues,
  getEnrollmentStepOneDefaultValues,
  mapEnrollmentStepOneFormToDraftPayload,
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
  const t = useTranslations("enrollment");
  const tValidation = useTranslations("enrollment.validation");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const queryClient = useQueryClient();
  const accountInfoQuery = useAccountInfoQuery();
  // Fetch the prefill whenever an enrollment exists — partial drafts
  // ("Save & finish later") must hydrate even before the step is complete.
  const shouldFetchStepOnePrefill = Boolean(
    accountInfoQuery.data?.enrollment ?? accountInfoQuery.data?.hasEnrollment,
  );
  const stepOneQuery = useEnrollmentStepOneQuery(shouldFetchStepOnePrefill);
  const upsertMutation = useEnrollmentStepOneUpsertMutation();
  const saveDraftMutation = useEnrollmentStepOneSaveDraftMutation();
  const lastHydratedDefaultsRef = useRef<string | null>(null);
  const maxBirthDate = formatDateInputValue(new Date());

  // Localized option labels — the VALUES stay the untranslated backend enums.
  const sexOptions = enrollmentStepOneSexValues.map((value) => ({
    label: t(`options.sex.${value}`),
    value,
  }));
  const genderOptions = enrollmentStepOneGenderValues.map((value) => ({
    label: t(`options.gender.${value}`),
    value,
  }));
  const maritalStatusOptions = enrollmentStepOneMaritalStatusValues.map(
    (value) => ({ label: t(`options.maritalStatus.${value}`), value }),
  );
  const identityOptions = enrollmentStepOneIdentityValues.map((value) => ({
    label: t(`options.identity.${value}`),
    value,
  }));
  const yesNoOptions = enrollmentStepOneYesNoValues.map((value) => ({
    label: t(`options.yesNo.${value}`),
    value,
  }));
  // Official yucayeke list (backend-owned; proper nouns, not translated).
  const yucayekeOptionsQuery = useYucayekeOptionsQuery();
  const yucayekeOptions = (yucayekeOptionsQuery.data?.yucayekes ?? []).map(
    (name) => ({ label: name, value: name }),
  );

  const schema = useMemo(
    () => createEnrollmentStepOneSchema((key) => tValidation(key)),
    [tValidation],
  );

  const form = useForm<EnrollmentStepOneFormValues>({
    resolver: zodResolver(schema),
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
  const gender = useWatch({
    control,
    name: "gender",
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
          error instanceof Error ? error.message : tErrors("stepOneSave"),
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
        mapEnrollmentStepOneFormToDraftPayload(form.getValues()),
      );
      await queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });
      await queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.stepOneDemographics,
      });
      router.push("/dashboard?draftSaved=1");
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error instanceof Error ? error.message : tErrors("stepOneDraftSave"),
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
        {stepOneErrorMessage ? (
          <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
            {stepOneErrorMessage} {t("prefillNotice", { step: 1 })}
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
            label={t("stepOne.fields.firstName.label")}
            name="firstName"
            placeholder={t("stepOne.fields.firstName.placeholder")}
            required
          />
          <EnrollmentInputField
            control={control}
            label={t("stepOne.fields.lastName.label")}
            name="lastName"
            placeholder={t("stepOne.fields.lastName.placeholder")}
            required
          />
          <EnrollmentInputField
            control={control}
            label={t("stepOne.fields.cityOfBirth.label")}
            name="cityOfBirth"
            placeholder={t("stepOne.fields.cityOfBirth.placeholder")}
            required
          />
          <EnrollmentDateField
            control={control}
            label={t("stepOne.fields.dateOfBirth.label")}
            max={maxBirthDate}
            name="dateOfBirth"
            placeholder={t("stepOne.fields.dateOfBirth.placeholder")}
            required
          />
          <EnrollmentInputField
            control={control}
            label={t("stepOne.fields.municipalityOfBirth.label")}
            name="municipalityOfBirth"
            placeholder={t("stepOne.fields.municipalityOfBirth.placeholder")}
            required
          />
          <EnrollmentInputField
            autoComplete="country-name"
            control={control}
            label={t("stepOne.fields.countryOfBirth.label")}
            name="countryOfBirth"
            placeholder={t("stepOne.fields.countryOfBirth.placeholder")}
            required
          />
          <EnrollmentSelectField
            control={control}
            label={t("stepOne.fields.sex.label")}
            labelInfo={t("stepOne.fields.sex.info")}
            name="sex"
            options={sexOptions}
            placeholder={t("stepOne.fields.sex.placeholder")}
          />
          <EnrollmentSelectField
            control={control}
            label={t("stepOne.fields.gender.label")}
            labelInfo={t("stepOne.fields.gender.info")}
            name="gender"
            options={genderOptions}
            placeholder={t("stepOne.fields.gender.placeholder")}
          />
          {gender === "SELF_DESCRIBE" ? (
            <EnrollmentInputField
              control={control}
              label={t("stepOne.fields.genderSelfDescribe.label")}
              name="genderSelfDescribe"
              placeholder={t("stepOne.fields.genderSelfDescribe.placeholder")}
              required
            />
          ) : null}
          <EnrollmentSelectField
            control={control}
            label={t("stepOne.fields.maritalStatus.label")}
            name="maritalStatus"
            options={maritalStatusOptions}
            placeholder={t("stepOne.fields.maritalStatus.placeholder")}
          />
          <EnrollmentInputField
            control={control}
            label={t("stepOne.fields.occupation.label")}
            name="occupation"
            placeholder={t("stepOne.fields.occupation.placeholder")}
          />
        </EnrollmentStepSection>

        <EnrollmentStepSection
          description={t("stepOne.yucayekeno.description")}
          icon={Sprout}
          title={t("stepOne.yucayekeno.title")}
        >
          <EnrollmentSelectField
            control={control}
            label={t("stepOne.yucayekeno.identity.label")}
            name="identity"
            options={identityOptions}
            placeholder={t("stepOne.yucayekeno.identity.placeholder")}
          />
          <EnrollmentSelectField
            control={control}
            disabled={yucayekeUnknown}
            label={t("stepOne.yucayekeno.yucayeke.label")}
            name="yucayeke"
            options={yucayekeOptions}
            placeholder={t("stepOne.yucayekeno.yucayeke.placeholder")}
          />
          <EnrollmentCheckboxField
            className="md:col-span-2"
            control={control}
            label={t("stepOne.yucayekeno.yucayekeUnknown")}
            name="yucayekeUnknown"
            variant="plain"
          />
          <EnrollmentRadioGroupField
            control={control}
            label={t("stepOne.yucayekeno.hasChildren")}
            name="hasChildren"
            options={yesNoOptions}
          />
          {hasChildren === "YES" ? (
            <EnrollmentRadioGroupField
              control={control}
              label={t("stepOne.yucayekeno.hasMinorChildren")}
              name="hasMinorChildren"
              options={yesNoOptions}
            />
          ) : null}
        </EnrollmentStepSection>

        <EnrollmentStepFooter
          onSaveDraft={() => {
            void handleSaveDraft();
          }}
          saveDraftDisabled={upsertMutation.isPending}
          saveDraftPending={saveDraftMutation.isPending}
        >
          <Button
            className="min-w-[10rem]"
            loading={upsertMutation.isPending}
            loadingText={t("actions.saving")}
            rightIcon={<ArrowRight />}
            size="lg"
            type="submit"
          >
            {t("actions.next")}
          </Button>
        </EnrollmentStepFooter>
      </form>
    </Form>
  );
}
