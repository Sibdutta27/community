import { yucayekeHighlights } from "@/features/yucayeke/constants/yucayeke-content";
import { cn } from "@/lib/utils";

import { YucayekeHighlightCard } from "./yucayeke-highlight-card";
import sharedStyles from "../styles/yucayeke-shared.module.scss";

export function YucayekeHighlightsSection() {
  return (
    <section className="bg-background">
      <div
        className={cn(sharedStyles.sectionContainer, "py-10 sm:py-12 lg:py-14")}
      >
        {/* Keeps the outline logical (h1 → h2 → card h3s) without adding
            visual chrome the design doesn't call for. */}
        <h2 className="sr-only">Region highlights</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {yucayekeHighlights.map((card) => (
            <YucayekeHighlightCard
              key={card.title}
              description={card.description}
              iconSrc={card.iconSrc}
              title={card.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
