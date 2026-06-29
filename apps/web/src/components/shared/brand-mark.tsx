import Image from "next/image";

import { cinzel } from "@/styles/fonts";
import { cn } from "@/lib/utils";

const brandMarkVariants = {
  compact: {
    container: "inline-flex items-center gap-3",
    frame:
      "relative size-10 shrink-0 overflow-hidden rounded-full border border-black/10 bg-white p-1 sm:size-11",
    image: "rounded-full object-cover",
    title: "text-[1rem] leading-none font-semibold uppercase tracking-[0.12em]",
    subtitle:
      "mt-1 block text-[0.62rem] font-medium uppercase tracking-[0.26em]",
  },
  default: {
    container: "inline-flex items-center gap-3.5",
    frame:
      "relative size-12 shrink-0 overflow-hidden rounded-full border border-black/10 bg-white p-1 sm:size-14",
    image: "rounded-full object-cover",
    title:
      "text-[1.14rem] leading-none font-semibold uppercase tracking-[0.14em] sm:text-[1.2rem]",
    subtitle:
      "mt-1.5 block text-[0.66rem] font-medium uppercase tracking-[0.28em] sm:text-[0.68rem]",
  },
} as const;

type BrandMarkProps = Readonly<{
  className?: string;
  label?: string;
  subtitle?: string;
  showLabel?: boolean;
  showSubtitle?: boolean;
  compact?: boolean;
}>;

export function BrandMark({
  className,
  label = "Taíno Nation",
  subtitle = "Of Borikén",
  showLabel = true,
  showSubtitle = true,
  compact = false,
}: BrandMarkProps) {
  const variant = compact
    ? brandMarkVariants.compact
    : brandMarkVariants.default;

  return (
    <div className={cn(variant.container, className)}>
      <div className={variant.frame}>
        <div className="relative size-full overflow-hidden rounded-full">
          <Image
            alt="Taíno Nation of Borikén seal"
            className={variant.image}
            fill
            sizes={compact ? "44px" : "56px"}
            src="/images/tanoNewLogo.jpg"
          />
        </div>
      </div>
      {showLabel ? (
        <div className="min-w-0">
          <span
            className={cn(
              cinzel.className,
              "text-foreground block",
              variant.title,
            )}
          >
            {label}
          </span>
          {showSubtitle ? (
            <span className={cn("text-accent block", variant.subtitle)}>
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
