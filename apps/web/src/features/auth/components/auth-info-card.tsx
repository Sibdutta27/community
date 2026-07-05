import Image from "next/image";

import { SurfaceCard } from "@/components/shared/surface-card";
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
    <SurfaceCard as="article" className={cn("p-5 sm:p-6", className)} padding="none">
      <div className="flex items-start gap-3.5 sm:gap-4">
        <div className="border-border bg-surface-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl border">
          <Image
            alt=""
            aria-hidden="true"
            className="h-5 w-5 object-contain"
            height={24}
            src={iconSrc}
            width={24}
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-foreground text-[1.02rem] font-semibold tracking-tight sm:text-[1.12rem]">
            {title}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-xl text-[0.92rem] leading-6 sm:text-[0.96rem]">
            {description}
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}
