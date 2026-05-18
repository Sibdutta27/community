import { yucayekeLegacyContent } from "@/features/yucayeke/constants/yucayeke-content";
import { cn } from "@/lib/utils";

import { YucayekeLegacyTimelineItem } from "./yucayeke-legacy-timeline-item";
import sharedStyles from "../styles/yucayeke-shared.module.scss";

export function YucayekeLegacySection() {
  const { badge, description, periods, titleHighlight, titlePrefix } =
    yucayekeLegacyContent;

  return (
    <section className="bg-white py-10 sm:py-12 lg:py-14">
      <div
        className={cn(sharedStyles.sectionContainer, "space-y-7 sm:space-y-8")}
      >
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex rounded-full bg-[#dff3ef] px-4 py-1.5 text-xs font-semibold tracking-tight text-[#113f3b] sm:px-5 sm:text-sm">
            {badge}
          </span>

          <h2 className="text-foreground mt-4 text-[1.55rem] font-semibold tracking-tight sm:text-[1.9rem] lg:text-[2.35rem]">
            {titlePrefix}{" "}
            <span className={sharedStyles.gradientText}>{titleHighlight}</span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-[0.9rem] leading-6 text-[#5a5f66] sm:text-[0.95rem] sm:leading-7">
            {description}
          </p>
        </div>

        <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,#fff6ea_0%,#fffaf2_100%)] px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6">
          <div className="mx-auto max-w-[64rem] space-y-4 sm:space-y-5 lg:space-y-6">
            {periods.map((period, index) => (
              <YucayekeLegacyTimelineItem
                isLast={index === periods.length - 1}
                key={`${period.yearLabel}-${period.title}`}
                period={period}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
