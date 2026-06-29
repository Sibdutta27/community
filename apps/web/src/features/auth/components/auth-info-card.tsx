import Image from "next/image";

import { cn } from "@/lib/utils";

type AuthInfoCardProps = Readonly<{
  iconSrc: string;
  title: string;
  description: string;
  className?: string;
}>;

export function AuthInfoCard({
  iconSrc,
  title,
  description,
  className,
}: AuthInfoCardProps) {
  return (
    <article
      className={cn(
        "border-border bg-surface rounded-[1.65rem] border px-4 py-4 shadow-[0_18px_34px_-28px_rgba(21,17,13,0.14)] sm:px-5 sm:py-5",
        className,
      )}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        <Image
          alt=""
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 shrink-0 object-contain"
          height={24}
          src={iconSrc}
          width={24}
        />

        <div className="min-w-0">
          <h3 className="text-foreground text-[1.02rem] font-semibold tracking-[-0.03em] sm:text-[1.12rem]">
            {title}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-xl text-[0.92rem] leading-6 sm:text-[0.96rem]">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}
