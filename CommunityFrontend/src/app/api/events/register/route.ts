import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import type {
  CommunityEventRegisterRequest,
  CommunityEventRegisterResponse,
} from "@/features/community/types/community-event";

export async function POST(request: Request) {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  const body = (await request
    .json()
    .catch(() => null)) as Partial<CommunityEventRegisterRequest> | null;
  const eventId = body?.eventId?.trim();

  if (!eventId) {
    return NextResponse.json(
      { message: "Event ID is required" },
      { status: 400 },
    );
  }

  try {
    const payload = await apiConnector<CommunityEventRegisterResponse>(
      "post",
      endpoints.EVENTS.REGISTER,
      { eventId } satisfies CommunityEventRegisterRequest,
      authHeaders,
    );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "Unable to register for this event right now.",
    );
  }
}
