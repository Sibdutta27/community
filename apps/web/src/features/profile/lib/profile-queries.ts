"use client";

import { useQuery } from "@tanstack/react-query";

import { requestJson } from "@/services/http/fetcher";
import type { ProfileResponse } from "@/types/enrollment";

export const profileQueryKeys = {
  info: ["profile", "info"] as const,
  optionalInfo: ["profile", "info", "optional"] as const,
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

/**
 * Profile query for PUBLIC pages (e.g. `/yucayeke`, `/yucayeke/[slug]`).
 *
 * On those routes a 401 simply means "nobody is signed in" — it must NOT
 * trigger the global sign-in redirect `requestJson` performs by default,
 * which would bounce every signed-out visitor off a public page. The
 * error state is the "no session" signal, so callers render their
 * signed-out variant when `isSuccess` is false.
 *
 * Deliberately a separate cache key from `useProfileInfoQuery`: sharing
 * one would let whichever hook mounted first decide the redirect
 * behaviour for the other.
 */
export function useOptionalProfileInfoQuery() {
  return useQuery({
    queryKey: profileQueryKeys.optionalInfo,
    queryFn: () =>
      requestJson<ProfileResponse>("/api/profile", {
        fallbackMessage: "Unable to load your profile information right now.",
        redirectOnUnauthorized: false,
      }),
    staleTime: 60 * 1000,
    // A signed-out visitor is the expected case here, not a flake.
    retry: false,
  });
}
