import { NextResponse } from "next/server";

import {
  type AuthRegisterRequest,
  normalizeEmail,
  normalizeNamePart,
} from "@/lib/auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

import { issueAuthSession, mapAuthErrorResponse } from "../_shared";

type RegisterBackendResponse = {
  accessToken?: string;
  data?: {
    accessToken?: string;
  };
};

function pickAccessToken(payload: RegisterBackendResponse) {
  return payload.accessToken ?? payload.data?.accessToken;
}

export async function POST(request: Request) {
  const body = (await request
    .json()
    .catch(() => null)) as Partial<AuthRegisterRequest> | null;

  if (!body?.name || !body?.email || !body?.password) {
    return NextResponse.json(
      { message: "Name, email, and password are required." },
      { status: 400 },
    );
  }

  const name = normalizeNamePart(body.name);

  if (!name) {
    return NextResponse.json({ message: "Name is required." }, { status: 400 });
  }

  let payload: RegisterBackendResponse;

  try {
    payload = await apiConnector<RegisterBackendResponse>(
      "post",
      endpoints.AUTH.REGISTER,
      {
        name,
        email: normalizeEmail(body.email),
        password: body.password,
      },
    );
  } catch (error) {
    return mapAuthErrorResponse(
      error,
      "Unable to create your account. Please try again in a moment.",
    );
  }

  const accessToken = pickAccessToken(payload);

  if (!accessToken) {
    return NextResponse.json(
      {
        message:
          "Unable to create your account right now due to an invalid auth response.",
      },
      { status: 502 },
    );
  }

  return issueAuthSession({ accessToken }, false, 201);
}
