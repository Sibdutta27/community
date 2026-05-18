import type {
  CommunityMeta,
  YucayekeHeroStats,
} from "@/features/yucayeke/types/community-meta";
import { endpoints } from "@/services/http/apis";
import { apiConnector } from "@/services/http/client";
import type { CommunityEventApiItem } from "@/features/community/types/community-event";

function coerceCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function getYucayekeHeroStats(): Promise<YucayekeHeroStats> {
  const [meta, events] = await Promise.all([
    apiConnector<CommunityMeta>("get", endpoints.ACCOUNT.COMMUNITY_META),
    apiConnector<CommunityEventApiItem[]>("get", endpoints.EVENTS.LIST),
  ]);

  return {
    totalMembers: coerceCount(meta.totalUsersCount),
    activeMembers: coerceCount(meta.activeUserCounts),
    upcomingEvents: events.length,
  };
}
