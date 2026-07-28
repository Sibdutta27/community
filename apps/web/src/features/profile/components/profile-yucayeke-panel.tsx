import { useTranslations } from "next-intl";

import { YourYucayekeCard } from "@/features/yucayeke/components/your-yucayeke-card";

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

      <YourYucayekeCard
        yucayekeValue={yucayekeData.declaredYucayeke}
        yucayekeUnknown={yucayekeData.yucayekeUnknown}
      />

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
    </div>
  );
}
