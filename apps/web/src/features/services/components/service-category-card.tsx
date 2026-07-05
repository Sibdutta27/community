import Image from "next/image";

import { SurfaceCard } from "@/components/shared/surface-card";
import type { ServiceCategory } from "@/features/services/constants/services-content";

type ServiceCategoryCardProps = Readonly<{
  category: ServiceCategory;
}>;

// Governance restyle: one neutral ink tile for every category — the white
// icons stay legible without a rainbow of tile colors (see design-system.md).
export function ServiceCategoryCard({ category }: ServiceCategoryCardProps) {
  return (
    <SurfaceCard as="article" className="flex h-full flex-col text-center">
      <div className="bg-foreground mx-auto flex size-12 items-center justify-center rounded-xl">
        <Image
          alt=""
          aria-hidden="true"
          className="h-5.5 w-5.5 object-contain"
          height={22}
          src={category.iconSrc}
          width={22}
        />
      </div>

      <h3 className="text-foreground mt-3 text-[1.02rem] leading-tight font-semibold tracking-tight sm:text-[1.12rem]">
        {category.title}
      </h3>

      <p className="text-muted-foreground mt-1.5 text-[0.8rem] leading-5 sm:text-[0.84rem] sm:leading-6">
        {category.description}
      </p>
    </SurfaceCard>
  );
}
