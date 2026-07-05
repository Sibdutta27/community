import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared shells for the `/brand-kit` living style guide. Everything here is
 * token-driven — swatches, chips and demo wells only ever use semantic
 * utilities, never raw values.
 */

type KitSectionProps = Readonly<{
  children: ReactNode;
  description: string;
  id: string;
  kicker: string;
  title: string;
}>;

/** Top-level brand-kit section: elevated white panel + anchored heading. */
export function KitSection({
  children,
  description,
  id,
  kicker,
  title,
}: KitSectionProps) {
  const headingId = `${id}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className="border-border bg-surface scroll-mt-28 space-y-8 rounded-2xl border p-6 shadow-card-soft sm:p-8 lg:p-10"
      id={id}
    >
      <div className="max-w-3xl space-y-2">
        <p className="text-muted-foreground text-[0.6rem] font-semibold tracking-[0.3em] uppercase">
          {kicker}
        </p>
        <h2
          className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl"
          id={headingId}
        >
          {title}
        </h2>
        <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

type KitDemoProps = Readonly<{
  caption?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  title: string;
}>;

/** Sub-block inside a section: h3 title, recessed demo well, usage caption. */
export function KitDemo({
  caption,
  children,
  className,
  contentClassName,
  title,
}: KitDemoProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-foreground text-[1.05rem] leading-tight font-semibold tracking-tight">
        {title}
      </h3>
      <div
        className={cn(
          "border-border bg-background rounded-xl border p-5 sm:p-6",
          contentClassName,
        )}
      >
        {children}
      </div>
      {caption ? (
        <p className="text-muted-foreground text-[0.82rem] leading-5">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

/** Inline token/class chip. */
export function TokenChip({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <code className="border-border bg-surface-muted text-foreground inline-flex max-w-full items-center overflow-x-auto rounded-md border px-1.5 py-0.5 font-mono text-[0.72rem] leading-5 whitespace-nowrap">
      {children}
    </code>
  );
}
