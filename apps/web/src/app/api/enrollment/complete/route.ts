import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import type {
  EnrollmentCompleteRequest,
  EnrollmentCompleteResponse,
} from "@/types/enrollment";

export async function POST(request: Request) {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  const body = (await request
    .json()
    .catch(() => null)) as EnrollmentCompleteRequest | null;

  // The e-signature is the whole payload — consent was collected once at
  // `/enrollment/start`, and the backend derives `agreedToTerms` from it.
  if (
    !body ||
    typeof body !== "object" ||
    typeof body.signatureName !== "string" ||
    body.signatureName.trim().length === 0 ||
    typeof body.signatureDate !== "string"
  ) {
    return NextResponse.json(
      { message: "A valid enrollment confirmation payload is required." },
      { status: 400 },
    );
  }

  try {
    const payload = await apiConnector<EnrollmentCompleteResponse>(
      "post",
      endpoints.ENROLLMENT.COMPLETE,
      body,
      authHeaders,
    );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "Unable to submit your enrollment application right now.",
    );
  }
}
