import Image from "next/image";

import { cn } from "@/lib/utils";

const expectationToneClasses = {
  sand: "bg-[#FFF9DA]",
  peach: "bg-[#FCDBCE]",
  lavender: "bg-[#EDECFF]",
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
        "flex min-h-[8.5rem] flex-col items-center justify-center rounded-[22px] px-6 py-7 text-center shadow-[0_18px_40px_-34px_rgba(16,47,52,0.18)] sm:min-h-[9rem] sm:px-8 sm:py-8",
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

      <h3 className="mt-5 text-[1.35rem] leading-tight font-semibold tracking-[-0.04em] text-[#3e3e45] sm:text-[1.5rem]">
        {title}
      </h3>
    </article>
  );
}
