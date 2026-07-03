import Image from "next/image";

import { cn } from "@/lib/utils";

const brandMarkVariants = {
  compact: {
    container: "inline-flex items-center gap-3",
    frame:
      "relative size-10 shrink-0 overflow-hidden rounded-full border border-border bg-surface p-1 sm:size-11",
    image: "rounded-full object-cover",
    title: "text-[1rem] leading-none font-semibold uppercase tracking-[0.12em]",
    subtitle:
      "mt-1 block text-[0.62rem] font-medium uppercase tracking-[0.26em]",
  },
  default: {
    container: "inline-flex items-center gap-3.5",
    frame:
      "relative size-12 shrink-0 overflow-hidden rounded-full border border-border bg-surface p-1 sm:size-14",
    image: "rounded-full object-cover",
    title:
      "text-[1.14rem] leading-none font-semibold uppercase tracking-[0.14em] sm:text-[1.2rem]",
    subtitle:
      "mt-1.5 block text-[0.66rem] font-medium uppercase tracking-[0.28em] sm:text-[0.68rem]",
  },
} as const;

/**
 * `sm` renders a tighter wordmark so the brand fits next to a dense app nav
 * (e.g. the signed-in navbar); `md` is the variant's standard wordmark.
 */
const smallWordmarkTitle =
  "text-[0.85rem] leading-none font-semibold uppercase tracking-[0.1em]";

type BrandMarkProps = Readonly<{
  className?: string;
  label?: string;
  subtitle?: string;
  showLabel?: boolean;
  showSubtitle?: boolean;
  compact?: boolean;
  wordmarkSize?: "sm" | "md";
}>;

export function BrandMark({
  className,
  label = "Taíno Nation of Borikén",
  subtitle = "Of Borikén",
  showLabel = true,
  showSubtitle = true,
  compact = false,
  wordmarkSize = "md",
}: BrandMarkProps) {
  const variant = compact
    ? brandMarkVariants.compact
    : brandMarkVariants.default;
  const titleClass = wordmarkSize === "sm" ? smallWordmarkTitle : variant.title;

  return (
    <div className={cn(variant.container, className)}>
      <div className={variant.frame}>
        <div className="relative size-full overflow-hidden rounded-full">
          <Image
            alt="Taíno Nation of Borikén seal"
            className={variant.image}
            fill
            sizes={compact ? "44px" : "56px"}
            src="/images/logo.png"
          />
        </div>
      </div>
      {showLabel ? (
        <div className="min-w-0">
          <span className={cn("text-foreground block", titleClass)}>
            {label}
          </span>
          {showSubtitle ? (
            <span
              className={cn("text-muted-foreground block", variant.subtitle)}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
