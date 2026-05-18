import { NextResponse } from "next/server";

import {
  createUnauthorizedResponse,
  getBackendAuthHeaders,
  mapBackendApiErrorResponse,
} from "@/app/api/_shared/backend-auth";
import type { CommunityEventRegistrationApiItem } from "@/features/community/types/community-event";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export async function POST() {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return createUnauthorizedResponse();
  }

  try {
    const payload = await apiConnector<CommunityEventRegistrationApiItem[]>(
      "post",
      endpoints.EVENTS.REGISTER_LIST,
      undefined,
      authHeaders,
    );

    return NextResponse.json(payload);
  } catch (error) {
    return mapBackendApiErrorResponse(
      error,
      "Unable to load registered events right now.",
    );
  }
}
