"use client";

import { useMutation } from "@tanstack/react-query";

import type { AuthLoginRequest, AuthSessionResponse } from "@/lib/auth";
import { requestJson } from "@/services/http/fetcher";

export type AuthRegisterPayload = Readonly<{
  name: string;
  email: string;
  password: string;
}>;

type LogoutResponse = {
  success: boolean;
};

export function useSignInMutation() {
  return useMutation({
    mutationFn: (payload: AuthLoginRequest) =>
      requestJson<AuthSessionResponse, AuthLoginRequest>("/api/auth/login", {
        method: "POST",
        body: payload,
        fallbackMessage:
          "Unable to reach the sign-in service. Please try again in a moment.",
      }),
  });
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: (payload: AuthRegisterPayload) =>
      requestJson<AuthSessionResponse, AuthRegisterPayload>(
        "/api/auth/register",
        {
          method: "POST",
          body: payload,
          fallbackMessage:
            "Unable to reach the registration service. Please try again in a moment.",
        },
      ),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () =>
      requestJson<LogoutResponse>("/api/auth/logout", {
        method: "POST",
        fallbackMessage: "Unable to sign out right now. Please try again.",
      }),
  });
}
