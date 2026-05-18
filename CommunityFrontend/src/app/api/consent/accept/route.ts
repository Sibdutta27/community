import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import type { ConsentAcceptRequest } from "@/types/enrollment";

type ConsentAcceptResponse = Record<string, unknown>;

export async function POST(request: Request) {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  const body = (await request
    .json()
    .catch(() => null)) as Partial<ConsentAcceptRequest> | null;

  if (!body?.acceptRequired) {
    return NextResponse.json(
      { message: "All required consents must be accepted to continue." },
      { status: 400 },
    );
  }

  try {
    const payload = await apiConnector<ConsentAcceptResponse>(
      "post",
      endpoints.CONSENT.ACCEPT,
      {
        acceptRequired: true,
      } satisfies ConsentAcceptRequest,
      authHeaders,
    );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "Unable to save your consent choices right now.",
    );
  }
}
