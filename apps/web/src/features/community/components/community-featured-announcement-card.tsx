import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  communityEventBadgeClasses,
  communityEventCardClasses,
  communityUpcomingEventIconWrapClass,
  type CommunityEventCardTone,
} from "@/features/community/constants/community-event-card-tones";

export type CommunityFeaturedAnnouncementCardProps = Readonly<{
  badgeLabel: string;
  dateLabel: string;
  description: string;
  locationLabel: string;
  metaLabel: string;
  timeLabel: string;
  title: string;
  attendeeCount: number;
  tone: CommunityEventCardTone;
}>;

export function CommunityFeaturedAnnouncementCard({
  attendeeCount,
  badgeLabel,
  dateLabel,
  description,
  locationLabel,
  metaLabel,
  timeLabel,
  title,
  tone,
}: CommunityFeaturedAnnouncementCardProps) {
  const t = useTranslations("community.events");

  return (
    <article
      className={`bg-surface flex h-full flex-col rounded-2xl border p-5 sm:p-6 ${communityEventCardClasses[tone]}`}
    >
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-3.5">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl border ${communityUpcomingEventIconWrapClass}`}
            >
              <CalendarDays aria-hidden="true" className="size-6" />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="text-foreground flex flex-wrap items-baseline gap-x-1.5 gap-y-0 text-[1.22rem] leading-[1.18] font-semibold tracking-tight sm:text-[1.35rem]">
                <span>{title} -</span>
                <span className="whitespace-nowrap">{dateLabel}</span>
              </h3>

              <p className="text-muted-foreground mt-1 text-[0.84rem] leading-5">
                {metaLabel}
              </p>

              <div className="text-foreground mt-2.5 inline-flex items-center gap-1.5 text-[0.86rem] font-medium whitespace-nowrap">
                <Users
                  aria-hidden="true"
                  className="text-muted-foreground size-4 shrink-0"
                />
                <span>{t("attending", { count: attendeeCount })}</span>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex min-w-[5.75rem] shrink-0 justify-center rounded-full px-3.5 py-1 text-[0.96rem] leading-none font-semibold tracking-tight ${communityEventBadgeClasses[tone]}`}
          >
            {badgeLabel}
          </span>
        </div>

        <p className="text-muted-foreground max-w-[34rem] text-[0.86rem] leading-[1.5]">
          {description}
        </p>
      </div>

      <div className="text-foreground mt-5 flex flex-col gap-2 text-[0.84rem] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
        <div className="inline-flex items-center gap-2">
          <MapPin
            aria-hidden="true"
            className="text-muted-foreground size-4 shrink-0"
          />
          <span className="leading-5">{locationLabel}</span>
        </div>

        <div className="inline-flex items-center gap-2">
          <Clock
            aria-hidden="true"
            className="text-muted-foreground size-4 shrink-0"
          />
          <span className="leading-5">{timeLabel}</span>
        </div>

        <div className="inline-flex items-center gap-2 sm:hidden">
          <CalendarDays
            aria-hidden="true"
            className="text-muted-foreground size-4 shrink-0"
          />
          <span className="leading-5">{dateLabel}</span>
        </div>
      </div>
    </article>
  );
}
