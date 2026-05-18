import type { CommunityEventApiItem } from "@/features/community/types/community-event";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";

export async function getUpcomingCommunityEvents(): Promise<
  CommunityEventApiItem[]
> {
  return apiConnector<CommunityEventApiItem[]>("get", endpoints.EVENTS.LIST);
}
