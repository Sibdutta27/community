import { getEventCategories } from "@/features/community/api/get-event-categories";
import { getRegisteredCommunityEvents } from "@/features/community/api/get-registered-events";
import { getUpcomingCommunityEvents } from "@/features/community/api/get-upcoming-events";
import { CommunityFilterAnnouncementsSection } from "@/features/community/components/community-filter-announcements-section";
import { CommunityFeaturedAnnouncementsSection } from "@/features/community/components/community-featured-announcements-section";
import { CommunityQuickLinksSection } from "@/features/community/components/community-quick-links-section";
import type { CommunityEventApiItem } from "@/features/community/types/community-event";
import { CommunityHero } from "@/features/community/components/community-hero";
import { getSessionUser } from "@/lib/auth-session";

function getRegistrationCount(event: CommunityEventApiItem) {
  return event.registrationCount ?? event._count?.registrations ?? 0;
}

export async function CommunityPageContent() {
  const [eventCategories, upcomingEvents, sessionUser] = await Promise.all([
    getEventCategories(),
    getUpcomingCommunityEvents(),
    getSessionUser(),
  ]);
  const registeredEvents = sessionUser
    ? await getRegisteredCommunityEvents()
    : [];
  const initialRegisteredEventIds = registeredEvents.map(
    (eventRegistration) => eventRegistration.eventId,
  );
  const featuredEvents = [...upcomingEvents]
    .sort(
      (left, right) => getRegistrationCount(right) - getRegistrationCount(left),
    )
    .slice(0, 2);

  return (
    <main className="bg-background">
      <CommunityHero />
      <CommunityFeaturedAnnouncementsSection events={featuredEvents} />
      <CommunityFilterAnnouncementsSection
        initialCategories={eventCategories}
        initialEvents={upcomingEvents}
        initialRegisteredEventIds={initialRegisteredEventIds}
        isAuthenticated={Boolean(sessionUser)}
      />
      <CommunityQuickLinksSection />
    </main>
  );
}
