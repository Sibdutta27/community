import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import type { EnrollmentDocumentUploadResponse } from "@/types/enrollment";

export async function POST(request: Request) {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { message: "A valid confirm payload is required." },
      { status: 400 },
    );
  }

  try {
    const payload = await apiConnector<EnrollmentDocumentUploadResponse>(
      "post",
      endpoints.DOCUMENT.CONFIRM,
      body,
      authHeaders,
    );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "The file was uploaded but could not be recorded. Please try again.",
    );
  }
}
