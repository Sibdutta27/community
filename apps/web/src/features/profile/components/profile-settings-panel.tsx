import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import type { ProfileSettingsData } from "../config/profile-config";

export function ProfileSettingsPanel({
  settingsData,
}: Readonly<{
  settingsData: ProfileSettingsData;
}>) {
  const t = useTranslations("profile");

  return (
    <div className="space-y-5">
      <header className="max-w-3xl">
        <h2 className="text-foreground text-[1.45rem] leading-[1.05] font-semibold tracking-tight sm:text-[1.7rem] lg:text-[2rem]">
          {settingsData.title}
        </h2>
        <p className="text-muted-foreground mt-2 text-[0.88rem] leading-5 sm:text-[0.93rem] lg:text-[0.98rem]">
          {settingsData.description}
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        <article className="border-border bg-surface shadow-card-soft rounded-xl border p-4 sm:p-5">
          <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
            {t("settings.accountSnapshot")}
          </h3>
          <dl className="mt-3 space-y-2.5">
            {settingsData.accountFacts.map((fact) => (
              <div
                className="bg-surface-muted flex items-start justify-between gap-3 rounded-lg px-3 py-2.5"
                key={fact.label}
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
            {t("settings.notificationPreferences")}
          </h3>
          <ul className="mt-3 space-y-2.5">
            {settingsData.preferences.map((preference) => (
              <li
                className="border-border bg-surface rounded-lg border px-3 py-2.5"
                key={preference.label}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-foreground min-w-0 truncate text-[12px] font-semibold sm:text-[13px]">
                    {preference.label}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]",
                      preference.enabled
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-surface-muted text-foreground",
                    )}
                  >
                    {preference.enabled
                      ? t("settings.enabled")
                      : t("settings.disabled")}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1.5 text-[12px] leading-[1.15rem] sm:text-[13px]">
                  {preference.description}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="border-border bg-surface shadow-card-soft rounded-xl border p-4 sm:p-5">
        <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
          {t("settings.securityAndAccess")}
        </h3>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {settingsData.securityItems.map((item) => (
            <li
              className="border-border bg-surface-muted rounded-lg border px-3 py-3"
              key={item.title}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-foreground min-w-0 truncate text-[12px] font-semibold sm:text-[13px]">
                  {item.title}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]",
                    item.tone === "good"
                      ? "bg-secondary text-secondary-foreground"
                      : item.tone === "warn"
                        ? "bg-surface text-foreground"
                        : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {item.statusLabel}
                </span>
              </div>
              <p className="text-muted-foreground mt-1.5 text-[12px] leading-[1.15rem]">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
