import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { TerritoryDetailContent } from "@/features/yucayeke/components/territory-detail-content";
import { hasLongformProse } from "@/features/yucayeke/content/longform";
import { YucayekeHighlightsSection } from "@/features/yucayeke/components/yucayeke-highlights-section";
import { YucayekeLegacySection } from "@/features/yucayeke/components/yucayeke-legacy-section";
import { YucayekeWelcomeSection } from "@/features/yucayeke/components/yucayeke-welcome-section";
import {
  TERRITORY_SLUGS,
  getTerritoryBySlug,
} from "@/features/yucayeke/content/territories";

type TerritoryPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export function generateStaticParams() {
  return TERRITORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: TerritoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const territory = getTerritoryBySlug(slug);

  if (!territory) return {};

  const [t, tMap] = await Promise.all([
    getTranslations("yucayeke.territory"),
    getTranslations("yucayekeMap"),
  ]);

  return {
    title: territory.displayName,
    // Territories without a recorded cacique fall back to the canonical
    // blurb rather than rendering an empty "seat of cacique" sentence.
    description: territory.cacique
      ? t("metaDescription", {
          name: territory.displayName,
          cacique: territory.cacique,
        })
      : tMap(`territories.${territory.slug}.description`),
  };
}

export default async function TerritoryPage({ params }: TerritoryPageProps) {
  const { slug } = await params;
  const territory = getTerritoryBySlug(slug);

  if (!territory) {
    notFound();
  }

  return (
    <main className="bg-background">
      <TerritoryDetailContent territory={territory}>
        {hasLongformProse(territory.slug) ? (
          <div className="mt-12">
            <YucayekeWelcomeSection />
            <YucayekeHighlightsSection />
            <YucayekeLegacySection />
          </div>
        ) : null}
      </TerritoryDetailContent>
    </main>
  );
}
