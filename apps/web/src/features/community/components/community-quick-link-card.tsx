import Image from "next/image";
import Link from "next/link";

import type { CommunityQuickLinkItem } from "@/features/community/constants/community-quick-links";

type CommunityQuickLinkCardProps = Readonly<{
  description: CommunityQuickLinkItem["description"];
  href: CommunityQuickLinkItem["href"];
  iconBackgroundClassName: CommunityQuickLinkItem["iconBackgroundClassName"];
  iconSrc: CommunityQuickLinkItem["iconSrc"];
  title: CommunityQuickLinkItem["title"];
}>;

export function CommunityQuickLinkCard({
  description,
  href,
  iconBackgroundClassName,
  iconSrc,
  title,
}: CommunityQuickLinkCardProps) {
  return (
    <Link
      className="group flex h-full min-h-[11.5rem] flex-col rounded-[1.2rem] border border-black/12 bg-white px-4 py-4 shadow-[0_18px_38px_-34px_rgba(31,41,55,0.22)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-32px_rgba(31,41,55,0.24)] sm:min-h-[12rem] sm:px-4.5 sm:py-4.5"
      href={href}
    >
      <div
        className={`flex size-[2.7rem] items-center justify-center rounded-[0.8rem] text-white shadow-[0_14px_24px_-18px_rgba(17,24,39,0.3)] ${iconBackgroundClassName}`}
      >
        <Image alt="" aria-hidden="true" height={22} src={iconSrc} width={22} />
      </div>

      <h3 className="mt-4 text-[1.28rem] leading-[1.15] font-semibold tracking-[-0.04em] text-[#2d2d2d] sm:text-[1.38rem]">
        {title}
      </h3>

      <p className="mt-3 max-w-[22rem] text-[0.9rem] leading-6 text-[#4a4a4a]/88 sm:text-[0.94rem]">
        {description}
      </p>
    </Link>
  );
}
