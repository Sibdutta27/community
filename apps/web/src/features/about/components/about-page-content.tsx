import { AboutHero } from "@/features/about/components/about-hero";
import { AboutMissionSection } from "@/features/about/components/about-mission-section";
import { AboutStorySection } from "@/features/about/components/about-story-section";
import { AboutValuesSection } from "@/features/about/components/about-values-section";

export function AboutPageContent() {
  return (
    <main className="bg-background">
      <AboutHero />
      <AboutStorySection />
      <AboutValuesSection />
      <AboutMissionSection />
    </main>
  );
}
