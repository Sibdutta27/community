import type { LucideIcon } from "lucide-react";

import { FileCheck2, FileUp, PenLine, TreePine, UserRound } from "lucide-react";

import type {
  AccountInfoResponse,
  EnrollmentStepState,
} from "@/types/enrollment";

export type EnrollmentStepDefinition = Readonly<{
  step: number;
  title: string;
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
    title: "Personal Information",
    description: "Provide your basic details and contact information.",
    progressTitle: "Personal Information",
    progressDescription: "Provide your basic details and contact information",
    ctaLabel: "Start Step 1",
    href: "/enrollment/step-1",
    icon: UserRound,
    progress: 0,
    isEnabled: true,
    placeholderDescription:
      "This placeholder route will host the personal-information form that members complete after starting enrollment and accepting the active consents.",
  },
  {
    step: 2,
    title: "Maternal Lineage",
    description: "Document your maternal ancestry and family history.",
    progressTitle: "Maternal Lineage",
    progressDescription: "Document your ancestral maternal line",
    ctaLabel: "Start Step 2",
    href: "/enrollment/step-2",
    icon: TreePine,
    progress: 0,
    isEnabled: false,
    placeholderDescription:
      "This placeholder route will host the maternal-lineage form once the next enrollment step is implemented.",
  },
  {
    step: 3,
    title: "Cultural Connection",
    description:
      "Share your cultural ties, traditions, and community connection.",
    progressTitle: "Cultural Connection",
    progressDescription: "Share traditions and community ties",
    ctaLabel: "Start Step 3",
    href: "/enrollment/step-3",
    icon: FileCheck2,
    progress: 0,
    isEnabled: false,
    placeholderDescription:
      "This placeholder route will host the cultural-connection step when that part of the enrollment workflow is implemented.",
  },
  {
    step: 4,
    title: "Document Upload",
    description:
      "Upload the supporting records required for enrollment review.",
    progressTitle: "Document Upload",
    progressDescription: "Upload supporting lineage documents",
    ctaLabel: "Start Step 4",
    href: "/enrollment/step-4",
    icon: FileUp,
    progress: 0,
    isEnabled: false,
    placeholderDescription:
      "This placeholder route will host the document-upload experience after the earlier enrollment forms are completed.",
  },
  {
    step: 5,
    title: "Confirmation",
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
 * A step is navigable when the user has already started or completed it:
 * either the step itself is completed, or every step before it is completed
 * (which makes it the current "frontier" step). Never-started steps further
 * ahead stay locked.
 */
export function isEnrollmentStepNavigable(
  stepState: EnrollmentStepState | null | undefined,
  stepNumber: number,
) {
  if (stepNumber <= 1) {
    return true;
  }

  const resolvedStepState = stepState ?? defaultEnrollmentStepState;

  if (resolvedStepState[getStepKey(stepNumber)]) {
    return true;
  }

  for (
    let previousStep = 1;
    previousStep < stepNumber;
    previousStep += 1
  ) {
    if (!resolvedStepState[getStepKey(previousStep)]) {
      return false;
    }
  }

  return true;
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
