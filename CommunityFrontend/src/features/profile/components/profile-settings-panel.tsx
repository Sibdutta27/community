import { cn } from "@/lib/utils";

import type { ProfileSettingsData } from "../config/profile-config";

export function ProfileSettingsPanel({
  settingsData,
}: Readonly<{
  settingsData: ProfileSettingsData;
}>) {
  return (
    <div className="space-y-5">
      <header className="max-w-3xl">
        <h2 className="text-[1.45rem] leading-[1.05] font-semibold tracking-[-0.04em] text-[#245f6d] sm:text-[1.7rem] lg:text-[2rem]">
          {settingsData.title}
        </h2>
        <p className="mt-2 text-[0.88rem] leading-5 text-[#245f6d] sm:text-[0.93rem] lg:text-[0.98rem]">
          {settingsData.description}
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#245f6d] sm:text-[16px]">
            Account Snapshot
          </h3>
          <dl className="mt-3 space-y-2.5">
            {settingsData.accountFacts.map((fact) => (
              <div
                className="flex items-start justify-between gap-3 rounded-[10px] bg-[#f6f8f6] px-3 py-2.5"
                key={fact.label}
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
            Notification Preferences
          </h3>
          <ul className="mt-3 space-y-2.5">
            {settingsData.preferences.map((preference) => (
              <li
                className="rounded-[10px] border border-[#e2dfd4] bg-[#fbfcfb] px-3 py-2.5"
                key={preference.label}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-[#184551] sm:text-[13px]">
                    {preference.label}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]",
                      preference.enabled
                        ? "bg-[#e6f5ef] text-[#1f6b55]"
                        : "bg-[#f0ece2] text-[#765d36]",
                    )}
                  >
                    {preference.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-[1.15rem] text-[#607579] sm:text-[13px]">
                  {preference.description}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5">
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#245f6d] sm:text-[16px]">
          Security And Access
        </h3>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {settingsData.securityItems.map((item) => (
            <li
              className="rounded-[12px] border border-[#e3e9eb] bg-[#f7fbfc] px-3 py-3"
              key={item.title}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-[#184551] sm:text-[13px]">
                  {item.title}
                </p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]",
                    item.tone === "good"
                      ? "bg-[#e6f5ef] text-[#1f6b55]"
                      : item.tone === "warn"
                        ? "bg-[#fdf0e6] text-[#9a5e22]"
                        : "bg-[#e8f4f8] text-[#1f5968]",
                  )}
                >
                  {item.statusLabel}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] leading-[1.15rem] text-[#607579]">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
