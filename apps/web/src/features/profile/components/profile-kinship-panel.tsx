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
        <h2 className="text-[1.45rem] leading-[1.05] font-semibold tracking-[-0.04em] text-[#123b5e] sm:text-[1.7rem] lg:text-[2rem]">
          {kinshipData.title}
        </h2>
        <p className="mt-2 text-[0.88rem] leading-5 text-[#123b5e] sm:text-[0.93rem] lg:text-[0.98rem]">
          {kinshipData.description}
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        {kinshipData.groups.map((group) => (
          <article
            key={group.title}
            className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5"
          >
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#123b5e] sm:text-[16px]">
              {group.title}
            </h3>

            {group.ancestors.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {group.ancestors.map((ancestor) => (
                  <li
                    key={`${group.title}-${ancestor.relation}`}
                    className="rounded-[10px] border border-[#e2dfd4] bg-[#fbfcfb] px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-semibold text-[#0b2033] sm:text-[13px]">
                        {ancestor.name}
                      </p>
                      <span className="rounded-full bg-[#e8f4ef] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-[#1f6b55] sm:text-[11px]">
                        {ancestor.relation}
                      </span>
                    </div>

                    <dl className="mt-2 space-y-1">
                      {ancestor.facts.map((fact) => (
                        <div
                          key={fact.label}
                          className="flex items-start justify-between gap-3"
                        >
                          <dt className="text-[11px] font-medium text-[#5a6472] sm:text-[12px]">
                            {fact.label}
                          </dt>
                          <dd className="text-right text-[11px] font-semibold text-[#0b2033] sm:text-[12px]">
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
