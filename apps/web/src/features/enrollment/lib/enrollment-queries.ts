"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

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
  EnrollmentStepFourNextResponse,
  EnrollmentStepOnePrefillResponse,
  EnrollmentStepOneUpsertRequest,
  EnrollmentStepOneUpsertResponse,
  EnrollmentStepThreePrefillResponse,
  EnrollmentStepThreeUpsertRequest,
  EnrollmentStepThreeUpsertResponse,
  EnrollmentStepTwoPrefillResponse,
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
  return useQuery({
    queryKey: accountQueryKeys.info,
    queryFn: () =>
      requestJson<AccountInfoResponse>("/api/account/info", {
        fallbackMessage:
          "Unable to load the account enrollment information right now.",
      }),
    staleTime: 60 * 1000,
  });
}

export function useActiveConsentsQuery(enabled = false) {
  return useQuery({
    queryKey: enrollmentQueryKeys.activeConsents,
    queryFn: () =>
      requestJson<ActiveConsent[]>("/api/consent/active", {
        fallbackMessage:
          "Unable to load the consent records for this enrollment.",
      }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStartEnrollmentMutation() {
  return useMutation({
    mutationFn: () =>
      requestJson<EnrollmentStartResponse>("/api/enrollment/start", {
        method: "POST",
        fallbackMessage:
          "Unable to start the enrollment application right now.",
      }),
  });
}

export function useAcceptEnrollmentConsentsMutation() {
  return useMutation({
    mutationFn: (payload: ConsentAcceptRequest) =>
      requestJson<ConsentAcceptResponse, ConsentAcceptRequest>(
        "/api/consent/accept",
        {
          method: "POST",
          body: payload,
          fallbackMessage: "Unable to save the required consents right now.",
        },
      ),
  });
}

export function useEnrollmentStepOneUpsertMutation() {
  return useMutation({
    mutationFn: (payload: EnrollmentStepOneUpsertRequest) =>
      requestJson<
        EnrollmentStepOneUpsertResponse,
        EnrollmentStepOneUpsertRequest
      >("/api/enrollment/step1/upsert", {
        method: "POST",
        body: payload,
        fallbackMessage:
          "Unable to save your step 1 demographics right now.",
      }),
  });
}

export function useEnrollmentStepOneQuery(enabled = true) {
  return useQuery({
    queryKey: enrollmentQueryKeys.stepOneDemographics,
    queryFn: () =>
      requestJson<EnrollmentStepOnePrefillResponse>("/api/enrollment/step1", {
        fallbackMessage:
          "Unable to load your step 1 demographics right now.",
      }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useEnrollmentStepTwoUpsertMutation() {
  return useMutation({
    mutationFn: (payload: EnrollmentStepTwoUpsertRequest) =>
      requestJson<
        EnrollmentStepTwoUpsertResponse,
        EnrollmentStepTwoUpsertRequest
      >("/api/enrollment/step2/upsert", {
        method: "POST",
        body: payload,
        fallbackMessage:
          "Unable to save your step 2 maternal kinship information right now.",
      }),
  });
}

export function useEnrollmentStepTwoQuery(enabled = true) {
  return useQuery({
    queryKey: enrollmentQueryKeys.stepTwoMaternalKinship,
    queryFn: () =>
      requestJson<EnrollmentStepTwoPrefillResponse>("/api/enrollment/step2", {
        fallbackMessage:
          "Unable to load your step 2 maternal kinship information right now.",
      }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useEnrollmentStepThreeQuery(enabled = true) {
  return useQuery({
    queryKey: enrollmentQueryKeys.stepThreePaternalKinship,
    queryFn: () =>
      requestJson<EnrollmentStepThreePrefillResponse>("/api/enrollment/step3", {
        fallbackMessage:
          "Unable to load your step 3 paternal kinship information right now.",
      }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useEnrollmentStepThreeUpsertMutation() {
  return useMutation({
    mutationFn: (payload: EnrollmentStepThreeUpsertRequest) =>
      requestJson<
        EnrollmentStepThreeUpsertResponse,
        EnrollmentStepThreeUpsertRequest
      >("/api/enrollment/step3/upsert", {
        method: "POST",
        body: payload,
        fallbackMessage:
          "Unable to save your step 3 paternal kinship information right now.",
      }),
  });
}

export function useEnrollmentStepFourDocumentListQuery() {
  return useQuery({
    queryKey: enrollmentQueryKeys.stepFourDocumentList,
    queryFn: () =>
      requestJson<EnrollmentDocumentListResponse>("/api/document/list", {
        fallbackMessage: "Unable to load your enrollment documents right now.",
      }),
    staleTime: 30 * 1000,
  });
}

type EnrollmentDocumentUploadPayload = Readonly<{
  documentType: EnrollmentDocumentType;
  file: File;
}>;

const documentStorageUploadErrorMessage =
  "The file could not be uploaded to storage. Please try again.";

/**
 * Presigned direct-to-storage upload flow (bypasses the serverless body limit):
 *   1. POST /api/document/presign-upload — validate against the per-slot
 *      policy and receive a short-lived presigned PUT URL.
 *   2. PUT the file straight from the browser to storage (never through the BFF).
 *   3. POST /api/document/confirm — record the Document for this enrollment.
 */
export function useEnrollmentDocumentUploadMutation() {
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
        fallbackMessage: "Unable to prepare the document upload right now.",
      });

      let storageResponse: Response;

      try {
        storageResponse = await fetch(presign.uploadUrl, {
          method: presign.method ?? "PUT",
          headers: presign.headers,
          body: file,
        });
      } catch {
        throw new Error(documentStorageUploadErrorMessage);
      }

      if (!storageResponse.ok) {
        throw new Error(documentStorageUploadErrorMessage);
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
        fallbackMessage:
          "The file was uploaded but could not be recorded. Please try again.",
      });
    },
  });
}

export function useEnrollmentStepFourNextMutation() {
  return useMutation({
    mutationFn: () =>
      requestJson<EnrollmentStepFourNextResponse>("/api/enrollment/step4/next", {
        method: "POST",
        fallbackMessage:
          "Unable to complete the document upload step right now.",
      }),
  });
}

export function useCompleteEnrollmentMutation() {
  return useMutation({
    mutationFn: (payload: EnrollmentCompleteRequest) =>
      requestJson<EnrollmentCompleteResponse, EnrollmentCompleteRequest>(
        "/api/enrollment/complete",
        {
          method: "POST",
          body: payload,
          fallbackMessage:
            "Unable to submit your enrollment application right now.",
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
