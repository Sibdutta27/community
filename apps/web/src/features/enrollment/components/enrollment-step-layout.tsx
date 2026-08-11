"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowLeft, Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { EnrollmentStepEntrance } from "@/features/enrollment/components/enrollment-motion";
import {
  EnrollmentSaveDraftProvider,
  useEnrollmentSaveDraftRegistration,
} from "@/features/enrollment/components/enrollment-save-draft-context";
import { EnrollmentStepper } from "@/features/enrollment/components/enrollment-stepper";
import {
  enrollmentOverviewHref,
  enrollmentOverviewStep,
  enrollmentTotalSteps,
  getEnrollmentStepDefinition,
  resolveEnrollmentStepState,
} from "@/features/enrollment/config/enrollment-steps";
import { useAccountInfoQuery } from "@/features/enrollment/lib/enrollment-queries";
import { cn } from "@/lib/utils";

type EnrollmentStepLayoutProps = Readonly<{
  children: ReactNode;
  /**
   * Card sub-heading. Defaults to the step definition's description; pass it
   * explicitly for the overview (`step={0}`), which has no definition.
   */
  description?: string;
  /**
   * Card heading. Defaults to `"N. {step heading}"`; an explicit heading is
   * rendered verbatim (no numeric prefix) — used by the overview.
   */
  heading?: string;
  /**
   * `0` = the pre-flight overview at `/enrollment/start`; `1`–`5` = the form
   * steps. On the overview the utility row shows an "Overview" label instead
   * of "Step N of 5" and the stepper renders with no active tab, so the five
   * steps read as part of the introduction.
   */
  step: number;
}>;

/**
 * Shared shell for the enrollment overview + the five step pages, styled as a
 * manila folder: a light utility row (Back pill + "Step N of 5", or "Overview"
 * on step 0), then the folder-tab stepper attached to an elevated `bg-surface`
 * card that holds the heading, description, and body. The active tab and the
 * card share the same surface and merge seamlessly (see EnrollmentStepper).
 * The tab row + card animate in as one unit via EnrollmentStepEntrance —
 * all motion is isolated there and in `lib/motion.ts`.
 *
 * The layout also provides EnrollmentSaveDraftContext: step forms register
 * their "Save & finish later" handler through it, and the utility row mirrors
 * that action at the top of the page (see EnrollmentSaveDraftHeaderAction).
 */
export function EnrollmentStepLayout(props: EnrollmentStepLayoutProps) {
  return (
    <EnrollmentSaveDraftProvider>
      <EnrollmentStepLayoutContent {...props} />
    </EnrollmentSaveDraftProvider>
  );
}

/**
 * Top-row mirror of the step form's "Save & finish later" footer action —
 * a subtle charcoal ghost control (never the azul accent) that invokes the
 * handler the current step registered via EnrollmentSaveDraftContext, and
 * hides entirely when the step registered none (documents/confirmation).
 * Below `sm` it collapses to an icon-only button; the aria-label keeps the
 * accessible name.
 */
function EnrollmentSaveDraftHeaderAction() {
  const t = useTranslations("enrollment.layout");
  const registration = useEnrollmentSaveDraftRegistration();

  if (!registration) {
    return null;
  }

  return (
    <Button
      aria-label={t("saveFinishLaterAria")}
      className="text-muted-foreground hover:text-foreground px-3 sm:px-4"
      disabled={registration.disabled || registration.pending}
      leftIcon={<Bookmark aria-hidden="true" />}
      loading={registration.pending}
      onClick={registration.onSaveDraft}
      size="sm"
      type="button"
      variant="ghost"
    >
      <span className="hidden sm:inline">{t("saveFinishLater")}</span>
    </Button>
  );
}

function EnrollmentStepLayoutContent({
  children,
  description,
  heading,
  step,
}: EnrollmentStepLayoutProps) {
  const t = useTranslations("enrollment");
  const accountInfoQuery = useAccountInfoQuery();
  const stepState = resolveEnrollmentStepState(accountInfoQuery.data);
  const definition = getEnrollmentStepDefinition(step);
  const isOverview = step === enrollmentOverviewStep;
  // The overview sits between the dashboard and step 1, so step 1 falls back
  // to it rather than jumping straight out of the flow.
  const backHref = isOverview
    ? "/dashboard"
    : step > 1
      ? `/enrollment/step-${step - 1}`
      : enrollmentOverviewHref;
  const cardHeading =
    heading ??
    (definition
      ? `${definition.step}. ${t(`steps.${definition.step}.heading`)}`
      : null);
  const cardDescription =
    description ??
    (definition ? t(`steps.${definition.step}.description`) : null);

  return (
    <div className="mx-auto w-full max-w-5xl pt-24 pb-16 sm:pt-28 lg:pt-32">
      <header className="flex items-center justify-between gap-x-4 sm:gap-x-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Button asChild size="sm" variant="outline">
            <Link href={backHref}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              <span>{t("layout.back")}</span>
            </Link>
          </Button>

          {/* Persistent flow title — governance styling: a thin hairline
              divider, a muted uppercase kicker and a charcoal heading. The
              kicker + divider bow out below `sm` and the heading truncates,
              so the utility row never overflows. */}
          <span
            aria-hidden="true"
            className="bg-border hidden h-7 w-px shrink-0 sm:block"
          />
          <div className="min-w-0">
            <p className="text-muted-foreground hidden text-[0.6rem] font-semibold tracking-[0.3em] uppercase sm:block">
              {t("layout.kicker")}
            </p>
            <p className="text-foreground truncate text-[0.95rem] font-semibold tracking-[-0.01em] sm:mt-0.5 sm:text-[1.05rem]">
              {t("layout.title")}
            </p>
          </div>
        </div>

        {/* Right-side utility group: the step's "Save & finish later" mirror
            (only when the step registered a handler) beside the progress
            label. */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <EnrollmentSaveDraftHeaderAction />
          <p className="text-muted-foreground shrink-0 text-xs font-medium tracking-[0.08em] uppercase">
            {isOverview
              ? t("layout.overviewLabel")
              : t("layout.stepOf", { step, total: enrollmentTotalSteps })}
          </p>
        </div>
      </header>

      <EnrollmentStepEntrance className="mt-6 sm:mt-8">
        <EnrollmentStepper currentStep={step} stepState={stepState} />

        {/* Elevated form card the active folder tab merges into. Top-left
            corner stays square where the first tab attaches. */}
        <div
          className="border-border bg-surface relative rounded-tr-2xl rounded-b-2xl border p-6 shadow-[0_28px_56px_-40px_rgba(20,26,34,0.35),0_10px_24px_-20px_rgba(20,26,34,0.25)] sm:p-8 lg:p-10"
          data-slot="enrollment-step-card"
        >
          {cardHeading ? (
            <div className="max-w-3xl">
              <h1 className="text-foreground text-[1.55rem] leading-tight font-semibold tracking-tight sm:text-[1.9rem]">
                {cardHeading}
              </h1>
              {cardDescription ? (
                <p className="text-muted-foreground mt-2 text-[0.92rem] leading-6">
                  {cardDescription}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className={cardHeading ? "mt-7 sm:mt-9" : undefined}>
            {children}
          </div>
        </div>
      </EnrollmentStepEntrance>
    </div>
  );
}

type EnrollmentStepFooterProps = Readonly<{
  backDisabled?: boolean;
  backHref?: string;
  children: ReactNode;
  className?: string;
  onSaveDraft?: () => void;
  saveDraftDisabled?: boolean;
  saveDraftPending?: boolean;
}>;

/**
 * Footer band for a step form: a full-bleed, softly tinted row pinned to the
 * bottom of the elevated card (negative margins match the card padding),
 * divided from the fields by a hairline border — outlined "Back" pill on the
 * left (when given a target), the step's primary azul action(s) on the right.
 * When `onSaveDraft` is provided, a secondary ghost "Save & finish later"
 * action renders beside Back: it saves the current values as a partial draft
 * (no validation) and returns the member to the dashboard.
 */
export function EnrollmentStepFooter({
  backDisabled = false,
  backHref,
  children,
  className,
  onSaveDraft,
  saveDraftDisabled = false,
  saveDraftPending = false,
}: EnrollmentStepFooterProps) {
  const t = useTranslations("enrollment");
  const hasLeadingActions = Boolean(backHref) || Boolean(onSaveDraft);

  return (
    <div
      className={cn(
        "border-border bg-surface-muted/50 mt-10 flex flex-col-reverse gap-3 rounded-b-[calc(1rem-1px)] border-t px-6 py-5 sm:flex-row sm:items-center sm:px-8 sm:py-6 lg:px-10",
        // Bleed to the card edges (mirrors the card's p-6 sm:p-8 lg:p-10).
        "-mx-6 -mb-6 sm:-mx-8 sm:-mb-8 lg:-mx-10 lg:-mb-10",
        hasLeadingActions ? "sm:justify-between" : "sm:justify-end",
        className,
      )}
      data-slot="enrollment-step-footer"
    >
      {hasLeadingActions ? (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {backHref ? (
            backDisabled ? (
              <Button
                className="min-w-[8rem]"
                disabled
                leftIcon={<ArrowLeft />}
                size="lg"
                type="button"
                variant="outline"
              >
                {t("layout.back")}
              </Button>
            ) : (
              <Button
                asChild
                className="min-w-[8rem]"
                size="lg"
                variant="outline"
              >
                <Link href={backHref}>
                  <ArrowLeft aria-hidden="true" className="size-5" />
                  <span>{t("layout.back")}</span>
                </Link>
              </Button>
            )
          ) : null}

          {onSaveDraft ? (
            <Button
              disabled={saveDraftDisabled || saveDraftPending}
              loading={saveDraftPending}
              loadingText={t("actions.saving")}
              onClick={onSaveDraft}
              size="lg"
              type="button"
              variant="ghost"
            >
              {t("layout.saveFinishLater")}
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {children}
      </div>
    </div>
  );
}
