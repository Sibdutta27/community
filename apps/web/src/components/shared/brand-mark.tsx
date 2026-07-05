import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The logo frame reads as a subtly lifted token: hairline border, faint
 * inner top highlight and a soft ink contact shadow — matching the navbar's
 * glass treatment without getting heavy.
 */
const brandFrameDepthClass =
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_4px_10px_-6px_rgba(20,26,34,0.28)]";

const brandMarkVariants = {
  compact: {
    container: "inline-flex items-center gap-2.5",
    frame: cn(
      "relative size-10 shrink-0 overflow-hidden rounded-full border border-border/80 bg-surface p-1 sm:size-11",
      brandFrameDepthClass,
    ),
    image: "rounded-full object-cover",
    title: "text-[1rem] leading-none font-semibold uppercase tracking-[0.12em]",
    subtitle:
      "mt-1 block text-[0.62rem] font-medium uppercase tracking-[0.26em]",
  },
  default: {
    container: "inline-flex items-center gap-3",
    frame: cn(
      "relative size-12 shrink-0 overflow-hidden rounded-full border border-border/80 bg-surface p-1 sm:size-14",
      brandFrameDepthClass,
    ),
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
