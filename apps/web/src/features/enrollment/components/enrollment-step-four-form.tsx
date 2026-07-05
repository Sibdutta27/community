"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type ChangeEvent } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { EnrollmentStepFooter } from "@/features/enrollment/components/enrollment-step-layout";
import {
  accountQueryKeys,
  enrollmentQueryKeys,
  useEnrollmentStepFourDocumentListQuery,
  useEnrollmentStepFourNextMutation,
  useEnrollmentDocumentUploadMutation,
} from "@/features/enrollment/lib/enrollment-queries";
import {
  buildEnrollmentStepFourDocumentMap,
  enrollmentStepFourEvidenceUploadSlots,
  enrollmentStepFourUserPhotoCard,
  formatEnrollmentDocumentFileSize,
  formatEnrollmentDocumentStatus,
  getEnrollmentDocumentDisplayName,
  getEnrollmentStepFourFileValidationError,
  getEnrollmentStepFourSlotPolicy,
  type EnrollmentStepFourSlotPolicy,
  type EnrollmentStepFourUploadSlotId,
} from "@/features/enrollment/lib/enrollment-step-four-form";
import type { EnrollmentDocumentRecord } from "@/types/enrollment";

/**
 * The concrete slot definitions (literal ids) so the message-catalog keys
 * derived from `slot.id` stay statically checked.
 */
type UploadSlot =
  | typeof enrollmentStepFourUserPhotoCard
  | (typeof enrollmentStepFourEvidenceUploadSlots)[number];

type UploadTarget = Readonly<{
  slot: UploadSlot;
}>;

function UploadedDocumentRow({
  document,
}: Readonly<{
  document: EnrollmentDocumentRecord;
}>) {
  const t = useTranslations("enrollment.stepFour");

  return (
    <div className="border-border bg-surface flex flex-col gap-2 rounded-xl border px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-foreground truncate text-[0.83rem] font-semibold tracking-tight">
          {getEnrollmentDocumentDisplayName(document.fileName) ||
            t("unnamedDocument")}
        </p>
        <p className="text-muted-foreground mt-0.5 text-[0.73rem]">
          {formatEnrollmentDocumentFileSize(document.fileSize)} ·{" "}
          {t("uploadedOn", {
            date: new Date(document.uploadedAt).toLocaleDateString(),
          })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="border-border bg-surface-muted text-foreground rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.04em] uppercase">
          {formatEnrollmentDocumentStatus(document.status)}
        </span>
        <a
          className="border-border text-foreground hover:bg-surface-muted bg-surface rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.04em] uppercase transition-colors"
          href={document.url}
          rel="noreferrer"
          target="_blank"
        >
          {t("view")}
        </a>
      </div>
    </div>
  );
}

function UploadDropArea({
  disabled,
  multiple = false,
  onChange,
  onOpen,
  policy,
  refSetter,
  slotId,
  uploading,
}: Readonly<{
  disabled: boolean;
  multiple?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpen: (slotId: EnrollmentStepFourUploadSlotId) => void;
  policy: EnrollmentStepFourSlotPolicy;
  refSetter: (element: HTMLInputElement | null) => void;
  slotId: EnrollmentStepFourUploadSlotId;
  uploading: boolean;
}>) {
  const t = useTranslations("enrollment.stepFour");
  // Locale-neutral format tokens plus the localized size-cap badge.
  const badges = [
    ...policy.formatBadges,
    t("maxFileSize", { size: policy.maxFileSizeLabel }),
  ];

  return (
    <>
      <input
        accept={policy.accept}
        className="sr-only"
        multiple={multiple}
        onChange={onChange}
        ref={refSetter}
        type="file"
      />

      <button
        className="border-border bg-surface-muted hover:bg-surface mt-3 flex min-h-[9.5rem] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-5 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        disabled={disabled}
        onClick={() => onOpen(slotId)}
        type="button"
      >
        <Image
          alt=""
          aria-hidden="true"
          height={48}
          src="/icons/enrollment/file-upload.svg"
          width={48}
        />
        <span className="text-muted-foreground mt-2 text-[0.88rem] font-semibold underline underline-offset-2">
          {uploading ? t("uploading") : t("clickToUpload")}
        </span>
      </button>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {badges.map((badge) => (
          <span
            className="bg-surface-muted text-muted-foreground rounded-md px-2 py-1 text-[0.62rem] font-semibold tracking-[0.04em] uppercase"
            key={`${slotId}-${badge}`}
          >
            {badge}
          </span>
        ))}
      </div>
    </>
  );
}

export function EnrollmentStepFourForm() {
  const t = useTranslations("enrollment");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const queryClient = useQueryClient();
  const documentListQuery = useEnrollmentStepFourDocumentListQuery();
  const uploadMutation = useEnrollmentDocumentUploadMutation();
  const stepFourNextMutation = useEnrollmentStepFourNextMutation();
  const inputRefs = useRef<
    Partial<Record<EnrollmentStepFourUploadSlotId, HTMLInputElement | null>>
  >({});
  const [activeUploadSlotId, setActiveUploadSlotId] =
    useState<EnrollmentStepFourUploadSlotId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const documentListErrorMessage =
    !documentListQuery.data && documentListQuery.error instanceof Error
      ? documentListQuery.error.message
      : null;

  const documentMap = useMemo(
    () => buildEnrollmentStepFourDocumentMap(documentListQuery.data),
    [documentListQuery.data],
  );

  const userPhotoDocument = documentMap.USER_PHOTO[0] ?? null;
  const hasMandatoryDocuments = Boolean(userPhotoDocument);

  const isListLoading = documentListQuery.isPending && !documentListQuery.data;

  const openPicker = (slotId: EnrollmentStepFourUploadSlotId) => {
    inputRefs.current[slotId]?.click();
  };

  const handleUpload = async ({ slot }: UploadTarget, file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = getEnrollmentStepFourFileValidationError(
      file,
      slot.documentType,
    );

    if (validationError) {
      setErrorMessage(
        validationError.code === "EMPTY_FILE"
          ? t("validation.emptyFile")
          : t("validation.fileNotAccepted", {
              formats: validationError.formats,
              maxSize: validationError.maxSize,
            }),
      );
      return;
    }

    setActiveUploadSlotId(slot.id as EnrollmentStepFourUploadSlotId);

    try {
      const uploadResponse = await uploadMutation.mutateAsync({
        documentType: slot.documentType,
        file,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: enrollmentQueryKeys.stepFourDocumentList,
        }),
        queryClient.invalidateQueries({
          queryKey: accountQueryKeys.info,
        }),
      ]);

      setSuccessMessage(
        uploadResponse.message ||
          t("stepFour.uploadSuccess", {
            slot: t(`stepFour.slots.${slot.id}.title`),
          }),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : tErrors("documentUpload"),
      );
    } finally {
      setActiveUploadSlotId(null);
    }
  };

  const handleContinueToConfirmation = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await stepFourNextMutation.mutateAsync();

      if (!result.success) {
        setErrorMessage(t("stepFour.photoMissing"));
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: accountQueryKeys.info,
      });

      router.push("/enrollment/step-5");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : tErrors("stepFourNext"),
      );
    }
  };

  const createInputChangeHandler =
    (target: UploadTarget) => async (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files
        ? Array.from(event.target.files)
        : [];

      // Allow selecting the same file again in a later attempt.
      event.target.value = "";

      if (selectedFiles.length === 0) {
        return;
      }

      const filesToUpload = target.slot.isSingle
        ? [selectedFiles[0]]
        : selectedFiles;

      for (const file of filesToUpload) {
        if (file) {
          await handleUpload(target, file);
        }
      }
    };

  return (
    <div className="space-y-8 sm:space-y-9">
      {documentListErrorMessage ? (
        <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
          {documentListErrorMessage} {t("stepFour.refreshNotice")}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5">
          {successMessage}
        </div>
      ) : null}

      <p className="text-muted-foreground max-w-3xl text-[0.95rem] leading-7">
        {t("stepFour.intro")}
      </p>

      <section>
        <h2 className="text-foreground text-[1.2rem] font-semibold tracking-tight sm:text-[1.35rem]">
          {t("stepFour.requiredDocument")}
        </h2>
        <div className="mt-4 sm:mt-5">
          <section className="border-border bg-surface rounded-2xl border px-5 py-5 sm:px-6 sm:py-6">
            <h3 className="text-foreground text-[1.35rem] leading-tight font-semibold tracking-tight">
              {t(`stepFour.slots.${enrollmentStepFourUserPhotoCard.id}.title`)}
              <span className="text-foreground"> *</span>
            </h3>
            <p className="text-muted-foreground mt-2 text-[0.9rem] leading-7">
              {t(
                `stepFour.slots.${enrollmentStepFourUserPhotoCard.id}.description`,
              )}
            </p>

            <UploadDropArea
              disabled={uploadMutation.isPending}
              onChange={createInputChangeHandler({
                slot: enrollmentStepFourUserPhotoCard,
              })}
              onOpen={openPicker}
              policy={getEnrollmentStepFourSlotPolicy(
                enrollmentStepFourUserPhotoCard.documentType,
              )}
              refSetter={(element) => {
                inputRefs.current[enrollmentStepFourUserPhotoCard.id] = element;
              }}
              slotId={enrollmentStepFourUserPhotoCard.id}
              uploading={
                uploadMutation.isPending &&
                activeUploadSlotId === enrollmentStepFourUserPhotoCard.id
              }
            />

            <div className="mt-4">
              {userPhotoDocument ? (
                <UploadedDocumentRow document={userPhotoDocument} />
              ) : (
                <p className="text-muted-foreground text-[0.8rem]">
                  {t("stepFour.noFileUploaded")}
                </p>
              )}
            </div>
          </section>
        </div>
      </section>

      <section>
        <h2 className="text-foreground text-[1.2rem] font-semibold tracking-tight sm:text-[1.35rem]">
          {t("stepFour.supportingEvidence")}
        </h2>
        <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 xl:grid-cols-2">
          {enrollmentStepFourEvidenceUploadSlots.map((slot) => {
            const slotDocuments = documentMap[slot.documentType];
            const slotPolicy = getEnrollmentStepFourSlotPolicy(
              slot.documentType,
            );
            const isUploading =
              uploadMutation.isPending && activeUploadSlotId === slot.id;

            return (
              <section
                className="border-border bg-surface rounded-2xl border px-5 py-5 sm:px-6 sm:py-6"
                key={slot.id}
              >
                <h3 className="text-foreground text-[1.35rem] leading-tight font-semibold tracking-tight">
                  {t(`stepFour.slots.${slot.id}.title`)}
                </h3>
                <p className="text-muted-foreground mt-2 text-[0.9rem] leading-7">
                  {t(`stepFour.slots.${slot.id}.description`)}
                </p>

                <UploadDropArea
                  disabled={uploadMutation.isPending}
                  multiple
                  onChange={createInputChangeHandler({ slot })}
                  onOpen={openPicker}
                  policy={slotPolicy}
                  refSetter={(element) => {
                    inputRefs.current[slot.id] = element;
                  }}
                  slotId={slot.id}
                  uploading={isUploading}
                />

                <div className="mt-4 space-y-2.5">
                  {slotDocuments.length > 0 ? (
                    slotDocuments.map((document) => (
                      <UploadedDocumentRow
                        document={document}
                        key={document.id}
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-[0.8rem]">
                      {t("stepFour.noFilesUploaded")}
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {!hasMandatoryDocuments && !isListLoading ? (
        <p className="text-muted-foreground text-[0.88rem] leading-6">
          {t("stepFour.missingRequired")}
        </p>
      ) : null}

      <EnrollmentStepFooter
        backDisabled={uploadMutation.isPending}
        backHref="/enrollment/step-3"
        // Documents are already persisted per upload, so "Save & finish
        // later" only needs to return to the dashboard.
        onSaveDraft={() => {
          router.push("/dashboard?draftSaved=1");
        }}
        saveDraftDisabled={uploadMutation.isPending}
      >
        <Button
          disabled={isListLoading || uploadMutation.isPending}
          leftIcon={<RefreshCw />}
          loading={documentListQuery.isRefetching}
          loadingText={t("actions.refreshing")}
          onClick={() => {
            void documentListQuery.refetch();
          }}
          size="lg"
          type="button"
          variant="outline"
        >
          {t("actions.refreshFiles")}
        </Button>

        <Button
          className="min-w-[10rem]"
          disabled={
            isListLoading ||
            uploadMutation.isPending ||
            stepFourNextMutation.isPending ||
            !hasMandatoryDocuments
          }
          loading={stepFourNextMutation.isPending}
          loadingText={t("actions.saving")}
          onClick={() => {
            void handleContinueToConfirmation();
          }}
          rightIcon={<ArrowRight />}
          size="lg"
          type="button"
        >
          {t("actions.next")}
        </Button>
      </EnrollmentStepFooter>
    </div>
  );
}
