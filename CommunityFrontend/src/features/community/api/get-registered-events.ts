import { getBackendAuthHeaders } from "@/app/api/_shared/backend-auth";
import type { CommunityEventRegistrationApiItem } from "@/features/community/types/community-event";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export async function getRegisteredCommunityEvents(): Promise<
  CommunityEventRegistrationApiItem[]
> {
  const authHeaders = await getBackendAuthHeaders();

  if (!authHeaders) {
    return [];
  }

  return apiConnector<CommunityEventRegistrationApiItem[]>(
    "post",
    endpoints.EVENTS.REGISTER_LIST,
    undefined,
    authHeaders,
  );
}
