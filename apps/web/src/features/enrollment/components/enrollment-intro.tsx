"use client";

import Link from "next/link";

import type { LucideIcon } from "lucide-react";

import {
  Bookmark,
  Clock3,
  Info,
  Landmark,
  ListChecks,
  Paperclip,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { EnrollmentStepFooter } from "@/features/enrollment/components/enrollment-step-layout";
import { EnrollmentStepSection } from "@/features/enrollment/components/enrollment-step-section";
import { enrollmentStepDefinitions } from "@/features/enrollment/config/enrollment-steps";
import type { EnrollmentStepFourUploadSlot } from "@/features/enrollment/lib/enrollment-step-four-form";

import {
  MIN_IDENTITY_DOCUMENTS,
  enrollmentStepFourEvidenceUploadSlots,
  enrollmentStepFourIdentityUploadSlots,
  enrollmentStepFourUserPhotoCard,
} from "@/features/enrollment/lib/enrollment-step-four-form";
import { cn } from "@/lib/utils";

/**
 * Every upload slot Step 4 offers, in the order the form presents them:
 * the one mandatory photo, the proof-of-identity trio, then the optional
 * supporting evidence. Derived from the step-4 slot configs so the checklist
 * can never drift from the real upload form. Left un-annotated on purpose —
 * the literal `id` union is what types the `enrollment.stepFour.slots` lookups.
 */
const enrollmentIntroDocumentSlots = [
  enrollmentStepFourUserPhotoCard,
  ...enrollmentStepFourIdentityUploadSlots,
  ...enrollmentStepFourEvidenceUploadSlots,
] as const satisfies readonly EnrollmentStepFourUploadSlot[];

const enrollmentIntroHowItWorksItems = [
  { icon: Clock3, id: "time" },
  { icon: Bookmark, id: "saveLater" },
  { icon: ScrollText, id: "review" },
  { icon: ShieldCheck, id: "data" },
] as const;

/**
 * Pre-flight introduction to the enrollment application, rendered inside the
 * step layout at `/enrollment/start` (step 0 — see `EnrollmentStepLayout`).
 * It answers, in order: who you are enrolling with, what the application
 * asks for, what you need to hand, and how the process works — then hands
 * off to Step 1.
 *
 * Two of the four sections are DERIVED, not written down twice:
 * - "What the application asks for" maps `enrollmentStepDefinitions`;
 * - "What you'll need" maps the Step 4 upload-slot configs (and their
 *   `required` flag drives the Required/Optional pill).
 * Add or reorder a step or an upload slot and this page follows automatically.
 *
 * Built only from the existing enrollment primitives (`EnrollmentStepSection`
 * for the bands, `EnrollmentStepFooter` for the action row) — no new visual
 * primitives.
 */
export function EnrollmentIntro() {
  const t = useTranslations("enrollment.intro");
  const tSteps = useTranslations("enrollment.steps");
  const tSlots = useTranslations("enrollment.stepFour.slots");

  return (
    <>
      {/* ────────────────────────────────────────────────────────────────
          TODO(BTF): `enrollment.intro.nation.*` is PLACEHOLDER copy. It is
          adapted from the existing `about.story.paragraph1/2` already in this
          repo so nothing here is invented, but the Nation's own description of
          itself must come from BTF. Replace both paragraphs (en + es) with
          their authoritative wording before this ships to members — do not
          extend or embellish it here.
          ──────────────────────────────────────────────────────────────── */}
      <EnrollmentStepSection
        description={t("nation.description")}
        icon={Landmark}
        title={t("nation.title")}
      >
        <div className="md:col-span-2">
          <p className="text-muted-foreground text-[0.92rem] leading-7">
            {t("nation.paragraph1")}
          </p>
          <p className="text-muted-foreground mt-4 text-[0.92rem] leading-7">
            {t("nation.paragraph2")}
          </p>
        </div>
      </EnrollmentStepSection>

      <EnrollmentStepSection
        className="mt-9 sm:mt-10"
        description={t("steps.description")}
        icon={ListChecks}
        title={t("steps.title")}
      >
        <ol className="border-border divide-border divide-y overflow-hidden rounded-xl border md:col-span-2">
          {enrollmentStepDefinitions.map((definition) => (
            <li
              className="bg-surface flex items-start gap-3.5 px-4 py-4 sm:gap-4 sm:px-5"
              data-slot="enrollment-intro-step"
              key={definition.step}
            >
              <span
                aria-hidden="true"
                className="border-border text-muted-foreground mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold tracking-tight"
              >
                {definition.step}
              </span>
              <div className="min-w-0">
                <p className="text-foreground text-[0.95rem] leading-tight font-semibold tracking-tight">
                  {tSteps(`${definition.step}.title`)}
                </p>
                <p className="text-muted-foreground mt-1 text-[0.88rem] leading-6">
                  {tSteps(`${definition.step}.description`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </EnrollmentStepSection>

      <EnrollmentStepSection
        className="mt-9 sm:mt-10"
        description={t("documents.description")}
        icon={Paperclip}
        title={t("documents.title")}
      >
        {enrollmentIntroDocumentSlots.map((slot) => (
          <div
            className="border-border bg-surface flex items-start justify-between gap-3 rounded-xl border px-4 py-3.5"
            data-slot="enrollment-intro-document"
            key={slot.id}
          >
            <div className="min-w-0">
              <p className="text-foreground text-[0.92rem] leading-tight font-semibold tracking-tight">
                {tSlots(`${slot.id}.title`)}
              </p>
              <p className="text-muted-foreground mt-1 text-[0.85rem] leading-6">
                {tSlots(`${slot.id}.description`)}
              </p>
            </div>
            {/* Required/Optional comes straight off the slot config, so the
                checklist stays honest if the backend policy changes. */}
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.08em] uppercase",
                slot.required
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-surface-muted text-muted-foreground",
              )}
            >
              {slot.required
                ? t("documents.required")
                : t("documents.optional")}
            </span>
          </div>
        ))}

        <p className="text-muted-foreground flex items-start gap-2 text-[0.85rem] leading-6 md:col-span-2">
          <Info aria-hidden="true" className="mt-1 size-4 shrink-0" />
          <span>
            {t("documents.identityNote", { min: MIN_IDENTITY_DOCUMENTS })}
          </span>
        </p>
      </EnrollmentStepSection>

      <EnrollmentStepSection
        className="mt-9 sm:mt-10"
        description={t("how.description")}
        icon={Info}
        title={t("how.title")}
      >
        {enrollmentIntroHowItWorksItems.map((item) => (
          <EnrollmentIntroFact
            description={t(`how.items.${item.id}.description`)}
            icon={item.icon}
            key={item.id}
            title={t(`how.items.${item.id}.title`)}
          />
        ))}
      </EnrollmentStepSection>

      <EnrollmentStepFooter backHref="/dashboard">
        <Button asChild className="min-w-[12rem]" size="lg">
          <Link href="/enrollment/step-1">{t("cta")}</Link>
        </Button>
      </EnrollmentStepFooter>
    </>
  );
}

/** One "How it works" fact: neutral ink glyph + a short title and answer. */
function EnrollmentIntroFact({
  description,
  icon: Icon,
  title,
}: Readonly<{ description: string; icon: LucideIcon; title: string }>) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        aria-hidden="true"
        className="text-muted-foreground mt-0.5 size-[1.05rem] shrink-0"
      />
      <div className="min-w-0">
        <p className="text-foreground text-[0.92rem] leading-tight font-semibold tracking-tight">
          {title}
        </p>
        <p className="text-muted-foreground mt-1 text-[0.85rem] leading-6">
          {description}
        </p>
      </div>
    </div>
  );
}
