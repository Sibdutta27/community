import { cn } from "@/lib/utils";

import type { ProfileOverviewData } from "../config/profile-config";

export function ProfileOverviewPanel({
  overviewData,
}: Readonly<{
  overviewData: ProfileOverviewData;
}>) {
  return (
    <div className="space-y-5">
      <header className="max-w-3xl">
        <h2 className="text-foreground text-[1.45rem] leading-[1.05] font-semibold tracking-tight sm:text-[1.7rem] lg:text-[2rem]">
          {overviewData.title}
        </h2>
        <p className="text-muted-foreground mt-2 text-[0.88rem] leading-5 sm:text-[0.93rem] lg:text-[0.98rem]">
          {overviewData.description}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overviewData.metrics.map((metric) => (
          <article
            key={metric.label}
            className="border-border bg-surface shadow-card-soft rounded-xl border px-4 py-4"
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

      <div className="grid gap-3 lg:grid-cols-2">
        <article className="border-border bg-surface shadow-card-soft rounded-xl border p-4 sm:p-5">
          <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
            Personal Snapshot
          </h3>
          <dl className="mt-3 space-y-2.5">
            {overviewData.personalFacts.map((fact) => (
              <div
                key={fact.label}
                className="bg-surface-muted flex items-start justify-between gap-3 rounded-lg px-3 py-2.5"
              >
                <dt className="text-muted-foreground text-[12px] font-medium sm:text-[13px]">
                  {fact.label}
                </dt>
                <dd className="text-foreground min-w-0 text-right text-[12px] font-semibold break-words sm:text-[13px]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="border-border bg-surface shadow-card-soft rounded-xl border p-4 sm:p-5">
          <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
            Contact Snapshot
          </h3>
          <dl className="mt-3 space-y-2.5">
            {overviewData.contactFacts.map((fact) => (
              <div
                key={fact.label}
                className="bg-surface-muted flex items-start justify-between gap-3 rounded-lg px-3 py-2.5"
              >
                <dt className="text-muted-foreground text-[12px] font-medium sm:text-[13px]">
                  {fact.label}
                </dt>
                <dd className="text-foreground min-w-0 text-right text-[12px] font-semibold break-words sm:text-[13px]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </div>

      <article className="border-border bg-surface shadow-card-soft rounded-xl border p-4 sm:p-5">
        <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
          Enrollment Checklist
        </h3>
        <ul className="mt-3 space-y-2.5">
          {overviewData.checklist.map((item) => (
            <li
              key={item.label}
              className="border-border bg-surface flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
            >
              <span className="text-foreground text-[12px] font-medium sm:text-[13px]">
                {item.label}
              </span>
              <span
                className={cn(
                  "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[11px] font-semibold",
                  item.completed
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-surface-muted text-foreground",
                )}
              >
                {item.completed ? "Completed" : "Pending"}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
