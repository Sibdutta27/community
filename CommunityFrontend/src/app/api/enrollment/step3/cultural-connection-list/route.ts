import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import type { EnrollmentStepThreeCulturalConnectionListResponse } from "@/types/enrollment";

export async function GET() {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  try {
    const payload =
      await apiConnector<EnrollmentStepThreeCulturalConnectionListResponse>(
        "get",
        endpoints.ENROLLMENT.STEP_3_CULTURAL_CONNECTION_LIST,
        undefined,
        authHeaders,
      );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "Unable to load the cultural connection options right now.",
    );
  }
}
