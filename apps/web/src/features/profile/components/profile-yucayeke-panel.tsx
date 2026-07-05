import { useTranslations } from "next-intl";

import type { ProfileYucayekeData } from "../config/profile-config";

export function ProfileYucayekePanel({
  yucayekeData,
}: Readonly<{
  yucayekeData: ProfileYucayekeData;
}>) {
  const t = useTranslations("profile");

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-foreground text-[1.45rem] leading-[1.05] font-semibold tracking-tight sm:text-[1.7rem] lg:text-[2rem]">
            {yucayekeData.title}
          </h2>
          <p className="text-muted-foreground mt-2 text-[0.88rem] leading-5 sm:text-[0.93rem] lg:text-[0.98rem]">
            {yucayekeData.description}
          </p>
        </div>

        <span className="border-border bg-secondary text-secondary-foreground inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold">
          {yucayekeData.communityName}
        </span>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {yucayekeData.metrics.map((metric) => (
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
            {t("yucayeke.territorySnapshot")}
          </h3>
          <dl className="mt-3 space-y-2.5">
            {yucayekeData.territoryFacts.map((fact) => (
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
            {t("yucayeke.familyCircle")}
          </h3>
          <ul className="mt-3 space-y-2.5">
            {yucayekeData.circles.map((member, index) => (
              <li
                key={`${member.role}-${member.name}-${index}`}
                className="border-border bg-surface rounded-lg border px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-foreground min-w-0 truncate text-[12px] font-semibold sm:text-[13px]">
                    {member.name}
                  </p>
                  <span className="bg-secondary text-secondary-foreground shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]">
                    {member.role}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-[12px] sm:text-[13px]">
                  {member.detail}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="border-border bg-surface shadow-card-soft rounded-xl border p-4 sm:p-5">
        <h3 className="text-foreground text-[15px] font-semibold tracking-tight sm:text-[16px]">
          {t("yucayeke.communityRhythm")}
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {yucayekeData.rhythm.map((item) => (
            <div
              key={item.label}
              className="border-border bg-surface-muted rounded-lg border px-3 py-2.5"
            >
              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.03em] uppercase">
                {item.label}
              </p>
              <p className="text-foreground mt-1 text-[12px] font-semibold break-words sm:text-[13px]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
