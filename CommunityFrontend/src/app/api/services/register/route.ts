import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import type {
  ServiceRegisterRequest,
  ServiceRegisterResponse,
} from "@/features/services/types/service";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export async function POST(request: Request) {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  const body = (await request
    .json()
    .catch(() => null)) as Partial<ServiceRegisterRequest> | null;
  const serviceId = body?.serviceId?.trim();

  if (!serviceId) {
    return NextResponse.json(
      { message: "Service ID is required" },
      { status: 400 },
    );
  }

  try {
    const payload = await apiConnector<ServiceRegisterResponse>(
      "post",
      endpoints.SERVICES.REGISTER,
      { serviceId } satisfies ServiceRegisterRequest,
      authHeaders,
    );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "Unable to register for this service right now.",
    );
  }
}
