import type { Metadata } from "next";

import { YucayekeMapPageContent } from "@/features/yucayeke/components/yucayeke-map-page-content";
import { getRequiredSessionUser } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Yucayekes of Borikén",
};

export default async function YucayekeMapPage() {
  await getRequiredSessionUser();

  return <YucayekeMapPageContent />;
}
