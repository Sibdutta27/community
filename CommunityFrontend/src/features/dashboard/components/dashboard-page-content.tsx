import { SupportSection } from "@/components/shared/support-section";
import { dashboardConfig } from "@/features/dashboard/config/dashboard-config";

import { DashboardEnrollmentSection } from "./dashboard-enrollment-section";
import { DashboardExpectationsSection } from "./dashboard-expectations-section";
import { DashboardHeroSection } from "./dashboard-hero-section";

export function DashboardPageContent() {
  const { enrollment, expectations, hero } = dashboardConfig;

  return (
    <section aria-label="Enrollment application dashboard" className="w-full">
      <DashboardHeroSection description={hero.description} title={hero.title} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 sm:gap-9 sm:px-6 sm:pb-20 lg:gap-12 lg:px-8 lg:pb-24">
        <DashboardEnrollmentSection
          applicationStatusLabel={enrollment.applicationStatusLabel}
          description={enrollment.description}
          eyebrow={enrollment.eyebrow}
          sectionTitle={enrollment.sectionTitle}
        />
        <DashboardExpectationsSection {...expectations} />
        <SupportSection />
      </div>
    </section>
  );
}
