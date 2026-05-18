import type { CommunityEventCategory } from "@/features/community/types/community-event";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export async function getEventCategories(): Promise<CommunityEventCategory[]> {
  return apiConnector<CommunityEventCategory[]>(
    "get",
    endpoints.EVENTS.CATEGORIES,
  );
}
