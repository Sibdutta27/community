"use client";

import { useQuery } from "@tanstack/react-query";

import { requestJson } from "@/services/http/fetcher";
import type { ProfileResponse } from "@/types/enrollment";

export const profileQueryKeys = {
  info: ["profile", "info"] as const,
};

export function useProfileInfoQuery() {
  return useQuery({
    queryKey: profileQueryKeys.info,
    queryFn: () =>
      requestJson<ProfileResponse>("/api/profile", {
        fallbackMessage: "Unable to load your profile information right now.",
      }),
    staleTime: 60 * 1000,
  });
}
