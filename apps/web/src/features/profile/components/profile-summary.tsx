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
        <h1 className="max-w-[13ch] text-[clamp(1.6rem,6vw,2.35rem)] leading-[0.96] font-semibold tracking-[-0.05em] text-[#135e71] sm:max-w-none sm:text-[clamp(1.85rem,4vw,2.7rem)] lg:text-[clamp(2.1rem,3vw,3rem)] lg:leading-none">
          {name}
        </h1>

        <div className="inline-flex h-[30px] shrink-0 items-center gap-1 rounded-full border border-[#1f8ca5] bg-[#e5f5fa] px-2.5 text-[11px] font-semibold text-[#0f4f5f] shadow-[0_10px_24px_-18px_rgba(31,140,165,0.55)] sm:h-8 sm:px-3 sm:text-[12px] lg:h-[30px] lg:px-2.5">
          <SvgIcon
            sizeClassName="size-2.5 sm:size-3"
            src="/icons/profile/verified.svg"
          />
          {memberStatus}
        </div>
      </div>

      {memberSince ? (
        <p className="mt-2 text-[14px] font-semibold tracking-[-0.03em] text-[#2f3336] sm:mt-2.5 sm:text-[16px] lg:text-[17px]">
          {memberSince}
        </p>
      ) : null}

      <div className="mt-4 grid justify-items-start gap-2.5 sm:grid-cols-2 sm:justify-items-start sm:gap-x-4 sm:gap-y-2.5 lg:flex lg:flex-wrap lg:items-center lg:gap-x-4 lg:gap-y-2">
        {details.map((detail) => (
          <div
            key={detail.value}
            className="flex items-center gap-1.5 whitespace-normal sm:whitespace-nowrap"
          >
            <SvgIcon
              sizeClassName="size-4 sm:size-[1.125rem]"
              src={detail.iconSrc}
            />
            <span className="text-[12px] font-semibold tracking-[-0.02em] text-[#174451] sm:text-[13px] sm:leading-none lg:text-[14px]">
              {detail.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex max-w-full items-center gap-2 sm:mt-6 sm:gap-2.5">
        {canEditProfile ? (
          <Button
            variant="ghost"
            className="h-[38px] shrink-0 rounded-[10px] bg-[#215A64] px-3 text-[12px] font-medium tracking-[-0.02em] whitespace-nowrap text-white shadow-[0_12px_24px_-20px_rgba(16,47,52,0.4)] hover:bg-[#1b4a52] hover:text-white sm:h-[40px] sm:px-3.5 sm:text-[13px] lg:h-[38px] lg:px-3"
            leftIcon={
              <SvgIcon
                sizeClassName="size-[0.95rem] sm:size-4"
                src="/icons/profile/edit.svg"
              />
            }
            size="xl"
            type="button"
            onClick={() => {
              window.location.href = "/dashboard#enrollment-dashboard";
            }}
          >
            Edit Profile
          </Button>
        ) : null}
      </div>
    </div>
  );
}
