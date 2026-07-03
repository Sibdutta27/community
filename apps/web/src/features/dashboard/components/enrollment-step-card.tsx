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
    "h-9 w-full max-w-[10rem] rounded-md px-3 shadow-none sm:w-auto sm:min-w-[6.5rem]";
  const buttonStateClassName = cn(
    buttonClassName,
    isEnabled
      ? "bg-primary! text-white! hover:bg-primary! hover:opacity-90 hover:text-white! focus-visible:text-white! focus-visible:ring-ring [&_span]:text-xs [&_span]:font-semibold [&_span]:leading-none [&_span]:text-white!"
      : "bg-muted-foreground! text-white! hover:bg-muted-foreground! hover:text-white! disabled:opacity-100 [&_span]:text-xs [&_span]:font-semibold [&_span]:leading-none [&_span]:text-white!",
  );

  return (
    <article
      className={cn(
        "flex min-h-[15rem] flex-col rounded-[20px] border bg-white px-4 py-5 text-center shadow-[0_16px_34px_-28px_rgba(16,47,52,0.28)] transition-transform duration-200 sm:min-h-[17rem] sm:rounded-[22px] sm:px-4 sm:py-6",
        isEnabled
          ? "border-border shadow-[0_20px_44px_-32px_rgba(31,30,28,0.28)]"
          : "border-border",
      )}
    >
      <div
        className={cn(
          "mx-auto flex size-10 items-center justify-center rounded-full text-[1.25rem] font-semibold sm:size-11 sm:text-xl",
          isEnabled
            ? "border-foreground/40 text-foreground border-2 bg-white"
            : "border-border text-muted-foreground border-2 bg-white",
        )}
      >
        {step}
      </div>

      <div
        className={cn(
          "mx-auto mt-3 flex size-7 items-center justify-center rounded-full sm:mt-4 sm:size-8",
          isEnabled
            ? "bg-surface-muted text-foreground"
            : "bg-surface-muted text-muted-foreground",
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </div>

      <div className="mt-3 flex flex-1 flex-col sm:mt-4">
        <h3
          className={cn(
            "text-[1rem] leading-tight font-semibold tracking-[-0.03em] sm:text-[1.05rem]",
            isEnabled ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {title}
        </h3>

        <p
          className={cn(
            "mx-auto mt-2 max-w-[13.5rem] text-[0.8rem] leading-5 sm:mt-2.5 sm:text-[0.85rem]",
            isEnabled ? "text-muted-foreground" : "text-muted-foreground/80",
          )}
        >
          {description}
        </p>

        <div className="mt-auto pt-4 sm:pt-5">
          <div
            aria-hidden="true"
            className="bg-border h-1.5 rounded-full sm:h-2"
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                isEnabled ? "bg-primary" : "bg-muted-foreground/50",
              )}
              style={{ width: progressWidth }}
            />
          </div>

          <div className="mt-3.5 flex justify-center sm:mt-4">
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
