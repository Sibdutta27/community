import Image from "next/image";

import type {
  ServiceCategory,
  ServiceCategoryTone,
} from "@/features/services/constants/services-content";
import { cn } from "@/lib/utils";

type ServiceCategoryCardProps = Readonly<{
  category: ServiceCategory;
}>;

// Governance restyle: one neutral charcoal tile for every category — the
// white icons stay legible without a rainbow of tile colors.
const neutralTile = "bg-foreground";

const toneClasses: Record<ServiceCategoryTone, string> = {
  teal: neutralTile,
  olive: neutralTile,
  slate: neutralTile,
  forest: neutralTile,
  sea: neutralTile,
  stone: neutralTile,
  indigo: neutralTile,
};

export function ServiceCategoryCard({ category }: ServiceCategoryCardProps) {
  return (
    <article className="border-border bg-surface flex h-full min-h-[9.5rem] flex-col rounded-[1.2rem] border px-3.5 py-3.5 text-center shadow-[0_14px_28px_-32px_rgba(31,30,28,0.16)] sm:min-h-[10rem] sm:px-4 sm:py-4">
      <div
        className={cn(
          "mx-auto flex size-[3rem] items-center justify-center rounded-[0.75rem]",
          toneClasses[category.tone],
        )}
      >
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
    </article>
  );
}
