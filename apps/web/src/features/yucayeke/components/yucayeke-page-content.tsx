import { YucayekeConnectSection } from "@/features/yucayeke/components/yucayeke-connect-section";
import { getYucayekeHeroStats } from "@/features/yucayeke/api/get-community-meta";
import { YucayekeDirectorySection } from "@/features/yucayeke/components/yucayeke-directory-section";
import { YucayekeHero } from "@/features/yucayeke/components/yucayeke-hero";
import { YourYucayekeBand } from "@/features/yucayeke/components/your-yucayeke-band";

/**
 * `/yucayeke` is the directory of all 21 ancestral territories.
 *
 * The hand-written long-form sections (welcome / highlights / legacy)
 * were Guainía-specific and now live on that territory's own page at
 * `/yucayeke/guania`, so nothing here claims to speak for every yucayeke.
 */
export async function YucayekePageContent() {
  const heroStats = await getYucayekeHeroStats();

  return (
    <main className="bg-background">
      <YucayekeHero stats={heroStats} />
      <YourYucayekeBand />
      <YucayekeDirectorySection />
      <YucayekeConnectSection />
    </main>
  );
}
