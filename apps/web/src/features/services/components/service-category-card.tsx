import Image from "next/image";

import type {
  ServiceCategory,
  ServiceCategoryTone,
} from "@/features/services/constants/services-content";
import { cn } from "@/lib/utils";

type ServiceCategoryCardProps = Readonly<{
  category: ServiceCategory;
}>;

const toneClasses: Record<ServiceCategoryTone, string> = {
  teal: "bg-[linear-gradient(135deg,#156c60_0%,#1e7a67_100%)]",
  olive: "bg-[linear-gradient(135deg,#6f6750_0%,#8e7f57_100%)]",
  slate: "bg-[linear-gradient(135deg,#4b4a5b_0%,#666176_100%)]",
  forest: "bg-[linear-gradient(135deg,#547641_0%,#6a8b4e_100%)]",
  sea: "bg-[linear-gradient(135deg,#1d5963_0%,#256d79_100%)]",
  stone: "bg-[linear-gradient(135deg,#605756_0%,#756b69_100%)]",
  indigo: "bg-[linear-gradient(135deg,#225b64_0%,#33447e_100%)]",
};

export function ServiceCategoryCard({ category }: ServiceCategoryCardProps) {
  return (
    <article className="flex h-full min-h-[9.5rem] flex-col rounded-[1.2rem] border border-[#eadfce] bg-white px-3.5 py-3.5 text-center shadow-[0_14px_28px_-32px_rgba(16,47,52,0.16)] sm:min-h-[10rem] sm:px-4 sm:py-4">
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

      <h3 className="mt-3 text-[1.02rem] leading-tight font-semibold tracking-tight text-[#0b3b35] sm:text-[1.12rem]">
        {category.title}
      </h3>

      <p className="mt-1.5 text-[0.8rem] leading-5 text-[#2b2d31]/82 sm:text-[0.84rem] sm:leading-6">
        {category.description}
      </p>
    </article>
  );
}
