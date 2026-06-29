import axios, { AxiosHeaders, type AxiosRequestHeaders } from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import type { ApiError } from "@/types/api";

const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please sign in again.";

export async function getBackendAuthHeaders(): Promise<AxiosRequestHeaders | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return new AxiosHeaders({
    Authorization: `Bearer ${token}`,
  });
}

export function createUnauthorizedResponse(message = SESSION_EXPIRED_MESSAGE) {
  return NextResponse.json({ message }, { status: 401 });
}

export function mapBackendApiErrorResponse(
  error: unknown,
  fallbackMessage: string,
) {
  if (axios.isAxiosError<ApiError>(error)) {
    return NextResponse.json(
      {
        message: error.response?.data?.message ?? fallbackMessage,
        errors: error.response?.data?.errors,
      },
      { status: error.response?.status ?? 500 },
    );
  }

  return NextResponse.json({ message: fallbackMessage }, { status: 500 });
}
