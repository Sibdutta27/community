"use client";

import Link from "next/link";

import { CheckCircle2, Circle } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { enrollmentOverviewHref } from "@/features/enrollment/config/enrollment-steps";
import { cn } from "@/lib/utils";
import type { AccountEnrollmentConsent } from "@/types/enrollment";

type EnrollmentConsentSummaryProps = Readonly<{
  className?: string;
  consents: readonly AccountEnrollmentConsent[];
}>;

/**
 * READ-ONLY record of the consents this enrollment already accepted, rendered
 * at step 5 beside the e-signature.
 *
 * Consent is asked once, at `/enrollment/start`. Step 5 therefore shows what
 * was agreed to and when instead of asking again — this component is the
 * member-facing mirror of the admin panel's `ConsentReview.jsx`, so applicant
 * and reviewer read the same record: title, required/optional, version, and
 * the acceptance timestamp.
 *
 * It renders NO inputs and never blocks submission. An empty list (a member
 * whose consent rows have not loaded, or an enrollment that predates the
 * catalog) degrades to a quiet notice linking back to the consent screen.
 */
export function EnrollmentConsentSummary({
  className,
  consents,
}: EnrollmentConsentSummaryProps) {
  const t = useTranslations("enrollment.confirmation.consentSummary");
  const format = useFormatter();

  if (consents.length === 0) {
    return (
      <p
        className={cn(
          "text-muted-foreground text-[0.88rem] leading-6 md:col-span-2",
          className,
        )}
        data-slot="enrollment-consent-summary-empty"
      >
        {t.rich("empty", {
          link: (chunks) => (
            <Link
              className="text-foreground focus-visible:ring-ring rounded-sm font-medium underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              href={enrollmentOverviewHref}
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    );
  }

  return (
    <ul
      className={cn(
        "border-border divide-border divide-y overflow-hidden rounded-xl border md:col-span-2",
        className,
      )}
      data-slot="enrollment-consent-summary"
    >
      {consents.map((consent) => {
        const Icon = consent.accepted ? CheckCircle2 : Circle;

        return (
          <li
            className="bg-surface flex items-start justify-between gap-3 px-4 py-3.5 sm:px-5"
            data-slot="enrollment-consent-summary-item"
            key={consent.id}
          >
            <div className="flex min-w-0 items-start gap-3">
              <Icon
                aria-hidden="true"
                className={cn(
                  "mt-0.5 size-[1.05rem] shrink-0",
                  consent.accepted
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              />
              <div className="min-w-0">
                <p className="text-foreground text-[0.92rem] leading-tight font-semibold tracking-tight">
                  {consent.title}
                </p>
                <p className="text-muted-foreground mt-1 text-[0.85rem] leading-6">
                  {consent.accepted && consent.acceptedAt
                    ? t("acceptedOn", {
                        date: format.dateTime(new Date(consent.acceptedAt), {
                          dateStyle: "long",
                        }),
                      })
                    : t("notAccepted")}
                  {" · "}
                  {t("version", { version: consent.version })}
                </p>
              </div>
            </div>

            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.08em] uppercase",
                consent.required
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-surface-muted text-muted-foreground",
              )}
            >
              {consent.required ? t("required") : t("optional")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
