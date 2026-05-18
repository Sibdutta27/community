import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import type {
  EnrollmentStepTwoUpsertRequest,
  EnrollmentStepTwoUpsertResponse,
} from "@/types/enrollment";

export async function POST(request: Request) {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  const body = (await request
    .json()
    .catch(() => null)) as EnrollmentStepTwoUpsertRequest | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { message: "A valid step 2 payload is required." },
      { status: 400 },
    );
  }

  try {
    const payload = await apiConnector<EnrollmentStepTwoUpsertResponse>(
      "post",
      endpoints.ENROLLMENT.STEP_2_MATERNAL_LINEAGE_UPSERT,
      body,
      authHeaders,
    );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "Unable to save your step 2 maternal lineage information right now.",
    );
  }
}
