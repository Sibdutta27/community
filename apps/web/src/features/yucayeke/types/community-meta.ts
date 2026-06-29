export type CommunityMetaRecentUser = Readonly<{
  email?: string | null;
  id: string;
  name?: string | null;
}>;

export type CommunityMeta = Readonly<{
  activeUserCounts: number;
  recentUsers?: CommunityMetaRecentUser[];
  totalEnrolledUsersCount: number;
  totalUsersCount: number;
}>;

export type YucayekeHeroStats = Readonly<{
  activeMembers: number;
  totalMembers: number;
  upcomingEvents: number;
}>;
