"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { requestJson, requestMultipart } from "@/services/http/fetcher";
import type {
  AccountInfoResponse,
  ActiveConsent,
  ConsentAcceptRequest,
  EnrollmentDocumentListResponse,
  EnrollmentDocumentType,
  EnrollmentDocumentUploadResponse,
  EnrollmentStepOnePrefillResponse,
  EnrollmentStepOneUpsertRequest,
  EnrollmentStepOneUpsertResponse,
  EnrollmentStepThreeCulturalConnectionListResponse,
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
  stepOnePersonalInfo: ["enrollment", "step1", "personal-info"] as const,
  stepTwoMaternalLineage: ["enrollment", "step2", "maternal-lineage"] as const,
  stepThreeCulturalConnection: [
    "enrollment",
    "step3",
    "cultural-connection",
  ] as const,
  stepFourDocumentList: ["enrollment", "step4", "document-list"] as const,
  stepThreeCulturalConnectionList: [
    "enrollment",
    "step3",
    "cultural-connection-list",
  ] as const,
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
          "Unable to save your step 1 enrollment information right now.",
      }),
  });
}

export function useEnrollmentStepOneQuery(enabled = true) {
  return useQuery({
    queryKey: enrollmentQueryKeys.stepOnePersonalInfo,
    queryFn: () =>
      requestJson<EnrollmentStepOnePrefillResponse>("/api/enrollment/step1", {
        fallbackMessage:
          "Unable to load your step 1 enrollment information right now.",
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
          "Unable to save your step 2 maternal lineage information right now.",
      }),
  });
}

export function useEnrollmentStepTwoQuery(enabled = true) {
  return useQuery({
    queryKey: enrollmentQueryKeys.stepTwoMaternalLineage,
    queryFn: () =>
      requestJson<EnrollmentStepTwoPrefillResponse>("/api/enrollment/step2", {
        fallbackMessage:
          "Unable to load your step 2 maternal lineage information right now.",
      }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useEnrollmentStepThreeConnectionListQuery() {
  return useQuery({
    queryKey: enrollmentQueryKeys.stepThreeCulturalConnectionList,
    queryFn: () =>
      requestJson<EnrollmentStepThreeCulturalConnectionListResponse>(
        "/api/enrollment/step3/cultural-connection-list",
        {
          fallbackMessage:
            "Unable to load the cultural connection options right now.",
        },
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEnrollmentStepThreeQuery(enabled = true) {
  return useQuery({
    queryKey: enrollmentQueryKeys.stepThreeCulturalConnection,
    queryFn: () =>
      requestJson<EnrollmentStepThreePrefillResponse>("/api/enrollment/step3", {
        fallbackMessage:
          "Unable to load your step 3 cultural connection information right now.",
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
          "Unable to save your step 3 cultural connection information right now.",
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

export type {
  EnrollmentDocumentUploadResponse,
  EnrollmentStepOneUpsertResponse,
  EnrollmentStepThreeUpsertResponse,
  EnrollmentStepTwoUpsertResponse,
};
