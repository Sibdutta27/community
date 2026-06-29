import Image from "next/image";

import { Button } from "@/components/ui/button";

type ProfileRegionalMemberCardProps = Readonly<{
  memberId: string;
  name: string;
  portraitSrc: string;
  role: string;
}>;

export function ProfileRegionalMemberCard({
  memberId,
  name,
  portraitSrc,
  role,
}: ProfileRegionalMemberCardProps) {
  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2 rounded-[18px] bg-[#efefef] px-3.5 py-3.5 shadow-[0_14px_34px_-28px_rgba(16,47,52,0.22)] sm:px-4 sm:py-3.5 lg:min-h-[72px] lg:px-3.5 lg:py-2.5 xl:min-h-[86px] xl:px-4 xl:py-3">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-[3px] border-[#155f61] bg-white shadow-[0_10px_24px_-16px_rgba(16,47,52,0.36)] sm:size-[3.5rem] sm:border-[3px] lg:size-[3rem] xl:size-[3.35rem]">
        <Image
          fill
          alt={name}
          className="object-cover object-center"
          sizes="(max-width: 640px) 48px, (max-width: 1024px) 56px, 54px"
          src={portraitSrc}
        />
      </div>

      <div className="min-w-0 pt-0.5 sm:pt-0">
        <h3 className="text-[13px] leading-tight font-medium tracking-[-0.03em] text-[#4b4b4b] sm:text-[14px] lg:text-[13px] xl:text-[15px]">
          {name}
        </h3>
        <p className="mt-0.5 text-[10px] leading-tight text-[#5f5f5f] sm:text-[11px] lg:text-[10px] xl:text-[12px]">
          {role} • Member ID: {memberId}
        </p>
      </div>

      <Button
        aria-label={`View ${name}`}
        className="h-[32px] min-w-[64px] shrink-0 rounded-[10px] bg-[#215A64] px-3 text-[12px] font-semibold tracking-[-0.02em] text-white shadow-[0_12px_22px_-20px_rgba(16,47,52,0.32)] hover:bg-[#1b4a52] hover:text-white sm:h-[34px] sm:min-w-[68px] sm:px-3.5 sm:text-[12px] lg:h-[32px] lg:min-w-[60px] lg:px-3 lg:text-[11px] xl:h-[36px] xl:min-w-[70px] xl:text-[13px]"
        variant="ghost"
        size="xl"
        type="button"
      >
        View
      </Button>
    </article>
  );
}
