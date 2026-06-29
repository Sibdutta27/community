import { yucayekeHighlights } from "@/features/yucayeke/constants/yucayeke-content";
import { cn } from "@/lib/utils";

import { YucayekeHighlightCard } from "./yucayeke-highlight-card";
import sharedStyles from "../styles/yucayeke-shared.module.scss";

export function YucayekeHighlightsSection() {
  return (
    <section className="bg-[linear-gradient(180deg,#fff8e7_0%,#fffdf5_100%)]">
      <div
        className={cn(
          sharedStyles.sectionContainer,
          "pt-4 pb-14 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-20",
        )}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {yucayekeHighlights.map((card) => (
            <YucayekeHighlightCard
              key={card.title}
              description={card.description}
              iconSrc={card.iconSrc}
              title={card.title}
              tone={card.tone}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
