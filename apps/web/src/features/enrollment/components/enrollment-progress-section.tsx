"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Check } from "lucide-react";

import {
  enrollmentProgressStages,
  getEnrollmentStepDefinition,
  isEnrollmentStepNavigable,
  resolveEnrollmentStepState,
  type EnrollmentProgressStage,
} from "@/features/enrollment/config/enrollment-steps";
import { useAccountInfoQuery } from "@/features/enrollment/lib/enrollment-queries";
import { cn } from "@/lib/utils";

type EnrollmentProgressSectionProps = Readonly<{
  className?: string;
  currentStage: number;
  stages?: readonly EnrollmentProgressStage[];
}>;

function StageContent({
  isActive,
  isCompleted,
  isUpcoming,
  stage,
}: Readonly<{
  isActive: boolean;
  isCompleted: boolean;
  isUpcoming: boolean;
  stage: EnrollmentProgressStage;
}>) {
  return (
    <div className="flex items-start gap-3.5 sm:gap-4">
      <div
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-full text-[1.75rem] font-semibold tracking-tight sm:size-16 sm:text-[2rem]",
          isActive || isCompleted
            ? "bg-foreground text-background"
            : "border-border text-muted-foreground border bg-surface",
        )}
      >
        {isCompleted ? (
          <Check className="size-7 stroke-[3] sm:size-8" />
        ) : (
          stage.step
        )}
      </div>

      <div className="pt-1">
        <p
          className={cn(
            "text-[1.05rem] leading-tight font-medium tracking-tight sm:text-[1.2rem]",
            isUpcoming ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {stage.title}
        </p>
        <p
          className={cn(
            "text-muted-foreground mt-2 max-w-[13rem] text-[0.76rem] leading-[1.05rem] sm:max-w-[13.5rem] sm:text-[0.8rem] sm:leading-[1.08rem]",
            isUpcoming && "opacity-70",
          )}
        >
          {stage.description}
        </p>
      </div>
    </div>
  );
}

export function EnrollmentProgressSection({
  className,
  currentStage,
  stages = enrollmentProgressStages,
}: EnrollmentProgressSectionProps) {
  const accountInfoQuery = useAccountInfoQuery();
  const stepState = resolveEnrollmentStepState(accountInfoQuery.data);

  const resolvedCurrentStage = stages.some(
    (stage) => stage.step === currentStage,
  )
    ? currentStage
    : (stages[0]?.step ?? 1);

  return (
    <section
      aria-label="Enrollment progress"
      className={cn("border-border bg-background border-t", className)}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <div className="-mx-4 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
          <ol className="flex min-w-max items-start gap-5 sm:gap-6 lg:min-w-0 lg:justify-between lg:gap-5 xl:gap-8">
            {stages.map((stage) => {
              const isCompleted = stage.step < resolvedCurrentStage;
              const isActive = stage.step === resolvedCurrentStage;
              const isUpcoming = stage.step > resolvedCurrentStage;
              const stageHref = getEnrollmentStepDefinition(stage.step)?.href;
              const isNavigable =
                !isActive &&
                Boolean(stageHref) &&
                isEnrollmentStepNavigable(stepState, stage.step) &&
                // Without loaded step state, only steps the user has already
                // walked past in this flow are safe to link back to.
                (stepState !== null || stage.step < resolvedCurrentStage);

              const content: ReactNode = (
                <StageContent
                  isActive={isActive}
                  isCompleted={isCompleted}
                  isUpcoming={isUpcoming}
                  stage={stage}
                />
              );

              return (
                <li
                  key={stage.step}
                  aria-current={isActive ? "step" : undefined}
                  className="min-w-[15.5rem] shrink-0 lg:min-w-0 lg:flex-1"
                >
                  {isNavigable && stageHref ? (
                    <Link
                      aria-label={`Go to step ${stage.step}: ${stage.title}`}
                      className="focus-visible:ring-ring block cursor-pointer rounded-2xl outline-none focus-visible:ring-2"
                      href={stageHref}
                    >
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
