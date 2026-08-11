"use client";

import Link from "next/link";

import { useTranslations } from "next-intl";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ActiveConsent } from "@/types/enrollment";

type ConsentChecklistProps = Readonly<{
  activeConsents: readonly ActiveConsent[];
  className?: string;
  isSubmitting?: boolean;
  onToggleConsent: (consentId: string) => void;
  selectedConsentIds: readonly string[];
}>;

/**
 * The single consent surface: one checkbox per active consent (title, the
 * backend's own copy, an asterisk on the required ones) plus the link out to
 * the full terms.
 *
 * Extracted from the old dashboard consent dialog so consent has exactly ONE
 * rendering in the app — it now lives on the enrollment introduction at
 * `/enrollment/start`, which precedes step 1. Purely presentational: it owns
 * no selection state, no mutation and no navigation, so the screen embedding
 * it decides what accepting means.
 *
 * The consent titles and copy are backend-owned (`GET /consent/active`) and are
 * rendered verbatim — only the surrounding chrome is translated.
 */
export function ConsentChecklist({
  activeConsents,
  className,
  isSubmitting = false,
  onToggleConsent,
  selectedConsentIds,
}: ConsentChecklistProps) {
  const t = useTranslations("consent");

  return (
    <div className={cn("md:col-span-2", className)}>
      <div className="space-y-3">
        {activeConsents.map((consent) => {
          const isSelected = selectedConsentIds.includes(consent.id);

          return (
            <label
              data-slot="consent-checklist-item"
              key={consent.id}
              className={cn(
                "grid cursor-pointer grid-cols-[auto_1fr] gap-x-3 gap-y-2 rounded-xl border px-3.5 py-3.5 transition-colors sm:gap-x-3.5",
                isSelected
                  ? "border-foreground bg-surface-muted"
                  : "border-border bg-surface",
              )}
            >
              <Checkbox
                checked={isSelected}
                className="mt-0.5 size-[18px]"
                disabled={isSubmitting}
                onCheckedChange={() => onToggleConsent(consent.id)}
              />

              <div className="min-w-0">
                <p className="text-foreground text-[1.05rem] font-semibold tracking-[-0.03em] sm:text-[1rem] lg:text-[1.05rem]">
                  {consent.title}
                  {consent.required ? (
                    <span className="text-foreground ml-1 text-sm">*</span>
                  ) : null}
                </p>

                <p className="text-muted-foreground mt-1.5 text-[0.95rem] leading-6 sm:mt-2 sm:text-[0.92rem] sm:leading-6 lg:text-[0.95rem]">
                  {consent.content}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <p className="text-muted-foreground mt-4 text-[0.88rem] leading-6 sm:text-[0.9rem]">
        {t.rich("readAll", {
          link: (chunks) => (
            <Link
              className="text-foreground focus-visible:ring-ring rounded-sm font-medium underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              href="/privacy-policy"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}
