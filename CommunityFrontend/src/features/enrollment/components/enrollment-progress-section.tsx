import { Check } from "lucide-react";

import {
  enrollmentProgressStages,
  type EnrollmentProgressStage,
} from "@/features/enrollment/config/enrollment-steps";
import { cn } from "@/lib/utils";

type EnrollmentProgressSectionProps = Readonly<{
  className?: string;
  currentStage: number;
  stages?: readonly EnrollmentProgressStage[];
}>;

export function EnrollmentProgressSection({
  className,
  currentStage,
  stages = enrollmentProgressStages,
}: EnrollmentProgressSectionProps) {
  const resolvedCurrentStage = stages.some(
    (stage) => stage.step === currentStage,
  )
    ? currentStage
    : (stages[0]?.step ?? 1);

  return (
    <section
      aria-label="Enrollment progress"
      className={cn("border-t border-[#e6eeeb] bg-white", className)}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <div className="-mx-4 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
          <ol className="flex min-w-max items-start gap-5 sm:gap-6 lg:min-w-0 lg:justify-between lg:gap-5 xl:gap-8">
            {stages.map((stage) => {
              const isCompleted = stage.step < resolvedCurrentStage;
              const isActive = stage.step === resolvedCurrentStage;
              const isUpcoming = stage.step > resolvedCurrentStage;

              return (
                <li
                  key={stage.step}
                  aria-current={isActive ? "step" : undefined}
                  className="min-w-[15.5rem] shrink-0 lg:min-w-0 lg:flex-1"
                >
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <div
                      className={cn(
                        "flex size-14 shrink-0 items-center justify-center rounded-full text-[1.75rem] font-semibold tracking-[-0.05em] text-white sm:size-16 sm:text-[2rem]",
                        isActive
                          ? "bg-primary shadow-[0_18px_34px_-20px_rgba(197,49,51,0.42)]"
                          : isCompleted
                            ? "bg-primary shadow-[0_14px_28px_-20px_rgba(197,49,51,0.34)]"
                            : "bg-[#b7b7b7]",
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
                          "text-[1.05rem] leading-tight font-medium tracking-[-0.04em] sm:text-[1.2rem]",
                          isUpcoming ? "text-[#9fa2a1]" : "text-[#173f4c]",
                        )}
                      >
                        {stage.title}
                      </p>
                      <p
                        className={cn(
                          "mt-2 max-w-[13rem] text-[0.76rem] leading-[1.05rem] sm:max-w-[13.5rem] sm:text-[0.8rem] sm:leading-[1.08rem]",
                          isUpcoming ? "text-[#c0c4c2]" : "text-[#7a8480]",
                        )}
                      >
                        {stage.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
