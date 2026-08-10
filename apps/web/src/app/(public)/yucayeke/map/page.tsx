import { permanentRedirect } from "next/navigation";

/**
 * The map is the whole of `/yucayeke` now, and public. This route stays
 * only so existing links (profile card CTA, bookmarks, the old
 * middleware-guarded path) keep working.
 */
export default function YucayekeMapPage() {
  permanentRedirect("/yucayeke");
}
