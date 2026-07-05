import Image from "next/image";

import { SurfaceCard } from "@/components/shared/surface-card";
import type { YucayekeHighlight } from "@/features/yucayeke/constants/yucayeke-content";

type YucayekeHighlightCardProps = Readonly<{
  description: string;
  iconSrc: YucayekeHighlight["iconSrc"];
  title: string;
}>;

// Governance restyle: one neutral ink tile for every highlight — the white
// icons stay legible without multicolor tiles (see design-system.md).
export function YucayekeHighlightCard({
  description,
  iconSrc,
  title,
}: YucayekeHighlightCardProps) {
  return (
    <SurfaceCard as="article" className="flex h-full flex-col">
      <div className="bg-foreground flex size-12 items-center justify-center rounded-xl">
        <Image
          alt=""
          aria-hidden="true"
          className="h-6 w-6 object-contain"
          height={24}
          src={iconSrc}
          width={24}
        />
      </div>

      <h3 className="text-foreground mt-4 text-[1.15rem] leading-tight font-semibold tracking-tight sm:text-[1.25rem]">
        {title}
      </h3>

      <p className="text-muted-foreground mt-2 text-[0.9rem] leading-6 sm:text-[0.95rem] sm:leading-6">
        {description}
      </p>
    </SurfaceCard>
  );
}
