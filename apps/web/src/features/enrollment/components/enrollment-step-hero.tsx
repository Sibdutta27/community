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
    <section
      className={cn(
        "relative overflow-hidden bg-[linear-gradient(135deg,#2d2018_0%,#1f1712_100%)]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,49,51,0.2),transparent_32%),radial-gradient(circle_at_86%_20%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_82%_78%,rgba(111,175,196,0.16),transparent_22%)]" />
      <div className="absolute -right-20 bottom-0 size-64 rounded-full border border-white/10 bg-white/6 blur-3xl sm:size-80" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[20.5rem] flex-col justify-end pt-24 pb-10 sm:min-h-[22.75rem] sm:pt-28 sm:pb-12 lg:min-h-[25rem] lg:pt-32 lg:pb-14">
          <div className="max-w-6xl">
            <div className="inline-flex items-center rounded-full border border-white/55 bg-white/6 px-3.5 py-1.5 text-xs font-medium tracking-[-0.02em] text-white/92 backdrop-blur-sm sm:px-4 sm:text-sm">
              Step {step} of {totalSteps}
            </div>

            <h1 className="mt-5 max-w-[12ch] text-[clamp(2.1rem,5.9vw,4.4rem)] leading-[0.94] font-semibold tracking-[-0.06em] text-white sm:mt-6 sm:max-w-none lg:text-[3.15rem] lg:leading-[0.96] lg:whitespace-nowrap xl:text-[3.8rem] 2xl:text-[4.35rem]">
              {title}
            </h1>

            <p className="mt-4 max-w-3xl text-[0.98rem] leading-6 text-white/88 sm:mt-5 sm:text-[1.02rem] sm:leading-7 lg:text-[1.08rem] lg:leading-[1.42]">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
