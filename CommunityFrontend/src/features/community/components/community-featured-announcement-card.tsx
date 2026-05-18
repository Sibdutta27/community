import Image from "next/image";

import { CalendarDays } from "lucide-react";

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
  return (
    <article
      className={`flex h-full flex-col rounded-[1.2rem] border bg-white px-3.5 py-3.5 sm:px-4 sm:py-4 lg:px-4.5 lg:py-4.5 ${communityEventCardClasses[tone]}`}
    >
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            <div
              className={`flex size-[3.1rem] shrink-0 items-center justify-center rounded-full border-[3px] sm:size-[3.25rem] ${communityUpcomingEventIconWrapClass}`}
            >
              <Image
                alt=""
                aria-hidden="true"
                height={28}
                src="/icons/events/events-upcoming.svg"
                width={28}
              />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0 text-[1.22rem] leading-[1.18] font-semibold tracking-[-0.04em] text-[#0d4d49] sm:text-[1.35rem]">
                <span>{title} -</span>
                <span className="whitespace-nowrap">{dateLabel}</span>
              </h3>

              <p className="mt-1 text-[0.84rem] leading-5 text-[#171717]/68">
                {metaLabel}
              </p>

              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[0.86rem] font-medium whitespace-nowrap text-[#171717]">
                <Image
                  alt=""
                  aria-hidden="true"
                  height={14}
                  src="/icons/events/events-attending.svg"
                  width={14}
                />
                <span>{attendeeCount} attending</span>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex min-w-[5.75rem] shrink-0 justify-center rounded-full px-3.5 py-1 text-[0.96rem] leading-none font-semibold tracking-[-0.04em] ${communityEventBadgeClasses[tone]}`}
          >
            {badgeLabel}
          </span>
        </div>

        <p className="max-w-[34rem] text-[0.86rem] leading-[1.5] text-[#171717]/72">
          {description}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2 text-[0.84rem] text-[#171717] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
        <div className="inline-flex items-center gap-2">
          <Image
            alt=""
            aria-hidden="true"
            height={16}
            src="/icons/events/events-location.svg"
            width={16}
          />
          <span className="leading-5">{locationLabel}</span>
        </div>

        <div className="inline-flex items-center gap-2">
          <Image
            alt=""
            aria-hidden="true"
            height={16}
            src="/icons/events/events-time.svg"
            width={16}
          />
          <span className="leading-5">{timeLabel}</span>
        </div>

        <div className="inline-flex items-center gap-2 sm:hidden">
          <CalendarDays className="size-4 shrink-0 text-[#095f58]" />
          <span className="leading-5">{dateLabel}</span>
        </div>
      </div>
    </article>
  );
}
