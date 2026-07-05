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
    <article className="border-border bg-surface shadow-card-soft grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2 rounded-2xl border px-3.5 py-3.5 sm:px-4 sm:py-3.5 lg:min-h-[72px] lg:px-3.5 lg:py-2.5 xl:min-h-[86px] xl:px-4 xl:py-3">
      <div className="border-surface bg-surface-muted shadow-card-soft relative size-12 shrink-0 overflow-hidden rounded-full border-[3px] sm:size-[3.5rem] lg:size-[3rem] xl:size-[3.35rem]">
        <Image
          fill
          alt={name}
          className="object-cover object-center"
          sizes="(max-width: 640px) 48px, (max-width: 1024px) 56px, 54px"
          src={portraitSrc}
        />
      </div>

      <div className="min-w-0 pt-0.5 sm:pt-0">
        <h3 className="text-foreground truncate text-[13px] leading-tight font-medium tracking-[-0.03em] sm:text-[14px] lg:text-[13px] xl:text-[15px]">
          {name}
        </h3>
        <p className="text-muted-foreground mt-0.5 truncate text-[10px] leading-tight sm:text-[11px] lg:text-[10px] xl:text-[12px]">
          {role} • Member ID: {memberId}
        </p>
      </div>

      <Button
        aria-label={`View ${name}`}
        className="shrink-0"
        variant="primary"
        size="sm"
        type="button"
      >
        View
      </Button>
    </article>
  );
}
