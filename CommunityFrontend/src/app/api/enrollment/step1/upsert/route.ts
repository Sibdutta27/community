import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import type {
  EnrollmentStepOneUpsertRequest,
  EnrollmentStepOneUpsertResponse,
} from "@/types/enrollment";

export async function POST(request: Request) {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  const body = (await request
    .json()
    .catch(() => null)) as EnrollmentStepOneUpsertRequest | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { message: "A valid step 1 payload is required." },
      { status: 400 },
    );
  }

  try {
    const payload = await apiConnector<EnrollmentStepOneUpsertResponse>(
      "post",
      endpoints.ENROLLMENT.STEP_1_PERSONAL_INFO_UPSERT,
      body,
      authHeaders,
    );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "Unable to save your step 1 enrollment information right now.",
    );
  }
}
