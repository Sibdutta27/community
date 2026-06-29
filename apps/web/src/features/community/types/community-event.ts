export type CommunityEventCategory = Readonly<{
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
}>;

export type CommunityEventApiItem = Readonly<{
  id: string;
  title: string;
  description: string;
  categoryId: string;
  startDateTime: string;
  endDateTime: string;
  locationType: "PHYSICAL" | "ONLINE" | "HYBRID";
  location: string | null;
  meetingUrl: string | null;
  maxCapacity: number | null;
  isFeatured: boolean;
  externalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  category: CommunityEventCategory | null;
  _count?: Readonly<{
    registrations?: number;
  }>;
  registrationCount?: number;
}>;

export type CommunityEventRegisterRequest = Readonly<{
  eventId: string;
}>;

export type CommunityEventRegisterResponse = Readonly<{
  success: boolean;
  message: string;
}>;

export type CommunityEventRegistrationApiItem = Readonly<{
  createdAt: string;
  event: CommunityEventApiItem;
  eventId: string;
  id: string;
  userId: string;
}>;
