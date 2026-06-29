import { HomeDashboardCtaSection } from "@/features/home/components/home-dashboard-cta-section";
import { HomeEnrollmentFaqSection } from "@/features/home/components/home-enrollment-faq-section";
import { HomeHero } from "@/features/home/components/home-hero";
import { HomeHeritageSection } from "@/features/home/components/home-heritage-section";
import { HomeMemberServicesSection } from "@/features/home/components/home-member-services-section";
import { HomeMemberStoriesSection } from "@/features/home/components/home-member-stories-section";
import { HomePlatformFeaturesSection } from "@/features/home/components/home-platform-features-section";
import { HomeYucayekeRegionsSection } from "@/features/home/components/home-yucayeke-regions-section";
import { HomeEnrollmentProcessSection } from "./home-enrollment-process-section";

export function HomePageContent() {
  return (
    <main className="bg-background">
      <HomeHero />
      <HomeHeritageSection />
      <HomeEnrollmentProcessSection />
      <HomeYucayekeRegionsSection />
      <HomePlatformFeaturesSection />
      <HomeMemberServicesSection />
      <HomeMemberStoriesSection />
      <HomeDashboardCtaSection />
      <HomeEnrollmentFaqSection />
    </main>
  );
}
