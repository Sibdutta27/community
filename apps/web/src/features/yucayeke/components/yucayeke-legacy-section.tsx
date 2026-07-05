import { useTranslations } from "next-intl";

import { yucayekeLegacyPeriods } from "@/features/yucayeke/constants/yucayeke-content";
import { cn } from "@/lib/utils";

import { YucayekeLegacyTimelineItem } from "./yucayeke-legacy-timeline-item";
import sharedStyles from "../styles/yucayeke-shared.module.scss";

export function YucayekeLegacySection() {
  const t = useTranslations("yucayeke.legacy");

  return (
    <section className="bg-surface py-10 sm:py-12 lg:py-14">
      <div
        className={cn(sharedStyles.sectionContainer, "space-y-7 sm:space-y-8")}
      >
        <div className="mx-auto max-w-4xl text-center">
          <span className="border-border bg-surface-muted text-foreground inline-flex rounded-full border px-4 py-1.5 text-xs font-semibold tracking-tight sm:px-5 sm:text-sm">
            {t("badge")}
          </span>

          <h2 className="text-foreground mt-4 text-[1.55rem] font-semibold tracking-tight sm:text-[1.9rem] lg:text-[2.35rem]">
            {t("titlePrefix")}{" "}
            <span className={sharedStyles.gradientText}>
              {t("titleHighlight")}
            </span>
          </h2>

          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-[0.9rem] leading-6 sm:text-[0.95rem] sm:leading-7">
            {t("description")}
          </p>
        </div>

        <div className="border-border bg-surface-muted/50 rounded-2xl border px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6">
          <ol className="mx-auto max-w-[64rem] list-none space-y-4 sm:space-y-5 lg:space-y-6">
            {yucayekeLegacyPeriods.map((period, index) => (
              <YucayekeLegacyTimelineItem
                isLast={index === yucayekeLegacyPeriods.length - 1}
                key={period.key}
                period={{
                  yearLabel: period.yearLabel,
                  title: t(`periods.${period.key}.title`),
                  description: t(`periods.${period.key}.description`),
                }}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
