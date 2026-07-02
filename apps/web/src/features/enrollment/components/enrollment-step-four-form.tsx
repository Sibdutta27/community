"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type ChangeEvent } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  accountQueryKeys,
  enrollmentQueryKeys,
  useEnrollmentStepFourDocumentListQuery,
  useEnrollmentDocumentUploadMutation,
} from "@/features/enrollment/lib/enrollment-queries";
import {
  buildEnrollmentStepFourDocumentMap,
  enrollmentStepFourAdditionalEvidenceCard,
  enrollmentStepFourLineageUploadSlots,
  enrollmentStepFourSingleUploadCards,
  enrollmentStepFourUploadAccept,
  formatEnrollmentDocumentFileSize,
  formatEnrollmentDocumentStatus,
  getEnrollmentDocumentDisplayName,
  getEnrollmentStepFourFileValidationMessage,
  type EnrollmentStepFourUploadSlotId,
} from "@/features/enrollment/lib/enrollment-step-four-form";
import { cn } from "@/lib/utils";
import type {
  EnrollmentDocumentRecord,
  EnrollmentDocumentType,
} from "@/types/enrollment";

type UploadTarget = Readonly<{
  documentType: EnrollmentDocumentType;
  slotId: EnrollmentStepFourUploadSlotId;
  title: string;
}>;

const uploadFormatBadges = ["PDF", "JPG", "PNG", "WEBP", "10 MB Max"] as const;
const requiredUploadSlotIds = new Set<EnrollmentStepFourUploadSlotId>([
  "user_photo",
  "birth_certificate",
  "mother_birth_certificate",
  "mother_photo",
  "grandmother_birth_certificate",
  "grandmother_photo",
]);

function UploadedDocumentRow({
  document,
}: Readonly<{
  document: EnrollmentDocumentRecord;
}>) {
  const normalizedStatus = document.status.toUpperCase();
  const statusClassName =
    normalizedStatus === "REJECTED"
      ? "border-border bg-surface-muted text-foreground"
      : normalizedStatus === "APPROVED"
        ? "border-border bg-surface-muted text-foreground"
        : "border-border bg-surface-muted text-foreground";

  return (
    <div className="border-border bg-surface flex flex-col gap-2 rounded-xl border px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-foreground truncate text-[0.83rem] font-semibold tracking-tight">
          {getEnrollmentDocumentDisplayName(document.fileName)}
        </p>
        <p className="text-muted-foreground mt-0.5 text-[0.73rem]">
          {formatEnrollmentDocumentFileSize(document.fileSize)} · Uploaded{" "}
          {new Date(document.uploadedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.04em] uppercase",
            statusClassName,
          )}
        >
          {formatEnrollmentDocumentStatus(document.status)}
        </span>
        <a
          className="border-border text-foreground hover:bg-surface-muted rounded-full border bg-surface px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.04em] uppercase transition-colors"
          href={document.url}
          rel="noreferrer"
          target="_blank"
        >
          View
        </a>
      </div>
    </div>
  );
}

function UploadDropArea({
  accept,
  disabled,
  multiple = false,
  onChange,
  onOpen,
  refSetter,
  slotId,
  uploading,
}: Readonly<{
  accept: string;
  disabled: boolean;
  multiple?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpen: (slotId: EnrollmentStepFourUploadSlotId) => void;
  refSetter: (element: HTMLInputElement | null) => void;
  slotId: EnrollmentStepFourUploadSlotId;
  uploading: boolean;
}>) {
  return (
    <>
      <input
        accept={accept}
        className="sr-only"
        multiple={multiple}
        onChange={onChange}
        ref={refSetter}
        type="file"
      />

      <button
        className="border-border mt-3 flex min-h-[9.5rem] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-surface-muted px-4 py-5 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
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
          {uploading ? "Uploading..." : "Click to upload"}
        </span>
      </button>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {uploadFormatBadges.map((badge) => (
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const documentListQuery = useEnrollmentStepFourDocumentListQuery();
  const uploadMutation = useEnrollmentDocumentUploadMutation();
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

  const familyRecordDocuments = documentMap.FAMILY_RECORD;
  const familyPhotoDocuments = documentMap.FAMILY_PHOTO;
  const additionalEvidenceDocuments = documentMap.ADDITIONAL_EVIDENCE;
  const sortedFamilyRecordDocuments = [...familyRecordDocuments].sort(
    (leftDocument, rightDocument) =>
      new Date(leftDocument.uploadedAt).getTime() -
      new Date(rightDocument.uploadedAt).getTime(),
  );
  const sortedFamilyPhotoDocuments = [...familyPhotoDocuments].sort(
    (leftDocument, rightDocument) =>
      new Date(leftDocument.uploadedAt).getTime() -
      new Date(rightDocument.uploadedAt).getTime(),
  );
  const motherBirthCertificate = sortedFamilyRecordDocuments[0] ?? null;
  const grandmotherBirthCertificate = sortedFamilyRecordDocuments[1] ?? null;
  const motherPhoto = sortedFamilyPhotoDocuments[0] ?? null;
  const grandmotherPhoto = sortedFamilyPhotoDocuments[1] ?? null;
  const userPhotoDocument = documentMap.USER_PHOTO[0] ?? null;
  const birthCertificateDocument = documentMap.BIRTH_CERTIFICATE[0] ?? null;

  const hasMandatoryLineageDocuments =
    familyRecordDocuments.length >= 2 && familyPhotoDocuments.length >= 2;
  const hasMandatoryPersonalDocuments = Boolean(
    userPhotoDocument && birthCertificateDocument,
  );
  const hasMandatoryDocuments =
    hasMandatoryPersonalDocuments && hasMandatoryLineageDocuments;

  const missingMandatoryDocuments = [
    ...(!userPhotoDocument ? ["User Photo"] : []),
    ...(!birthCertificateDocument ? ["Birth Certificate"] : []),
    ...(familyRecordDocuments.length < 1 ? ["Mother's Birth Certificate"] : []),
    ...(familyRecordDocuments.length < 2
      ? ["Grandmother's Birth Certificate"]
      : []),
    ...(familyPhotoDocuments.length < 1 ? ["Mother's Photo"] : []),
    ...(familyPhotoDocuments.length < 2 ? ["Grandmother's Photo"] : []),
  ];

  const isListLoading = documentListQuery.isPending && !documentListQuery.data;

  const openPicker = (slotId: EnrollmentStepFourUploadSlotId) => {
    inputRefs.current[slotId]?.click();
  };

  const handleUpload = async (
    { documentType, slotId, title }: UploadTarget,
    file: File,
  ) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = getEnrollmentStepFourFileValidationMessage(file);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setActiveUploadSlotId(slotId);

    try {
      const uploadResponse = await uploadMutation.mutateAsync({
        documentType,
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
        uploadResponse.message || `${title} uploaded successfully.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload the selected document right now.",
      );
    } finally {
      setActiveUploadSlotId(null);
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

      const filesToUpload =
        target.slotId === enrollmentStepFourAdditionalEvidenceCard.id
          ? selectedFiles
          : [selectedFiles[0]];

      for (const file of filesToUpload) {
        if (file) {
          await handleUpload(target, file);
        }
      }
    };

  return (
    <section className="mx-auto w-full max-w-7xl py-6 sm:py-8 lg:py-10">
      <div className="space-y-6 sm:space-y-7">
        {documentListErrorMessage ? (
          <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground sm:px-5">
            {documentListErrorMessage} Please refresh and try again before
            completing Step 4.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground sm:px-5">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-foreground sm:px-5">
            {successMessage}
          </div>
        ) : null}

        <div className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-muted-foreground text-[0.78rem] font-semibold tracking-[0.24em] uppercase">
            Document Upload Guidance
          </p>
          <p className="text-muted-foreground mt-2 max-w-4xl text-[0.92rem] leading-7">
            Upload clear files. Required: User Photo, Birth Certificate,
            Mother&apos;s Birth Certificate, Mother&apos;s Photo,
            Grandmother&apos;s Birth Certificate, and Grandmother&apos;s Photo.
          </p>
        </div>

        <section>
          <h2 className="text-foreground text-[1.6rem] font-semibold tracking-tight sm:text-[1.8rem]">
            Personal Documents
          </h2>
          <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 xl:grid-cols-2">
            {enrollmentStepFourSingleUploadCards.map((card) => {
              const currentDocument = documentMap[card.documentType][0] ?? null;
              const isUploading =
                uploadMutation.isPending && activeUploadSlotId === card.id;
              const isRequired = requiredUploadSlotIds.has(card.id);

              return (
                <section
                  className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6"
                  key={card.id}
                >
                  <h3 className="text-foreground text-[1.35rem] leading-tight font-semibold tracking-tight">
                    {card.title}
                    {isRequired ? (
                      <span className="text-foreground"> *</span>
                    ) : null}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-[0.9rem] leading-7">
                    {card.description}
                  </p>

                  <UploadDropArea
                    accept={enrollmentStepFourUploadAccept}
                    disabled={uploadMutation.isPending}
                    onChange={createInputChangeHandler({
                      documentType: card.documentType,
                      slotId: card.id,
                      title: card.title,
                    })}
                    onOpen={openPicker}
                    refSetter={(element) => {
                      inputRefs.current[card.id] = element;
                    }}
                    slotId={card.id}
                    uploading={isUploading}
                  />

                  <div className="mt-4">
                    {currentDocument ? (
                      <UploadedDocumentRow document={currentDocument} />
                    ) : (
                      <p className="text-muted-foreground text-[0.8rem]">
                        No file uploaded yet.
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-foreground text-[1.6rem] font-semibold tracking-tight sm:text-[1.8rem]">
            Lineage Birth Documentations
          </h2>
          <div className="mt-4 rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {enrollmentStepFourLineageUploadSlots.map((slot) => {
                const isUploading =
                  uploadMutation.isPending && activeUploadSlotId === slot.id;
                const isRequired = requiredUploadSlotIds.has(slot.id);
                const previewDocument =
                  slot.id === "mother_birth_certificate"
                    ? motherBirthCertificate
                    : slot.id === "grandmother_birth_certificate"
                      ? grandmotherBirthCertificate
                      : slot.id === "mother_photo"
                        ? motherPhoto
                        : grandmotherPhoto;

                return (
                  <section
                    className="border-border bg-surface rounded-2xl border p-4"
                    key={slot.id}
                  >
                    <h3 className="text-foreground text-[1.02rem] font-semibold">
                      {slot.title}
                      {isRequired ? (
                        <span className="text-foreground"> *</span>
                      ) : null}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-[0.78rem]">
                      {slot.description}
                    </p>

                    <UploadDropArea
                      accept={enrollmentStepFourUploadAccept}
                      disabled={uploadMutation.isPending}
                      onChange={createInputChangeHandler({
                        documentType: slot.documentType,
                        slotId: slot.id,
                        title: slot.title,
                      })}
                      onOpen={openPicker}
                      refSetter={(element) => {
                        inputRefs.current[slot.id] = element;
                      }}
                      slotId={slot.id}
                      uploading={isUploading}
                    />

                    <div className="mt-4">
                      {previewDocument ? (
                        <UploadedDocumentRow document={previewDocument} />
                      ) : (
                        <p className="text-muted-foreground text-[0.8rem]">
                          No file mapped yet.
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-foreground text-[1.6rem] font-semibold tracking-tight sm:text-[1.8rem]">
            Additional Evidence
          </h2>
          <div className="mt-4 rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
            <h3 className="text-foreground text-[1.35rem] leading-tight font-semibold tracking-tight">
              {enrollmentStepFourAdditionalEvidenceCard.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-[0.9rem] leading-7">
              {enrollmentStepFourAdditionalEvidenceCard.description}
            </p>

            <UploadDropArea
              accept={enrollmentStepFourUploadAccept}
              disabled={uploadMutation.isPending}
              multiple
              onChange={createInputChangeHandler({
                documentType:
                  enrollmentStepFourAdditionalEvidenceCard.documentType,
                slotId: enrollmentStepFourAdditionalEvidenceCard.id,
                title: enrollmentStepFourAdditionalEvidenceCard.title,
              })}
              onOpen={openPicker}
              refSetter={(element) => {
                inputRefs.current[enrollmentStepFourAdditionalEvidenceCard.id] =
                  element;
              }}
              slotId={enrollmentStepFourAdditionalEvidenceCard.id}
              uploading={
                uploadMutation.isPending &&
                activeUploadSlotId ===
                  enrollmentStepFourAdditionalEvidenceCard.id
              }
            />

            <div className="mt-4 space-y-2.5">
              {additionalEvidenceDocuments.length > 0 ? (
                additionalEvidenceDocuments.map((document) => (
                  <UploadedDocumentRow document={document} key={document.id} />
                ))
              ) : (
                <p className="text-muted-foreground text-[0.8rem]">
                  No files uploaded yet.
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-foreground text-[1.1rem] font-semibold tracking-tight">
                Complete Step 4
              </h2>
              {hasMandatoryDocuments ? (
                <p className="text-muted-foreground mt-1 text-[0.88rem] leading-6 sm:text-[0.92rem]">
                  Mandatory documents are uploaded.
                </p>
              ) : (
                <p className="text-muted-foreground mt-1 text-[0.88rem] leading-6 sm:text-[0.92rem]">
                  Missing mandatory documents:{" "}
                  {missingMandatoryDocuments.join(", ")}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                disabled={uploadMutation.isPending}
                leftIcon={<ArrowLeft />}
                onClick={() => router.push("/enrollment/step-3")}
                size="lg"
                type="button"
                variant="outline"
              >
                Previous Step
              </Button>

              <Button
                disabled={isListLoading || uploadMutation.isPending}
                leftIcon={<RefreshCw />}
                loading={documentListQuery.isRefetching}
                loadingText="Refreshing..."
                onClick={() => {
                  void documentListQuery.refetch();
                }}
                size="lg"
                type="button"
                variant="outline"
              >
                Refresh Files
              </Button>

              <Button
                disabled={
                  isListLoading ||
                  uploadMutation.isPending ||
                  !hasMandatoryDocuments
                }
                onClick={() => router.push("/dashboard")}
                rightIcon={<CheckCircle2 />}
                size="lg"
                type="button"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
