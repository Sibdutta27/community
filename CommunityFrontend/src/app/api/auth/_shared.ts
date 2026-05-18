import axios from "axios";
import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  getTokenMaxAge,
  type AuthSessionResponse,
} from "@/lib/auth";

export type BackendAuthError = {
  message?: string;
  errors?: Record<string, string[]>;
};

function buildAuthCookieOptions(rememberMe: boolean, accessToken: string) {
  const maxAge = rememberMe ? getTokenMaxAge(accessToken) : undefined;

  return {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(typeof maxAge === "number" ? { maxAge } : {}),
  };
}

export function issueAuthSession(
  payload: AuthSessionResponse,
  rememberMe = false,
  status = 200,
) {
  const response = NextResponse.json(payload, { status });
  const cookieOptions = buildAuthCookieOptions(rememberMe, payload.accessToken);

  response.cookies.set(AUTH_COOKIE_NAME, payload.accessToken, {
    ...cookieOptions,
    httpOnly: true,
  });

  return response;
}

export function mapAuthErrorResponse(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<BackendAuthError>(error)) {
    return NextResponse.json(
      {
        message: error.response?.data?.message ?? fallbackMessage,
        errors: error.response?.data?.errors,
      },
      { status: error.response?.status ?? 500 },
    );
  }

  return NextResponse.json(
    {
      message: fallbackMessage,
    },
    { status: 500 },
  );
}
