import { cn } from "@/lib/utils";

import sharedStyles from "../styles/profile-shared.module.scss";
import type { ProfileActivityData } from "../config/profile-config";

export function ProfileActivityPanel({
  activityData,
}: Readonly<{
  activityData: ProfileActivityData;
}>) {
  return (
    <div className="space-y-5">
      <header className="max-w-3xl">
        <h2 className="text-foreground text-[1.45rem] leading-[1.05] font-semibold tracking-tight sm:text-[1.7rem] lg:text-[2rem]">
          {activityData.title}
        </h2>
        <p className="text-muted-foreground mt-2 text-[0.88rem] leading-5 sm:text-[0.93rem] lg:text-[0.98rem]">
          {activityData.description}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {activityData.metrics.map((metric) => (
          <article
            className="border-border bg-surface shadow-card-soft rounded-xl border px-4 py-4"
            key={metric.label}
          >
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.03em] uppercase">
              {metric.label}
            </p>
            <p className="text-foreground mt-1.5 text-[1.42rem] leading-none font-semibold tracking-tight sm:text-[1.56rem]">
              {metric.value}
            </p>
            <p className="text-muted-foreground mt-2 text-[12px] leading-[1.15rem]">
              {metric.helper}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <article className="border-border bg-surface shadow-card-soft rounded-xl border p-4 sm:p-5">
          <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
            Recent Timeline
          </h3>

          {activityData.events.length > 0 ? (
            <ul className="mt-3 space-y-2.5">
              {activityData.events.map((event) => {
                const toneClassName =
                  event.tone === "success"
                    ? "bg-secondary text-secondary-foreground"
                    : event.tone === "warning"
                      ? "bg-surface-muted text-foreground"
                      : "bg-secondary text-secondary-foreground";

                return (
                  <li
                    className="border-border bg-surface rounded-lg border px-3 py-3"
                    key={event.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-foreground min-w-0 truncate text-[12px] font-semibold sm:text-[13px]">
                        {event.title}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap sm:text-[11px]",
                          toneClassName,
                        )}
                      >
                        {event.dateLabel}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1.5 text-[12px] leading-[1.15rem] sm:text-[13px]">
                      {event.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={cn(sharedStyles.emptyStatePlain, "mt-3 px-4 py-6")}>
              <p className={cn(sharedStyles.emptyDescription, "text-[13px]")}>
                No timeline events yet.
              </p>
            </div>
          )}
        </article>

        <article className="border-border bg-surface shadow-card-soft rounded-xl border p-4 sm:p-5">
          <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
            Next Actions
          </h3>

          {activityData.nextActions.length > 0 ? (
            <ul className="mt-3 space-y-2.5">
              {activityData.nextActions.map((action, index) => (
                <li
                  className="border-border bg-secondary text-secondary-foreground rounded-lg border px-3 py-2.5 text-[12px] font-medium sm:text-[13px]"
                  key={`${action}-${index}`}
                >
                  {action}
                </li>
              ))}
            </ul>
          ) : (
            <div className={cn(sharedStyles.emptyStatePlain, "mt-3 px-4 py-6")}>
              <p className={cn(sharedStyles.emptyDescription, "text-[13px]")}>
                No immediate actions.
              </p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
