"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { requestJson } from "@/services/http/fetcher";
import type {
  AccountInfoResponse,
  ActiveConsent,
  ConsentAcceptRequest,
  EnrollmentCompleteRequest,
  EnrollmentCompleteResponse,
  EnrollmentDocumentConfirmRequest,
  EnrollmentDocumentListResponse,
  EnrollmentDocumentPresignRequest,
  EnrollmentDocumentPresignResponse,
  EnrollmentDocumentType,
  EnrollmentDocumentUploadResponse,
  EnrollmentSaveDraftResponse,
  EnrollmentStepFourNextResponse,
  EnrollmentStepOnePrefillResponse,
  EnrollmentStepOneSaveDraftRequest,
  EnrollmentStepOneUpsertRequest,
  EnrollmentStepOneUpsertResponse,
  EnrollmentStepThreePrefillResponse,
  EnrollmentStepThreeSaveDraftRequest,
  EnrollmentStepThreeUpsertRequest,
  EnrollmentStepThreeUpsertResponse,
  EnrollmentStepTwoPrefillResponse,
  EnrollmentStepTwoSaveDraftRequest,
  EnrollmentStepTwoUpsertRequest,
  EnrollmentStepTwoUpsertResponse,
} from "@/types/enrollment";

export const accountQueryKeys = {
  info: ["account", "info"] as const,
};

type EnrollmentStartResponse = Record<string, unknown>;
type ConsentAcceptResponse = Record<string, unknown>;

export const enrollmentQueryKeys = {
  activeConsents: ["enrollment", "consent", "active"] as const,
  stepOneDemographics: ["enrollment", "step1", "demographics"] as const,
  stepTwoMaternalKinship: ["enrollment", "step2", "maternal-kinship"] as const,
  stepThreePaternalKinship: [
    "enrollment",
    "step3",
    "paternal-kinship",
  ] as const,
  stepFourDocumentList: ["enrollment", "step4", "document-list"] as const,
};

export function useAccountInfoQuery() {
  const t = useTranslations("errors");

  return useQuery({
    queryKey: accountQueryKeys.info,
    queryFn: () =>
      requestJson<AccountInfoResponse>("/api/account/info", {
        fallbackMessage: t("accountInfoLoad"),
      }),
    staleTime: 60 * 1000,
  });
}

export function useActiveConsentsQuery(enabled = false) {
  const t = useTranslations("errors");

  return useQuery({
    queryKey: enrollmentQueryKeys.activeConsents,
    queryFn: () =>
      requestJson<ActiveConsent[]>("/api/consent/active", {
        fallbackMessage: t("consentsLoad"),
      }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStartEnrollmentMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: () =>
      requestJson<EnrollmentStartResponse>("/api/enrollment/start", {
        method: "POST",
        fallbackMessage: t("enrollmentStart"),
      }),
  });
}

export function useAcceptEnrollmentConsentsMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (payload: ConsentAcceptRequest) =>
      requestJson<ConsentAcceptResponse, ConsentAcceptRequest>(
        "/api/consent/accept",
        {
          method: "POST",
          body: payload,
          fallbackMessage: t("consentsSave"),
        },
      ),
  });
}

export function useEnrollmentStepOneUpsertMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (payload: EnrollmentStepOneUpsertRequest) =>
      requestJson<
        EnrollmentStepOneUpsertResponse,
        EnrollmentStepOneUpsertRequest
      >("/api/enrollment/step1/upsert", {
        method: "POST",
        body: payload,
        fallbackMessage: t("stepOneSave"),
      }),
  });
}

/**
 * Partial Step 1 draft save ("Save & finish later") — sends only the
 * provided fields; the backend skips required-field validation and never
 * marks the step complete.
 */
export function useEnrollmentStepOneSaveDraftMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (payload: EnrollmentStepOneSaveDraftRequest) =>
      requestJson<EnrollmentSaveDraftResponse, EnrollmentStepOneSaveDraftRequest>(
        "/api/enrollment/step1/save-draft",
        {
          method: "POST",
          body: payload,
          fallbackMessage: t("stepOneDraftSave"),
        },
      ),
  });
}

export function useEnrollmentStepOneQuery(enabled = true) {
  const t = useTranslations("errors");

  return useQuery({
    queryKey: enrollmentQueryKeys.stepOneDemographics,
    queryFn: () =>
      requestJson<EnrollmentStepOnePrefillResponse>("/api/enrollment/step1", {
        fallbackMessage: t("stepOneLoad"),
      }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useEnrollmentStepTwoUpsertMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (payload: EnrollmentStepTwoUpsertRequest) =>
      requestJson<
        EnrollmentStepTwoUpsertResponse,
        EnrollmentStepTwoUpsertRequest
      >("/api/enrollment/step2/upsert", {
        method: "POST",
        body: payload,
        fallbackMessage: t("stepTwoSave"),
      }),
  });
}

/** Partial Step 2 draft save ("Save & finish later") — see step 1 note. */
export function useEnrollmentStepTwoSaveDraftMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (payload: EnrollmentStepTwoSaveDraftRequest) =>
      requestJson<EnrollmentSaveDraftResponse, EnrollmentStepTwoSaveDraftRequest>(
        "/api/enrollment/step2/save-draft",
        {
          method: "POST",
          body: payload,
          fallbackMessage: t("stepTwoDraftSave"),
        },
      ),
  });
}

export function useEnrollmentStepTwoQuery(enabled = true) {
  const t = useTranslations("errors");

  return useQuery({
    queryKey: enrollmentQueryKeys.stepTwoMaternalKinship,
    queryFn: () =>
      requestJson<EnrollmentStepTwoPrefillResponse>("/api/enrollment/step2", {
        fallbackMessage: t("stepTwoLoad"),
      }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useEnrollmentStepThreeQuery(enabled = true) {
  const t = useTranslations("errors");

  return useQuery({
    queryKey: enrollmentQueryKeys.stepThreePaternalKinship,
    queryFn: () =>
      requestJson<EnrollmentStepThreePrefillResponse>("/api/enrollment/step3", {
        fallbackMessage: t("stepThreeLoad"),
      }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useEnrollmentStepThreeUpsertMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (payload: EnrollmentStepThreeUpsertRequest) =>
      requestJson<
        EnrollmentStepThreeUpsertResponse,
        EnrollmentStepThreeUpsertRequest
      >("/api/enrollment/step3/upsert", {
        method: "POST",
        body: payload,
        fallbackMessage: t("stepThreeSave"),
      }),
  });
}

/** Partial Step 3 draft save ("Save & finish later") — see step 1 note. */
export function useEnrollmentStepThreeSaveDraftMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (payload: EnrollmentStepThreeSaveDraftRequest) =>
      requestJson<
        EnrollmentSaveDraftResponse,
        EnrollmentStepThreeSaveDraftRequest
      >("/api/enrollment/step3/save-draft", {
        method: "POST",
        body: payload,
        fallbackMessage: t("stepThreeDraftSave"),
      }),
  });
}

export function useEnrollmentStepFourDocumentListQuery() {
  const t = useTranslations("errors");

  return useQuery({
    queryKey: enrollmentQueryKeys.stepFourDocumentList,
    queryFn: () =>
      requestJson<EnrollmentDocumentListResponse>("/api/document/list", {
        fallbackMessage: t("documentsLoad"),
      }),
    staleTime: 30 * 1000,
  });
}

type EnrollmentDocumentUploadPayload = Readonly<{
  documentType: EnrollmentDocumentType;
  file: File;
}>;

/**
 * Presigned direct-to-storage upload flow (bypasses the serverless body limit):
 *   1. POST /api/document/presign-upload — validate against the per-slot
 *      policy and receive a short-lived presigned PUT URL.
 *   2. PUT the file straight from the browser to storage (never through the BFF).
 *   3. POST /api/document/confirm — record the Document for this enrollment.
 */
export function useEnrollmentDocumentUploadMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: async ({
      documentType,
      file,
    }: EnrollmentDocumentUploadPayload) => {
      const presign = await requestJson<
        EnrollmentDocumentPresignResponse,
        EnrollmentDocumentPresignRequest
      >("/api/document/presign-upload", {
        method: "POST",
        body: {
          documentType,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        },
        fallbackMessage: t("documentPresign"),
      });

      let storageResponse: Response;

      try {
        storageResponse = await fetch(presign.uploadUrl, {
          method: presign.method ?? "PUT",
          headers: presign.headers,
          body: file,
        });
      } catch {
        throw new Error(t("documentStorageUpload"));
      }

      if (!storageResponse.ok) {
        throw new Error(t("documentStorageUpload"));
      }

      return requestJson<
        EnrollmentDocumentUploadResponse,
        EnrollmentDocumentConfirmRequest
      >("/api/document/confirm", {
        method: "POST",
        body: {
          documentType,
          key: presign.key,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        },
        fallbackMessage: t("documentConfirm"),
      });
    },
  });
}

export function useEnrollmentStepFourNextMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: () =>
      requestJson<EnrollmentStepFourNextResponse>("/api/enrollment/step4/next", {
        method: "POST",
        fallbackMessage: t("stepFourNext"),
      }),
  });
}

export function useCompleteEnrollmentMutation() {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (payload: EnrollmentCompleteRequest) =>
      requestJson<EnrollmentCompleteResponse, EnrollmentCompleteRequest>(
        "/api/enrollment/complete",
        {
          method: "POST",
          body: payload,
          fallbackMessage: t("enrollmentSubmit"),
        },
      ),
  });
}

export type {
  EnrollmentCompleteResponse,
  EnrollmentDocumentUploadResponse,
  EnrollmentStepOneUpsertResponse,
  EnrollmentStepThreeUpsertResponse,
  EnrollmentStepTwoUpsertResponse,
};
