import { YucayekeConnectSection } from "@/features/yucayeke/components/yucayeke-connect-section";
import { YucayekeDirectorySection } from "@/features/yucayeke/components/yucayeke-directory-section";
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
 *
 * `pt-28` lives here rather than on a child because the first visible
 * section varies: the band renders only for signed-in members, so the
 * clearance for the floating navbar has to belong to the page itself.
 */
export function YucayekePageContent() {
  return (
    <main className="bg-background pt-28">
      <YourYucayekeBand />
      <YucayekeMapPageContent />
      <YucayekeDirectorySection />
      <YucayekeConnectSection />
    </main>
  );
}
