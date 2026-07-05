import { useTranslations } from "next-intl";

import { yucayekeHighlights } from "@/features/yucayeke/constants/yucayeke-content";
import { cn } from "@/lib/utils";

import { YucayekeHighlightCard } from "./yucayeke-highlight-card";
import sharedStyles from "../styles/yucayeke-shared.module.scss";

export function YucayekeHighlightsSection() {
  const t = useTranslations("yucayeke.highlights");

  return (
    <section className="bg-background">
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        {/* Keeps the outline logical (h1 → h2 → card h3s) without adding
            visual chrome the design doesn't call for. */}
        <h2 className="sr-only">{t("srHeading")}</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {yucayekeHighlights.map((card) => (
            <YucayekeHighlightCard
              key={card.key}
              description={t(`${card.key}.description`)}
              iconSrc={card.iconSrc}
              title={t(`${card.key}.title`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
