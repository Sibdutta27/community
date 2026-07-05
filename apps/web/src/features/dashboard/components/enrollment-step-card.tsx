import Link from "next/link";

import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("dashboard");
  const progressWidth = `${Math.max(0, Math.min(progress, 1)) * 100}%`;
  // Shared primary Button (azul pill) — no bespoke color overrides; the
  // locked steps render it disabled so the state reads from opacity.
  const buttonClassName =
    "w-full max-w-[10rem] sm:w-auto sm:min-w-[6.5rem] [&_span]:text-xs [&_span]:font-semibold";

  return (
    <article className="border-border bg-surface shadow-card-soft flex min-h-[15rem] flex-col rounded-2xl border px-4 py-5 text-center sm:min-h-[17rem] sm:py-6">
      <div
        className={cn(
          "bg-surface mx-auto flex size-10 items-center justify-center rounded-full border-2 text-[1.25rem] font-semibold sm:size-11 sm:text-xl",
          isEnabled
            ? "border-foreground/40 text-foreground"
            : "border-border text-muted-foreground",
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
                className={buttonClassName}
                loading={isLoading}
                loadingText={t("steps.loadingText")}
                size="sm"
                type="button"
                variant="primary"
                onClick={onAction}
              >
                {ctaLabel}
              </Button>
            ) : isEnabled && href ? (
              <Button
                asChild
                className={buttonClassName}
                size="sm"
                variant="primary"
              >
                <Link href={href}>
                  <span>{ctaLabel}</span>
                </Link>
              </Button>
            ) : (
              <Button
                className={buttonClassName}
                disabled
                size="sm"
                variant="primary"
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
