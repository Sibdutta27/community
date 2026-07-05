import { SurfaceCard } from "@/components/shared/surface-card";
import type { YucayekeLegacyPeriod } from "@/features/yucayeke/constants/yucayeke-content";

type YucayekeLegacyTimelineItemProps = Readonly<{
  isLast: boolean;
  period: YucayekeLegacyPeriod;
}>;

export function YucayekeLegacyTimelineItem({
  isLast,
  period,
}: YucayekeLegacyTimelineItemProps) {
  return (
    <li className="grid gap-3 md:grid-cols-[4.1rem_minmax(0,1fr)] md:gap-5">
      {/* Desktop-only year rail; the mobile duplicate below is display:none
          at md+, so screen readers only ever hear one year marker. */}
      <div className="hidden md:flex md:flex-col md:items-center">
        <div className="border-border bg-surface text-foreground flex h-14 w-14 items-center justify-center rounded-full border-2 text-[1.05rem] font-semibold tracking-tight">
          {period.yearLabel}
        </div>

        {!isLast ? (
          <div className="bg-border mt-2.5 min-h-16 w-1 rounded-full" />
        ) : null}
      </div>

      <SurfaceCard as="div">
        <div className="mb-2.5 flex items-center gap-3 md:hidden">
          <div className="border-border bg-surface-muted text-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[0.9rem] font-semibold tracking-tight">
            {period.yearLabel}
          </div>
          <div aria-hidden="true" className="bg-border h-px flex-1" />
        </div>

        <h3 className="text-foreground text-[1rem] leading-tight font-semibold tracking-tight sm:text-[1.1rem]">
          {period.title}
        </h3>

        <p className="text-muted-foreground mt-2.5 text-[0.86rem] leading-6 sm:text-[0.9rem] sm:leading-6">
          {period.description}
        </p>
      </SurfaceCard>
    </li>
  );
}
