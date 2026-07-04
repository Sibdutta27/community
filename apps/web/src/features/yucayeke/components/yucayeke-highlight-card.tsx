import Image from "next/image";

import type {
  YucayekeHighlight,
  YucayekeHighlightTone,
} from "@/features/yucayeke/constants/yucayeke-content";
import { cn } from "@/lib/utils";

type YucayekeHighlightCardProps = Readonly<{
  description: string;
  iconSrc: YucayekeHighlight["iconSrc"];
  title: string;
  tone: YucayekeHighlightTone;
}>;

// Governance restyle: one neutral charcoal tile for every highlight — the
// white icons stay legible without multicolor tiles.
const toneClasses: Record<YucayekeHighlightTone, { iconBox: string }> = {
  teal: { iconBox: "bg-foreground" },
  copper: { iconBox: "bg-foreground" },
  green: { iconBox: "bg-foreground" },
};

export function YucayekeHighlightCard({
  description,
  iconSrc,
  title,
  tone,
}: YucayekeHighlightCardProps) {
  const toneClass = toneClasses[tone];

  return (
    <article className="border-border flex h-full flex-col rounded-[1.6rem] border bg-white/88 px-4 py-4 shadow-[0_18px_42px_-38px_rgba(20,26,34,0.3)] backdrop-blur-sm sm:px-5 sm:py-5">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          toneClass.iconBox,
        )}
      >
        <Image
          alt=""
          aria-hidden="true"
          className="h-6 w-6 object-contain"
          height={24}
          src={iconSrc}
          width={24}
        />
      </div>

      <h3 className="text-foreground mt-3 text-[1.45rem] leading-tight font-semibold tracking-tight sm:text-[1.55rem]">
        {title}
      </h3>

      <p className="text-muted-foreground mt-2 max-w-[18rem] text-[0.9rem] leading-6 sm:text-[0.95rem] sm:leading-6">
        {description}
      </p>
    </article>
  );
}
