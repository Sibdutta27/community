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
      <div className="bg-surface flex size-12 shrink-0 items-center justify-center rounded-full sm:size-13">
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
            "text-background text-[1rem] font-normal tracking-[-0.03em] sm:text-[1.18rem]",
          )}
        >
          {title}
        </h4>
        <p
          className={cn(
            montserrat.className,
            "text-background/70 mt-1 text-[0.84rem] leading-[1.45] sm:text-[0.92rem]",
          )}
        >
          {description}
        </p>
      </div>
    </li>
  );
}
