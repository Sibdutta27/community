import { Suspense } from "react";

import { useTranslations } from "next-intl";

import { SupportSection } from "@/components/shared/support-section";
import { dashboardConfig } from "@/features/dashboard/config/dashboard-config";

import { DashboardDraftSavedNotice } from "./dashboard-draft-saved-notice";
import { DashboardEnrollmentSection } from "./dashboard-enrollment-section";
import { DashboardExpectationsSection } from "./dashboard-expectations-section";
import { DashboardHeroSection } from "./dashboard-hero-section";

// Expectation glyphs stay in config; only their labels are translated, paired
// by position with the `dashboard.expectations.cards.*` message keys.
const EXPECTATION_CARD_KEYS = ["secure", "progress", "support"] as const;

export function DashboardPageContent() {
  const t = useTranslations("dashboard");

  const expectationCards = dashboardConfig.expectations.cards.map(
    (card, index) => ({
      iconSrc: card.iconSrc,
      title: t(`expectations.cards.${EXPECTATION_CARD_KEYS[index]}`),
    }),
  );

  return (
    <section aria-label={t("enrollment.eyebrow")} className="w-full">
      <DashboardHeroSection
        description={t("hero.description")}
        title={{
          prefix: t("hero.titlePrefix"),
          highlight: t("hero.titleHighlight"),
          suffix: t("hero.titleSuffix"),
        }}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 sm:gap-9 sm:px-6 sm:pb-20 lg:gap-12 lg:px-8 lg:pb-24">
        {/* useSearchParams requires a Suspense boundary during prerender. */}
        <Suspense fallback={null}>
          <DashboardDraftSavedNotice />
        </Suspense>
        <DashboardEnrollmentSection />
        <DashboardExpectationsSection
          cards={expectationCards}
          description={t("expectations.description")}
          title={t("expectations.title")}
        />
        <SupportSection />
      </div>
    </section>
  );
}
