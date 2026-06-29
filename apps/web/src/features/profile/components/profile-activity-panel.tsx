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
        <h2 className="text-[1.45rem] leading-[1.05] font-semibold tracking-[-0.04em] text-[#245f6d] sm:text-[1.7rem] lg:text-[2rem]">
          {activityData.title}
        </h2>
        <p className="mt-2 text-[0.88rem] leading-5 text-[#245f6d] sm:text-[0.93rem] lg:text-[0.98rem]">
          {activityData.description}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {activityData.metrics.map((metric) => (
          <article
            className="rounded-[16px] border border-[#d7d1c3] bg-white px-4 py-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.45)]"
            key={metric.label}
          >
            <p className="text-[11px] font-semibold tracking-[0.03em] text-[#6f7e81] uppercase">
              {metric.label}
            </p>
            <p className="mt-1.5 text-[1.42rem] leading-none font-semibold tracking-[-0.04em] text-[#1f5968] sm:text-[1.56rem]">
              {metric.value}
            </p>
            <p className="mt-2 text-[12px] leading-[1.15rem] text-[#5f7174]">
              {metric.helper}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <article className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#245f6d] sm:text-[16px]">
            Recent Timeline
          </h3>

          {activityData.events.length > 0 ? (
            <ul className="mt-3 space-y-2.5">
              {activityData.events.map((event) => {
                const toneClassName =
                  event.tone === "success"
                    ? "bg-[#e6f5ef] text-[#1f6b55]"
                    : event.tone === "warning"
                      ? "bg-[#fdf0e6] text-[#9a5e22]"
                      : "bg-[#e8f4f8] text-[#1f5968]";

                return (
                  <li
                    className="rounded-[12px] border border-[#e2dfd4] bg-[#fbfcfb] px-3 py-3"
                    key={event.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-semibold text-[#184551] sm:text-[13px]">
                        {event.title}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]",
                          toneClassName,
                        )}
                      >
                        {event.dateLabel}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-[1.15rem] text-[#607579] sm:text-[13px]">
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

        <article className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#245f6d] sm:text-[16px]">
            Next Actions
          </h3>

          {activityData.nextActions.length > 0 ? (
            <ul className="mt-3 space-y-2.5">
              {activityData.nextActions.map((action, index) => (
                <li
                  className="rounded-[12px] border border-[#dae6ea] bg-[#f5fafc] px-3 py-2.5 text-[12px] font-medium text-[#1f5562] sm:text-[13px]"
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
