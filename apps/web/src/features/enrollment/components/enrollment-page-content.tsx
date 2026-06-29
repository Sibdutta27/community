import { HomeEnrollmentFaqSection } from "@/features/home/components/home-enrollment-faq-section";
import { HomeEnrollmentProcessSection } from "@/features/home/components/home-enrollment-process-section";

import { EnrollmentHero } from "./enrollment-hero";

export function EnrollmentPageContent() {
  return (
    <main className="bg-background">
      <EnrollmentHero />
      <HomeEnrollmentProcessSection />
      <HomeEnrollmentFaqSection />
    </main>
  );
}
