import Image from "next/image";

import { cn } from "@/lib/utils";

// Governance restyle: one warm-neutral card tone instead of pastel multicolor.
const expectationToneClasses = {
  sand: "bg-surface-muted",
  peach: "bg-surface-muted",
  lavender: "bg-surface-muted",
} as const;

type DashboardExpectationCardProps = Readonly<{
  iconSrc: string;
  title: string;
  tone: keyof typeof expectationToneClasses;
}>;

export function DashboardExpectationCard({
  iconSrc,
  title,
  tone,
}: DashboardExpectationCardProps) {
  return (
    <article
      className={cn(
        "flex min-h-[8.5rem] flex-col items-center justify-center rounded-[22px] px-6 py-7 text-center shadow-[0_18px_40px_-34px_rgba(11,32,51,0.18)] sm:min-h-[9rem] sm:px-8 sm:py-8",
        expectationToneClasses[tone],
      )}
    >
      <Image
        alt=""
        aria-hidden="true"
        className="h-8 w-8 object-contain sm:h-9 sm:w-9"
        height={36}
        src={iconSrc}
        width={36}
      />

      <h3 className="text-foreground mt-5 text-[1.35rem] leading-tight font-semibold tracking-[-0.04em] sm:text-[1.5rem]">
        {title}
      </h3>
    </article>
  );
}
