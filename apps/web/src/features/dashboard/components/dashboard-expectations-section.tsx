import type { DashboardExpectationCard as DashboardExpectationCardItem } from "@/features/dashboard/config/dashboard-config";

import { DashboardExpectationCard } from "./dashboard-expectation-card";

type DashboardExpectationsSectionProps = Readonly<{
  title: string;
  description: string;
  cards: readonly DashboardExpectationCardItem[];
}>;

export function DashboardExpectationsSection({
  title,
  description,
  cards,
}: DashboardExpectationsSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-1 text-center sm:px-2">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[clamp(2rem,4vw,3rem)] leading-tight font-semibold tracking-[-0.05em] text-[#0c4037]">
          {title}
        </h2>

        <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-[#3f4347] sm:text-base">
          {description}
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <DashboardExpectationCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
