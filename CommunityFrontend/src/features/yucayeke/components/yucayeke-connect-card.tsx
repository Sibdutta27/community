import Image from "next/image";
import Link from "next/link";

import type { YucayekeConnectionLink } from "@/features/yucayeke/constants/yucayeke-content";

type YucayekeConnectCardProps = Readonly<{
  link: YucayekeConnectionLink;
}>;

export function YucayekeConnectCard({ link }: YucayekeConnectCardProps) {
  return (
    <Link
      className="group flex h-full min-h-[11.5rem] flex-col items-center rounded-[1.2rem] border border-white/14 bg-white/12 px-4 py-4 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/14 sm:min-h-[12rem] sm:px-[1.125rem] sm:py-[1.125rem]"
      href={link.href}
    >
      <div className="flex size-[2.7rem] items-center justify-center rounded-[0.8rem] bg-white/18">
        <Image
          alt=""
          aria-hidden="true"
          className="h-[1.375rem] w-[1.375rem] object-contain"
          height={22}
          src={link.iconSrc}
          width={22}
        />
      </div>

      <h3 className="mt-4 text-[1.28rem] leading-[1.15] font-semibold tracking-[-0.04em] text-white sm:text-[1.38rem]">
        {link.title}
      </h3>

      <p className="mt-3 max-w-[22rem] text-[0.9rem] leading-6 text-white/76 sm:text-[0.94rem]">
        {link.description}
      </p>

      <span className="mt-auto pt-4 text-[0.98rem] font-semibold tracking-tight text-white transition-opacity duration-200 group-hover:opacity-88">
        {link.ctaLabel}
      </span>
    </Link>
  );
}
