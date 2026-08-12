import { Suspense } from "react";

import { useTranslations } from "next-intl";

import { SupportSection } from "@/components/shared/support-section";
import { dashboardConfig } from "@/features/dashboard/config/dashboard-config";

import { DashboardDraftSavedNotice } from "./dashboard-draft-saved-notice";
import { DashboardEnrollmentSection } from "./dashboard-enrollment-section";
import { DashboardExpectationsSection } from "./dashboard-expectations-section";

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
      {/* The hero that used to sit here carried the page's top spacing as
          well as its heading, so both move down: the padding onto this
          container, the <h1> onto the enrollment card people actually came
          for. */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-8 pb-16 sm:gap-9 sm:px-6 sm:pt-10 sm:pb-20 lg:gap-12 lg:px-8 lg:pt-12 lg:pb-24">
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
