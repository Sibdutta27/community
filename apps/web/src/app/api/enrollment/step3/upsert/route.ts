import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import type {
  EnrollmentStepThreeUpsertRequest,
  EnrollmentStepThreeUpsertResponse,
} from "@/types/enrollment";

export async function POST(request: Request) {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  const body = (await request
    .json()
    .catch(() => null)) as EnrollmentStepThreeUpsertRequest | null;

  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray(body.culturalConnectionKeys)
  ) {
    return NextResponse.json(
      { message: "A valid step 3 payload is required." },
      { status: 400 },
    );
  }

  try {
    const payload = await apiConnector<EnrollmentStepThreeUpsertResponse>(
      "post",
      endpoints.ENROLLMENT.STEP_3_CULTURAL_CONNECTION_UPSERT,
      body,
      authHeaders,
    );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "Unable to save your step 3 cultural connection information right now.",
    );
  }
}
