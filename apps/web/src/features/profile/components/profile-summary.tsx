import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SvgIcon } from "@/components/shared/svg-icon";

import type { ProfileDetail } from "../config/profile-config";

type ProfileSummaryProps = Readonly<{
  details: readonly ProfileDetail[];
  enrollmentStatus?: string | null;
  name: string;
  memberSince?: string;
  memberStatus: string;
}>;

export function ProfileSummary({
  details,
  enrollmentStatus,
  name,
  memberSince,
  memberStatus,
}: ProfileSummaryProps) {
  const canEditProfile = enrollmentStatus?.trim().toUpperCase() !== "APPROVED";

  return (
    <div className="max-w-[33rem] min-w-0 flex-1 text-left">
      <div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-2 lg:flex-nowrap">
        <h1 className="text-foreground max-w-[13ch] text-[clamp(1.6rem,6vw,2.35rem)] leading-[0.96] font-semibold tracking-[-0.05em] sm:max-w-none sm:text-[clamp(1.85rem,4vw,2.7rem)] lg:text-[clamp(2.1rem,3vw,3rem)] lg:leading-none">
          {name}
        </h1>

        <div className="border-primary/40 bg-secondary text-secondary-foreground shadow-card-soft inline-flex h-[30px] shrink-0 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold sm:h-8 sm:px-3 sm:text-[12px] lg:h-[30px] lg:px-2.5">
          <SvgIcon
            sizeClassName="size-2.5 sm:size-3"
            src="/icons/profile/verified.svg"
          />
          {memberStatus}
        </div>
      </div>

      {memberSince ? (
        <p className="text-foreground mt-2 text-[14px] font-semibold tracking-[-0.03em] sm:mt-2.5 sm:text-[16px] lg:text-[17px]">
          {memberSince}
        </p>
      ) : null}

      <div className="mt-4 grid justify-items-start gap-2.5 sm:grid-cols-2 sm:justify-items-start sm:gap-x-4 sm:gap-y-2.5 lg:flex lg:flex-wrap lg:items-center lg:gap-x-4 lg:gap-y-2">
        {details.map((detail) => (
          <div
            key={detail.value}
            className="flex min-w-0 items-center gap-1.5 whitespace-normal sm:whitespace-nowrap"
          >
            <SvgIcon
              sizeClassName="size-4 sm:size-[1.125rem]"
              src={detail.iconSrc}
            />
            <span className="text-foreground min-w-0 text-[12px] font-semibold tracking-[-0.02em] sm:text-[13px] sm:leading-none lg:text-[14px]">
              {detail.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex max-w-full items-center gap-2 sm:mt-6 sm:gap-2.5">
        {canEditProfile ? (
          <Button asChild size="sm" variant="primary">
            <Link href="/dashboard#enrollment-dashboard">
              <SvgIcon
                sizeClassName="size-4"
                src="/icons/profile/edit.svg"
                toneColor="var(--primary-foreground)"
              />
              <span>Edit Profile</span>
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
