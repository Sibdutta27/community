import { cn } from "@/lib/utils";

type EnrollmentStepHeroProps = Readonly<{
  className?: string;
  description: string;
  step: number;
  title: string;
  totalSteps: number;
}>;

export function EnrollmentStepHero({
  className,
  description,
  step,
  title,
  totalSteps,
}: EnrollmentStepHeroProps) {
  return (
    <section className={cn("border-b border-border bg-background", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-end pt-24 pb-10 sm:pt-28 sm:pb-12 lg:pt-32 lg:pb-14">
          <div className="max-w-6xl">
            <div className="inline-flex items-center rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium tracking-tight text-muted-foreground sm:px-4 sm:text-sm">
              Step {step} of {totalSteps}
            </div>

            <h1 className="text-foreground mt-5 max-w-[18ch] text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] font-semibold tracking-tight sm:mt-6 sm:max-w-none">
              {title}
            </h1>

            <p className="text-muted-foreground mt-4 max-w-3xl text-[0.98rem] leading-6 sm:mt-5 sm:text-[1.02rem] sm:leading-7">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
