import { NextResponse } from "next/server";

import {
  type AuthLoginResponse,
  type AuthLoginRequest,
  normalizeEmail,
} from "@/lib/auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import { issueAuthSession, mapAuthErrorResponse } from "../_shared";

export async function POST(request: Request) {
  const body = (await request
    .json()
    .catch(() => null)) as Partial<AuthLoginRequest> | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  let payload: AuthLoginResponse;

  try {
    payload = await apiConnector<AuthLoginResponse>(
      "post",
      endpoints.AUTH.LOGIN,
      {
        email: normalizeEmail(body.email),
        password: body.password,
      },
    );
  } catch (error) {
    return mapAuthErrorResponse(
      error,
      "Unable to sign in. Please try again in a moment.",
    );
  }

  return issueAuthSession(payload, body.rememberMe);
}
