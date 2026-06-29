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

const toneClasses: Record<YucayekeHighlightTone, { iconBox: string }> = {
  teal: {
    iconBox: "bg-[linear-gradient(135deg,#1e8fb4_0%,#2ab2cb_100%)]",
  },
  copper: {
    iconBox: "bg-[linear-gradient(135deg,#9b4e1f_0%,#c96d35_100%)]",
  },
  green: {
    iconBox: "bg-[linear-gradient(135deg,#156f59_0%,#24856c_100%)]",
  },
};

export function YucayekeHighlightCard({
  description,
  iconSrc,
  title,
  tone,
}: YucayekeHighlightCardProps) {
  const toneClass = toneClasses[tone];

  return (
    <article className="flex h-full flex-col rounded-[1.6rem] border border-[#d8d2bf] bg-white/88 px-4 py-4 shadow-[0_18px_42px_-38px_rgba(16,47,52,0.3)] backdrop-blur-sm sm:px-5 sm:py-5">
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

      <h3 className="mt-3 text-[1.45rem] leading-tight font-semibold tracking-tight text-[#083b34] sm:text-[1.55rem]">
        {title}
      </h3>

      <p className="mt-2 max-w-[18rem] text-[0.9rem] leading-6 text-[#263437]/78 sm:text-[0.95rem] sm:leading-6">
        {description}
      </p>
    </article>
  );
}
