import Image from "next/image";
import { useMemo, useState } from "react";

import { SvgIcon } from "@/components/shared/svg-icon";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "M";
  }

  const firstInitial = parts[0].charAt(0);
  const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";

  return `${firstInitial}${lastInitial}`.toUpperCase();
}

export function ProfileAvatar({
  name,
  portraitSrc,
}: Readonly<{
  name: string;
  portraitSrc: string;
}>) {
  const [hasImageError, setHasImageError] = useState(false);
  const initials = useMemo(() => getInitials(name), [name]);
  const hasPortrait = portraitSrc.trim().length > 0 && !hasImageError;

  return (
    <div className="relative shrink-0">
      <div className="border-surface bg-surface-muted shadow-card-soft relative size-[7.75rem] overflow-hidden rounded-full border-[4px] sm:size-[8.75rem] sm:border-[5px] lg:size-[10rem] lg:border-[6px] xl:size-[10.75rem]">
        {hasPortrait ? (
          <Image
            fill
            priority
            alt={`${name} portrait`}
            className="object-cover object-center"
            onError={() => setHasImageError(true)}
            sizes="(max-width: 640px) 124px, (max-width: 1024px) 140px, (max-width: 1536px) 160px, 172px"
            src={portraitSrc}
          />
        ) : (
          <div className="bg-secondary text-secondary-foreground flex size-full items-center justify-center text-[2.1rem] font-semibold tracking-[-0.04em] sm:text-[2.35rem] lg:text-[2.6rem]">
            {initials}
          </div>
        )}
      </div>

      <SvgIcon
        className="absolute right-1 bottom-1 sm:right-1.5 sm:bottom-1.5 lg:right-2 lg:bottom-2"
        sizeClassName="size-[1.9rem] sm:size-[2.2rem] lg:size-[2.35rem] xl:size-[2.55rem]"
        src="/icons/profile/verified.svg"
      />
    </div>
  );
}
