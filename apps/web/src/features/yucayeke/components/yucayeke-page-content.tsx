import { YucayekeConnectSection } from "@/features/yucayeke/components/yucayeke-connect-section";
import { getYucayekeHeroStats } from "@/features/yucayeke/api/get-community-meta";
import { YucayekeDirectorySection } from "@/features/yucayeke/components/yucayeke-directory-section";
import { YucayekeHero } from "@/features/yucayeke/components/yucayeke-hero";
import { YucayekeMapPageContent } from "@/features/yucayeke/components/yucayeke-map-page-content";
import { YourYucayekeBand } from "@/features/yucayeke/components/your-yucayeke-band";

/**
 * `/yucayeke` IS the interactive territory map — that experience used to
 * live behind auth at `/yucayeke/map` (now a redirect here).
 *
 * Below the map, the directory lists all 21 territories and links into
 * their reading pages at `/yucayeke/[slug]`; the map's info panel links
 * to the same place. The page is public, so every client component here
 * degrades without a session.
 */
export async function YucayekePageContent() {
  const heroStats = await getYucayekeHeroStats();

  return (
    <main className="bg-background">
      <YucayekeHero stats={heroStats} />
      <YourYucayekeBand />
      <YucayekeMapPageContent />
      <YucayekeDirectorySection />
      <YucayekeConnectSection />
    </main>
  );
}
