import { YucayekeConnectSection } from "@/features/yucayeke/components/yucayeke-connect-section";
import { getYucayekeHeroStats } from "@/features/yucayeke/api/get-community-meta";
import { YucayekeHero } from "@/features/yucayeke/components/yucayeke-hero";
import { YucayekeHighlightsSection } from "@/features/yucayeke/components/yucayeke-highlights-section";
import { YucayekeLegacySection } from "@/features/yucayeke/components/yucayeke-legacy-section";
import { YucayekeWelcomeSection } from "@/features/yucayeke/components/yucayeke-welcome-section";

export async function YucayekePageContent() {
  const heroStats = await getYucayekeHeroStats();

  return (
    <main className="bg-background">
      <YucayekeHero stats={heroStats} />
      <YucayekeWelcomeSection />
      <YucayekeHighlightsSection />
      <YucayekeLegacySection />
      <YucayekeConnectSection />
    </main>
  );
}
