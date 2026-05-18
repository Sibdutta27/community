import Link from "next/link";

import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EnrollmentStepCardProps = Readonly<{
  step: number;
  title: string;
  description: string;
  ctaLabel: string;
  href?: string;
  icon: LucideIcon;
  progress: number;
  isEnabled: boolean;
  isLoading?: boolean;
  onAction?: () => void;
}>;

export function EnrollmentStepCard({
  step,
  title,
  description,
  ctaLabel,
  href,
  icon: Icon,
  progress,
  isEnabled,
  isLoading = false,
  onAction,
}: EnrollmentStepCardProps) {
  const progressWidth = `${Math.max(0, Math.min(progress, 1)) * 100}%`;
  const buttonClassName =
    "h-10 w-full max-w-[11rem] rounded-md px-4 shadow-none sm:w-auto sm:min-w-[7.5rem]";
  const buttonStateClassName = cn(
    buttonClassName,
    isEnabled
      ? "bg-[#004D43]! text-white! hover:bg-[#004D43]! hover:text-white! focus-visible:text-white! focus-visible:ring-[#004D43] [&_span]:text-xs [&_span]:font-semibold [&_span]:leading-none [&_span]:text-white!"
      : "bg-[#7f8892]! text-white! hover:bg-[#7f8892]! hover:text-white! disabled:opacity-100 [&_span]:text-xs [&_span]:font-semibold [&_span]:leading-none [&_span]:text-white!",
  );

  return (
    <article
      className={cn(
        "flex min-h-[16.5rem] flex-col rounded-[20px] border bg-white px-4 py-5 text-center shadow-[0_16px_34px_-28px_rgba(16,47,52,0.28)] transition-transform duration-200 sm:min-h-[21rem] sm:rounded-[26px] sm:px-6 sm:py-7",
        isEnabled
          ? "border-[#bfd4dc] shadow-[0_20px_44px_-32px_rgba(13,98,93,0.34)]"
          : "border-[#cfdbe0]",
      )}
    >
      <div
        className={cn(
          "mx-auto flex size-[2.75rem] items-center justify-center rounded-full text-[1.35rem] font-semibold sm:size-[3.25rem] sm:text-2xl",
          isEnabled
            ? "bg-primary text-primary-foreground"
            : "bg-[#8f969d] text-white",
        )}
      >
        {step}
      </div>

      <div
        className={cn(
          "mx-auto mt-3.5 flex size-8 items-center justify-center rounded-full sm:mt-5 sm:size-9",
          isEnabled ? "bg-[#2e6d73] text-white" : "bg-[#707880] text-white",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </div>

      <div className="mt-3.5 flex flex-1 flex-col sm:mt-5">
        <h3
          className={cn(
            "text-[1rem] leading-tight font-semibold tracking-[-0.03em] sm:text-lg",
            isEnabled ? "text-[#113d40]" : "text-[#5e6670]",
          )}
        >
          {title}
        </h3>

        <p
          className={cn(
            "mx-auto mt-2 max-w-[16rem] text-[0.8rem] leading-5 sm:mt-3 sm:text-sm",
            isEnabled ? "text-[#667579]" : "text-[#737d87]",
          )}
        >
          {description}
        </p>

        <div className="mt-auto pt-4 sm:pt-6">
          <div
            aria-hidden="true"
            className="h-1.5 rounded-full bg-[#d7d7d7] sm:h-2"
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                isEnabled ? "bg-primary" : "bg-[#8f98a1]",
              )}
              style={{ width: progressWidth }}
            />
          </div>

          <div className="mt-4 flex justify-center sm:mt-6">
            {isEnabled && onAction ? (
              <Button
                className={buttonStateClassName}
                loading={isLoading}
                loadingText="Preparing..."
                size="sm"
                type="button"
                variant="ghost"
                onClick={onAction}
              >
                {ctaLabel}
              </Button>
            ) : isEnabled && href ? (
              <Button
                asChild
                className={buttonStateClassName}
                size="sm"
                variant="ghost"
              >
                <Link
                  className="text-white! hover:text-white! focus-visible:text-white!"
                  href={href}
                >
                  <span>{ctaLabel}</span>
                </Link>
              </Button>
            ) : (
              <Button
                className={buttonStateClassName}
                disabled
                size="sm"
                variant="ghost"
              >
                {ctaLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
