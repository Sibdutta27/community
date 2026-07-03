import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import type {
  EnrollmentSaveDraftResponse,
  EnrollmentStepTwoSaveDraftRequest,
} from "@/types/enrollment";

/**
 * Partial Step 2 draft save ("Save & finish later") — every ancestor is
 * optional; the backend upserts only what is present and never marks the
 * step complete.
 */
export async function POST(request: Request) {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  const body = (await request
    .json()
    .catch(() => null)) as EnrollmentStepTwoSaveDraftRequest | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { message: "A valid step 2 draft payload is required." },
      { status: 400 },
    );
  }

  try {
    const payload = await apiConnector<EnrollmentSaveDraftResponse>(
      "post",
      endpoints.ENROLLMENT.STEP_2_MATERNAL_KINSHIP_SAVE_DRAFT,
      body,
      authHeaders,
    );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "Unable to save your step 2 progress right now.",
    );
  }
}
