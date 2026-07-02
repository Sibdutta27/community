import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import type { EnrollmentStepFourNextResponse } from "@/types/enrollment";

export async function POST() {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  try {
    const payload = await apiConnector<EnrollmentStepFourNextResponse>(
      "post",
      endpoints.ENROLLMENT.STEP_4_DOCUMENTS_NEXT,
      undefined,
      authHeaders,
    );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "Unable to complete the document upload step right now.",
    );
  }
}
