import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EnrollmentStepSectionProps = Readonly<{
  children: ReactNode;
  className?: string;
  description?: string;
  title?: string;
}>;

/**
 * Light form section for the enrollment steps: an optional small sub-header
 * (e.g. an ancestor's name or "Your Yucayekeno Information") with an
 * explainer, above a responsive two-column field grid. Fields that should
 * span the full row take `className="md:col-span-2"`.
 */
export function EnrollmentStepSection({
  children,
  className,
  description,
  title,
}: EnrollmentStepSectionProps) {
  const hasHeader = Boolean(title || description);

  return (
    <section className={className}>
      {title ? (
        <h2 className="text-foreground text-[1.05rem] leading-tight font-semibold tracking-tight sm:text-[1.15rem]">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="text-muted-foreground mt-1.5 max-w-3xl text-[0.88rem] leading-6">
          {description}
        </p>
      ) : null}

      <div
        className={cn(
          "grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2",
          hasHeader && "mt-5 sm:mt-6",
        )}
      >
        {children}
      </div>
    </section>
  );
}
