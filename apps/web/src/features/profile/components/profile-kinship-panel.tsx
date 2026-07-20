import { cn } from "@/lib/utils";

import sharedStyles from "../styles/profile-shared.module.scss";
import type { ProfileKinshipData } from "../config/profile-config";

export function ProfileKinshipPanel({
  kinshipData,
}: Readonly<{
  kinshipData: ProfileKinshipData;
}>) {
  return (
    <div className="space-y-5">
      <header className="max-w-3xl">
        <h2 className="text-foreground text-[1.45rem] leading-[1.05] font-semibold tracking-tight sm:text-[1.7rem] lg:text-[2rem]">
          {kinshipData.title}
        </h2>
        <p className="text-muted-foreground mt-2 text-[0.88rem] leading-5 sm:text-[0.93rem] lg:text-[0.98rem]">
          {kinshipData.description}
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        {kinshipData.groups.map((group) => (
          <article
            key={group.title}
            className="border-border bg-surface shadow-card-soft rounded-xl border p-4 sm:p-5"
          >
            <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
              {group.title}
            </h3>

            {group.ancestors.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {group.ancestors.map((ancestor) => (
                  <li
                    key={`${group.title}-${ancestor.relation}`}
                    className="border-border bg-surface rounded-lg border px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-foreground min-w-0 truncate text-[12px] font-semibold sm:text-[13px]">
                        {ancestor.name}
                      </p>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {ancestor.verificationLabel ? (
                          <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap sm:text-[11px]">
                            {ancestor.verificationLabel}
                          </span>
                        ) : null}
                        <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap sm:text-[11px]">
                          {ancestor.relation}
                        </span>
                      </span>
                    </div>

                    <dl className="mt-2 space-y-1">
                      {ancestor.facts.map((fact) => (
                        <div
                          key={fact.label}
                          className="flex items-start justify-between gap-3"
                        >
                          <dt className="text-muted-foreground text-[11px] font-medium sm:text-[12px]">
                            {fact.label}
                          </dt>
                          <dd className="text-foreground min-w-0 text-right text-[11px] font-semibold break-words sm:text-[12px]">
                            {fact.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className={cn(sharedStyles.emptyStatePlain, "mt-3 px-4 py-6")}
              >
                <p className={cn(sharedStyles.emptyDescription, "text-[13px]")}>
                  {group.emptyMessage}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
