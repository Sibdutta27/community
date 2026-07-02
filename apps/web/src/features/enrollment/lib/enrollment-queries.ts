"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { requestJson, requestMultipart } from "@/services/http/fetcher";
import type {
  AccountInfoResponse,
  ActiveConsent,
  ConsentAcceptRequest,
  EnrollmentCompleteRequest,
  EnrollmentCompleteResponse,
  EnrollmentDocumentListResponse,
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

export function useEnrollmentDocumentUploadMutation() {
  return useMutation({
    mutationFn: ({ documentType, file }: EnrollmentDocumentUploadPayload) => {
      const formData = new FormData();
      formData.set("documentType", documentType);
      formData.set("file", file, file.name);

      return requestMultipart<EnrollmentDocumentUploadResponse>(
        "/api/document/upload",
        {
          method: "POST",
          body: formData,
          fallbackMessage: "Unable to upload the selected document right now.",
        },
      );
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
