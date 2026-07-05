"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
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
  createEnrollmentStepTwoSchema,
  enrollmentKinshipYesNoValues,
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
  const t = useTranslations("enrollment");
  const tValidation = useTranslations("enrollment.validation");
  const tErrors = useTranslations("errors");
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

  const yesNoOptions = enrollmentKinshipYesNoValues.map((value) => ({
    label: t(`options.yesNo.${value}`),
    value,
  }));

  const schema = useMemo(
    () => createEnrollmentStepTwoSchema((key) => tValidation(key)),
    [tValidation],
  );

  const form = useForm<EnrollmentStepTwoFormValues>({
    resolver: zodResolver(schema),
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
          error instanceof Error ? error.message : tErrors("stepTwoSave"),
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
          error instanceof Error ? error.message : tErrors("stepTwoDraftSave"),
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
            {stepTwoErrorMessage} {t("prefillNotice", { step: 2 })}
          </div>
        ) : null}

        {errors.root?.message ? (
          <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
            {errors.root.message}
          </div>
        ) : null}

        <p className="text-muted-foreground max-w-3xl text-[0.95rem] leading-7">
          {t("kinship.maternalIntro")}
        </p>

        {maternalKinshipDefinitions.map((ancestor) => (
          <EnrollmentStepSection
            key={ancestor.key}
            description={t(`kinship.ancestors.${ancestor.key}.description`)}
            icon={UserRound}
            title={t(`kinship.ancestors.${ancestor.key}.title`)}
          >
            <EnrollmentInputField
              control={control}
              label={t("kinship.fields.fullName.label")}
              name={`${ancestor.key}.name`}
              placeholder={t("kinship.fields.fullName.placeholder")}
            />
            {ancestor.key === "mother" ? (
              <EnrollmentDateField
                control={control}
                label={t("kinship.fields.dateOfBirth.label")}
                max={maxBirthDate}
                name="mother.dateOfBirth"
                placeholder={t("kinship.fields.dateOfBirth.placeholder")}
              />
            ) : null}
            <EnrollmentInputField
              control={control}
              label={t("kinship.fields.nationality.label")}
              name={`${ancestor.key}.nationality`}
              placeholder={t("kinship.fields.nationality.placeholder")}
            />
            <EnrollmentInputField
              control={control}
              label={t("kinship.fields.municipality.label")}
              name={`${ancestor.key}.municipality`}
              placeholder={t("kinship.fields.municipality.placeholder")}
            />
            <EnrollmentInputField
              control={control}
              label={t("kinship.fields.yucayeke.label")}
              name={`${ancestor.key}.yucayeke`}
              placeholder={t("kinship.fields.yucayeke.placeholder")}
            />
            <EnrollmentRadioGroupField
              className="md:col-span-2"
              control={control}
              label={t(`kinship.ancestors.${ancestor.key}.heritageQuestion`)}
              name={`${ancestor.key}.isBorikuaTaino`}
              options={yesNoOptions}
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
