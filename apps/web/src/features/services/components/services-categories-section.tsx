import { useTranslations } from "next-intl";

import type { ServiceCategoryApiItem } from "@/features/services/types/service";
import { ServiceCategoryCard } from "@/features/services/components/service-category-card";
import { getServiceCategoryPresentation } from "@/features/services/constants/services-content";

type ServicesCategoriesSectionProps = Readonly<{
  categories: ServiceCategoryApiItem[];
}>;

export function ServicesCategoriesSection({
  categories,
}: ServicesCategoriesSectionProps) {
  const t = useTranslations("services");

  return (
    <section className="bg-background py-10 sm:py-12 lg:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-foreground text-[1.5rem] leading-tight font-semibold tracking-tight sm:text-[1.8rem] lg:text-[2.2rem]">
            {t("categories.title")}
          </h2>

          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-[0.9rem] leading-6 sm:text-[0.95rem] sm:leading-7">
            {t("categories.description")}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const presentation = getServiceCategoryPresentation(category);

            return (
              <ServiceCategoryCard
                key={category.id}
                category={{
                  title: presentation.presetKey
                    ? t(`categoryPresets.${presentation.presetKey}.title`)
                    : presentation.name,
                  description: presentation.presetKey
                    ? t(`categoryPresets.${presentation.presetKey}.description`)
                    : t("categoryFallbackDescription"),
                  iconSrc: presentation.iconSrc,
                  tone: presentation.tone,
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
