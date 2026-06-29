import { cn } from "@/lib/utils";

import sharedStyles from "../styles/profile-shared.module.scss";
import type { ProfileOverviewData } from "../config/profile-config";

export function ProfileOverviewPanel({
  overviewData,
}: Readonly<{
  overviewData: ProfileOverviewData;
}>) {
  return (
    <div className="space-y-5">
      <header className="max-w-3xl">
        <h2 className="text-[1.45rem] leading-[1.05] font-semibold tracking-[-0.04em] text-[#245f6d] sm:text-[1.7rem] lg:text-[2rem]">
          {overviewData.title}
        </h2>
        <p className="mt-2 text-[0.88rem] leading-5 text-[#245f6d] sm:text-[0.93rem] lg:text-[0.98rem]">
          {overviewData.description}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overviewData.metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[16px] border border-[#d7d1c3] bg-white px-4 py-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.45)]"
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

      <div className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#245f6d] sm:text-[16px]">
            Personal Snapshot
          </h3>
          <dl className="mt-3 space-y-2.5">
            {overviewData.personalFacts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-start justify-between gap-3 rounded-[10px] bg-[#f6f8f6] px-3 py-2.5"
              >
                <dt className="text-[12px] font-medium text-[#5f7174] sm:text-[13px]">
                  {fact.label}
                </dt>
                <dd className="text-right text-[12px] font-semibold text-[#184551] sm:text-[13px]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#245f6d] sm:text-[16px]">
            Contact Snapshot
          </h3>
          <dl className="mt-3 space-y-2.5">
            {overviewData.contactFacts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-start justify-between gap-3 rounded-[10px] bg-[#f6f8f6] px-3 py-2.5"
              >
                <dt className="text-[12px] font-medium text-[#5f7174] sm:text-[13px]">
                  {fact.label}
                </dt>
                <dd className="text-right text-[12px] font-semibold text-[#184551] sm:text-[13px]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <article className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#245f6d] sm:text-[16px]">
            Enrollment Checklist
          </h3>
          <ul className="mt-3 space-y-2.5">
            {overviewData.checklist.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-[#e2dfd4] bg-[#fbfcfb] px-3 py-2.5"
              >
                <span className="text-[12px] font-medium text-[#2f4f56] sm:text-[13px]">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold",
                    item.completed
                      ? "bg-[#e6f5ef] text-[#1f6b55]"
                      : "bg-[#f3e7d8] text-[#936728]",
                  )}
                >
                  {item.completed ? "Completed" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#245f6d] sm:text-[16px]">
            Cultural Connections
          </h3>
          {overviewData.culturalConnections.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {overviewData.culturalConnections.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="inline-flex rounded-full border border-[#c8d7dc] bg-[#eef6f8] px-3 py-1.5 text-[12px] font-medium text-[#20535f] sm:text-[13px]"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <div className={cn(sharedStyles.emptyStatePlain, "mt-3 px-4 py-6")}>
              <p className={cn(sharedStyles.emptyDescription, "text-[13px]")}>
                No cultural connection details available.
              </p>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
