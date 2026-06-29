import Image from "next/image";

import { cn } from "@/lib/utils";
import { montserrat } from "@/styles/fonts";

export type HomeEnrollmentNeedItemProps = Readonly<{
  iconSrc: string;
  title: string;
  description: string;
}>;

export function HomeEnrollmentNeedItem({
  iconSrc,
  title,
  description,
}: HomeEnrollmentNeedItemProps) {
  return (
    <li className="flex items-start gap-3.5 sm:gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#DDF3F8] sm:size-13">
        <Image
          alt=""
          aria-hidden="true"
          className="size-6 sm:size-7"
          src={iconSrc}
          width={32}
          height={32}
        />
      </div>

      <div className="min-w-0">
        <h4
          className={cn(
            montserrat.className,
            "text-[1rem] font-normal tracking-[-0.03em] text-[#fff4e8] sm:text-[1.18rem]",
          )}
        >
          {title}
        </h4>
        <p
          className={cn(
            montserrat.className,
            "mt-1 text-[0.84rem] leading-[1.45] text-[#e7dacc] sm:text-[0.92rem]",
          )}
        >
          {description}
        </p>
      </div>
    </li>
  );
}
