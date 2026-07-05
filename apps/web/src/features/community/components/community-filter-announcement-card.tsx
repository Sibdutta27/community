import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  communityEventBadgeClasses,
  communityEventCardClasses,
  communityUpcomingEventIconWrapClass,
  type CommunityEventCardTone,
} from "@/features/community/constants/community-event-card-tones";

type CommunityFilterAnnouncementCardProps = Readonly<{
  attendeeCount: number;
  badgeLabel: string;
  dateLabel: string;
  description: string;
  isRegistering: boolean;
  isRegistered: boolean;
  locationLabel: string;
  metaLabel: string;
  onRegister: () => void;
  timeLabel: string;
  title: string;
  tone: CommunityEventCardTone;
}>;

export function CommunityFilterAnnouncementCard({
  attendeeCount,
  badgeLabel,
  dateLabel,
  description,
  isRegistering,
  isRegistered,
  locationLabel,
  metaLabel,
  onRegister,
  timeLabel,
  title,
  tone,
}: CommunityFilterAnnouncementCardProps) {
  return (
    <article
      className={`bg-surface w-full overflow-hidden rounded-2xl border p-5 sm:p-6 ${communityEventCardClasses[tone]}`}
    >
      <div className="flex flex-col gap-3.5">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3.5">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-3.5">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl border ${communityUpcomingEventIconWrapClass}`}
            >
              <CalendarDays aria-hidden="true" className="size-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-foreground flex flex-wrap items-baseline gap-x-1.5 gap-y-0 text-[1rem] leading-[1.16] font-semibold tracking-tight sm:text-[1.28rem]">
                <span>{title} -</span>
                <span className="whitespace-nowrap">{dateLabel}</span>
              </h3>

              <p className="text-muted-foreground mt-1.25 text-[0.88rem] leading-6 sm:text-[0.92rem]">
                {metaLabel}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-fit max-w-full self-start rounded-full px-3 py-1 text-[0.84rem] leading-none font-semibold tracking-tight sm:min-w-[5.75rem] sm:justify-center sm:px-3.5 sm:text-[0.9rem] ${communityEventBadgeClasses[tone]}`}
          >
            {badgeLabel}
          </span>
        </div>

        <p className="text-muted-foreground max-w-full text-[0.9rem] leading-[1.55] sm:max-w-[62rem] sm:text-[0.94rem] sm:leading-[1.45]">
          {description}
        </p>

        <div className="flex flex-col gap-3.5 md:flex-row md:items-end md:justify-between">
          <div className="text-foreground flex min-w-0 flex-col gap-2 text-[0.86rem] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
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

            <div className="inline-flex items-center gap-2">
              <Users
                aria-hidden="true"
                className="text-muted-foreground size-4 shrink-0"
              />
              <span className="leading-5">{attendeeCount} attending</span>
            </div>
          </div>

          <Button
            className="w-full sm:w-auto sm:min-w-[9.5rem]"
            disabled={isRegistering}
            loading={isRegistering}
            loadingText="Registering..."
            onClick={onRegister}
            size="sm"
            type="button"
            variant={isRegistered ? "secondary" : "primary"}
          >
            {isRegistered ? "Registered" : "Register"}
          </Button>
        </div>
      </div>
    </article>
  );
}
