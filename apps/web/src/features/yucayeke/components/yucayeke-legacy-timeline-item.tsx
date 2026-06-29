import type { YucayekeLegacyPeriod } from "@/features/yucayeke/constants/yucayeke-content";

type YucayekeLegacyTimelineItemProps = Readonly<{
  isLast: boolean;
  period: YucayekeLegacyPeriod;
}>;

export function YucayekeLegacyTimelineItem({
  isLast,
  period,
}: YucayekeLegacyTimelineItemProps) {
  return (
    <article className="grid gap-3 md:grid-cols-[4.1rem_minmax(0,1fr)] md:gap-5">
      <div className="hidden md:flex md:flex-col md:items-center">
        <div className="flex h-[3.5rem] w-[3.5rem] items-center justify-center rounded-full border-[3px] border-[#0a5b55] bg-white text-[1.1rem] font-semibold tracking-tight text-[#113f3b]">
          {period.yearLabel}
        </div>

        {!isLast ? (
          <div className="mt-2.5 min-h-16 w-1 rounded-full bg-[#0a5b55]" />
        ) : null}
      </div>

      <div className="rounded-[1.3rem] border border-[#a8cbc8] bg-white px-3.5 py-3.5 shadow-[0_14px_30px_-30px_rgba(16,47,52,0.22)] sm:px-4 sm:py-4 lg:px-5">
        <div className="mb-2.5 flex items-center gap-3 md:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0a5b55] bg-white text-[0.95rem] font-semibold tracking-tight text-[#113f3b]">
            {period.yearLabel}
          </div>
          <div className="h-px flex-1 bg-[#a8cbc8]" />
        </div>

        <h3 className="text-[1rem] leading-tight font-semibold tracking-tight text-[#113f3b] sm:text-[1.1rem]">
          {period.title}
        </h3>

        <p className="mt-2.5 text-justify text-[0.86rem] leading-6 text-[#4e5459] sm:text-[0.9rem] sm:leading-6">
          {period.description}
        </p>
      </div>
    </article>
  );
}
