import Image from "next/image";

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
  const buttonClassName = isRegistered
    ? "!bg-[#aa2628] hover:!bg-[#aa2628]"
    : "!bg-primary hover:!brightness-95";

  return (
    <article
      className={`w-full overflow-hidden rounded-[1.2rem] border bg-white px-4 py-4 ${communityEventCardClasses[tone]} sm:px-5 sm:py-5`}
    >
      <div className="flex flex-col gap-3.5">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3.5">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-3.5">
            <div
              className={`flex size-[3rem] shrink-0 items-center justify-center rounded-full border-[3px] sm:size-[3.35rem] ${communityUpcomingEventIconWrapClass}`}
            >
              <Image
                alt=""
                aria-hidden="true"
                height={24}
                src="/icons/events/events-upcoming.svg"
                width={24}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0 text-[1rem] leading-[1.16] font-semibold tracking-[-0.04em] text-[#0d4d49] sm:text-[1.28rem]">
                <span>{title} -</span>
                <span className="whitespace-nowrap">{dateLabel}</span>
              </h3>

              <p className="mt-1.25 text-[0.88rem] leading-6 text-[#171717]/68 sm:text-[0.92rem]">
                {metaLabel}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-fit max-w-full self-start rounded-full px-3 py-1 text-[0.84rem] leading-none font-semibold tracking-[-0.04em] sm:min-w-[5.75rem] sm:justify-center sm:px-3.5 sm:text-[0.9rem] ${communityEventBadgeClasses[tone]}`}
          >
            {badgeLabel}
          </span>
        </div>

        <p className="max-w-full text-[0.9rem] leading-[1.55] text-[#171717]/74 sm:max-w-[62rem] sm:text-[0.94rem] sm:leading-[1.45]">
          {description}
        </p>

        <div className="flex flex-col gap-3.5 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col gap-2 text-[0.86rem] text-[#171717] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
            <div className="inline-flex items-center gap-2">
              <Image
                alt=""
                aria-hidden="true"
                height={15}
                src="/icons/events/events-location.svg"
                width={15}
              />
              <span className="leading-5">{locationLabel}</span>
            </div>

            <div className="inline-flex items-center gap-2">
              <Image
                alt=""
                aria-hidden="true"
                height={15}
                src="/icons/events/events-time.svg"
                width={15}
              />
              <span className="leading-5">{timeLabel}</span>
            </div>

            <div className="inline-flex items-center gap-2">
              <Image
                alt=""
                aria-hidden="true"
                height={15}
                src="/icons/events/events-attending.svg"
                width={15}
              />
              <span className="leading-5">{attendeeCount} attending</span>
            </div>
          </div>

          <Button
            className={`h-10 w-full !rounded-[0.85rem] text-[0.98rem] font-semibold !text-white shadow-none sm:w-auto sm:min-w-[9.5rem] ${buttonClassName}`}
            disabled={isRegistering}
            onClick={onRegister}
            type="button"
            variant="ghost"
          >
            {isRegistering
              ? "Registering..."
              : isRegistered
                ? "Registered"
                : "Register"}
          </Button>
        </div>
      </div>
    </article>
  );
}
