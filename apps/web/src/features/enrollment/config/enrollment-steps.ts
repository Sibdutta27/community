import type { LucideIcon } from "lucide-react";

import { FileCheck2, FileUp, PenLine, TreePine, UserRound } from "lucide-react";

import type {
  AccountInfoResponse,
  EnrollmentStepState,
} from "@/types/enrollment";

export type EnrollmentStepDefinition = Readonly<{
  step: number;
  title: string;
  /** Page heading, rendered as "N. {headingTitle}" on the step page. */
  headingTitle: string;
  description: string;
  progressTitle: string;
  progressDescription: string;
  ctaLabel: string;
  href: string;
  icon: LucideIcon;
  progress: number;
  isEnabled: boolean;
  placeholderDescription: string;
}>;

export type EnrollmentProgressStage = Readonly<{
  step: number;
  title: string;
  description: string;
}>;

export const enrollmentStepDefinitions = [
  {
    step: 1,
    title: "Demographics",
    headingTitle: "Add your demographics",
    description: "Provide your personal demographic details.",
    progressTitle: "Demographics",
    progressDescription: "Provide your personal demographic details",
    ctaLabel: "Start Step 1",
    href: "/enrollment/step-1",
    icon: UserRound,
    progress: 0,
    isEnabled: true,
    placeholderDescription:
      "This route hosts the demographics form that members complete after starting enrollment and accepting the active consents.",
  },
  {
    step: 2,
    title: "Maternal Kinship",
    headingTitle: "Add your maternal kinship information",
    description: "Document your mother and maternal grandparents.",
    progressTitle: "Maternal Kinship",
    progressDescription: "Document your mother and maternal grandparents",
    ctaLabel: "Start Step 2",
    href: "/enrollment/step-2",
    icon: TreePine,
    progress: 0,
    isEnabled: false,
    placeholderDescription:
      "This route hosts the maternal-kinship form for the mother and maternal grandparents.",
  },
  {
    step: 3,
    title: "Paternal Kinship",
    headingTitle: "Add your paternal kinship information",
    description: "Document your father and paternal grandparents.",
    progressTitle: "Paternal Kinship",
    progressDescription: "Document your father and paternal grandparents",
    ctaLabel: "Start Step 3",
    href: "/enrollment/step-3",
    icon: FileCheck2,
    progress: 0,
    isEnabled: false,
    placeholderDescription:
      "This route hosts the paternal-kinship form for the father and paternal grandparents.",
  },
  {
    step: 4,
    title: "Documents",
    headingTitle: "Upload your documents",
    description: "Upload your photo and any supporting kinship evidence.",
    progressTitle: "Documents",
    progressDescription: "Upload your photo and supporting evidence",
    ctaLabel: "Start Step 4",
    href: "/enrollment/step-4",
    icon: FileUp,
    progress: 0,
    isEnabled: false,
    placeholderDescription:
      "This route hosts the document-upload experience after the earlier enrollment forms are completed.",
  },
  {
    step: 5,
    title: "Confirmation",
    headingTitle: "Review & confirm",
    description:
      "Review, sign, and submit your enrollment application for council review.",
    progressTitle: "Confirmation",
    progressDescription: "Sign and submit your application",
    ctaLabel: "Start Step 5",
    href: "/enrollment/step-5",
    icon: PenLine,
    progress: 0,
    isEnabled: false,
    placeholderDescription:
      "This route hosts the confirmation and e-signature step that submits the enrollment application.",
  },
] as const satisfies readonly EnrollmentStepDefinition[];

export const enrollmentTotalSteps = enrollmentStepDefinitions.length;

export const enrollmentProgressStages = enrollmentStepDefinitions.map(
  ({ step, progressTitle, progressDescription }) => ({
    step,
    title: progressTitle,
    description: progressDescription,
  }),
) satisfies readonly EnrollmentProgressStage[];

export function getEnrollmentStepDefinition(stepNumber: number) {
  return (
    enrollmentStepDefinitions.find((step) => step.step === stepNumber) ?? null
  );
}

const defaultEnrollmentStepState: EnrollmentStepState = {
  "1": false,
  "2": false,
  "3": false,
  "4": false,
  "5": false,
};

function getStepKey(stepNumber: number) {
  return String(stepNumber) as keyof EnrollmentStepState;
}

/**
 * Free jump navigation: every enrollment step is always navigable, so members
 * can move between steps in any order. Completion state still drives the
 * stepper's completed styling and gates the final submit (see
 * {@link getIncompleteEnrollmentSteps}); the backend enforces
 * `allStepsCompleted` before an application can be submitted.
 */
export function isEnrollmentStepNavigable(
  // Parameters kept so existing callers (stepper, dashboard) don't change;
  // free jump navigation ignores them.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _stepState: EnrollmentStepState | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _stepNumber: number,
) {
  return true;
}

export type IncompleteEnrollmentStep = Readonly<{
  step: number;
  title: string;
  href: string;
}>;

/**
 * The steps (1-4) that still need attention before the enrollment can be
 * submitted from the confirmation step. A null/undefined (still loading)
 * state is treated as all-incomplete so the submit stays gated until the
 * real completion map arrives.
 */
export function getIncompleteEnrollmentSteps(
  stepState: EnrollmentStepState | null | undefined,
): readonly IncompleteEnrollmentStep[] {
  const resolvedStepState = stepState ?? defaultEnrollmentStepState;

  return enrollmentStepDefinitions
    .filter(
      (definition) =>
        definition.step < enrollmentTotalSteps &&
        !resolvedStepState[getStepKey(definition.step)],
    )
    .map(({ step, title, href }) => ({ step, title, href }));
}

export function buildDashboardEnrollmentSteps(
  stepState?: EnrollmentStepState | null,
) {
  const resolvedStepState = stepState ?? defaultEnrollmentStepState;

  return enrollmentStepDefinitions.map((step) => {
    const stepKey = getStepKey(step.step);
    const isCompleted = resolvedStepState[stepKey];

    return {
      ...step,
      isEnabled: isEnrollmentStepNavigable(resolvedStepState, step.step),
      progress: isCompleted ? 1 : 0,
    };
  });
}

export function resolveEnrollmentStepState(
  accountInfo?: Pick<
    AccountInfoResponse,
    "enrollment" | "enrollmentStep" | "enrollmentStatus"
  > | null,
): EnrollmentStepState | null {
  const backendStepState =
    accountInfo?.enrollment?.steps ?? accountInfo?.enrollmentStep ?? null;

  if (!backendStepState) {
    return null;
  }

  // The backend tracks steps 1-4; the confirmation step (5) is considered
  // completed once the enrollment has been submitted (any non-draft status).
  const enrollmentStatus =
    accountInfo?.enrollment?.status ?? accountInfo?.enrollmentStatus ?? null;
  const isSubmitted =
    typeof enrollmentStatus === "string" &&
    enrollmentStatus.length > 0 &&
    enrollmentStatus.toUpperCase() !== "DRAFT";

  return {
    ...backendStepState,
    "5": Boolean(backendStepState["5"]) || isSubmitted,
  };
}

export function getEnrollmentStatusDisplay(
  enrollmentStatus: string | null | undefined,
  hasEnrollment: boolean | undefined,
) {
  if (!hasEnrollment) {
    return "Not Started";
  }

  if (!enrollmentStatus) {
    return "Draft";
  }

  return enrollmentStatus
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
