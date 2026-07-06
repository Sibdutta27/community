import { format, formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";

import {
  CommunityFeaturedAnnouncementCard,
  type CommunityFeaturedAnnouncementCardProps,
} from "@/features/community/components/community-featured-announcement-card";
import { getCommunityEventTone } from "@/features/community/constants/community-event-card-tones";
import type { CommunityEventApiItem } from "@/features/community/types/community-event";
import { cn } from "@/lib/utils";

import sharedStyles from "../styles/community-shared.module.scss";

type CommunityFeaturedAnnouncementsSectionProps = Readonly<{
  events: CommunityEventApiItem[];
}>;

type EventCardFallbacks = Readonly<{ badge: string; location: string }>;

function formatEventDate(dateTime: string) {
  return format(new Date(dateTime), "MMMM do");
}

function formatEventTimeRange(startDateTime: string, endDateTime: string) {
  return `${format(new Date(startDateTime), "h:mm a")} - ${format(new Date(endDateTime), "h:mm a")}`;
}

function buildFeaturedAnnouncementCardProps(
  event: CommunityEventApiItem,
  fallbacks: EventCardFallbacks,
): CommunityFeaturedAnnouncementCardProps {
  const badgeLabel = event.category?.name ?? fallbacks.badge;
  const publishedAgo = formatDistanceToNow(new Date(event.createdAt), {
    addSuffix: true,
  });

  return {
    attendeeCount: event.registrationCount ?? event._count?.registrations ?? 0,
    badgeLabel,
    dateLabel: formatEventDate(event.startDateTime),
    description: event.description,
    locationLabel: event.location ?? fallbacks.location,
    metaLabel: `${badgeLabel} • ${publishedAgo}`,
    timeLabel: formatEventTimeRange(event.startDateTime, event.endDateTime),
    title: event.title,
    tone: getCommunityEventTone(event.category?.key),
  };
}

export function CommunityFeaturedAnnouncementsSection({
  events,
}: CommunityFeaturedAnnouncementsSectionProps) {
  const t = useTranslations("community");

  if (events.length === 0) {
    return null;
  }

  const fallbacks: EventCardFallbacks = {
    badge: t("events.badgeFallback"),
    location: t("events.locationFallback"),
  };

  return (
    <section className="py-6 sm:py-8 lg:py-9">
      <div className={cn(sharedStyles.sectionContainer, "relative")}>
        <div className="max-w-xl">
          <h2 className="text-foreground text-[1.75rem] font-semibold tracking-tight sm:text-[1.95rem] lg:text-[2.05rem]">
            {t("featured.title")}
          </h2>
          <p className="text-muted-foreground mt-1.5 text-[0.95rem] leading-6">
            {t("featured.subtitle")}
          </p>
        </div>

        <div className="mt-5 grid gap-3.5 lg:mt-6 lg:grid-cols-2 lg:gap-4">
          {events.map((event) => {
            const cardProps = buildFeaturedAnnouncementCardProps(
              event,
              fallbacks,
            );

            return (
              <CommunityFeaturedAnnouncementCard
                key={event.id}
                {...cardProps}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
