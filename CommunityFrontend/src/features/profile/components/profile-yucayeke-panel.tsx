import type { ProfileYucayekeData } from "../config/profile-config";

export function ProfileYucayekePanel({
  yucayekeData,
}: Readonly<{
  yucayekeData: ProfileYucayekeData;
}>) {
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-[1.45rem] leading-[1.05] font-semibold tracking-[-0.04em] text-[#245f6d] sm:text-[1.7rem] lg:text-[2rem]">
            {yucayekeData.title}
          </h2>
          <p className="mt-2 text-[0.88rem] leading-5 text-[#245f6d] sm:text-[0.93rem] lg:text-[0.98rem]">
            {yucayekeData.description}
          </p>
        </div>

        <span className="inline-flex w-fit rounded-full border border-[#9bc7d1] bg-[#e9f6f9] px-3 py-1 text-[12px] font-semibold text-[#1f5968]">
          {yucayekeData.communityName}
        </span>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {yucayekeData.metrics.map((metric) => (
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
            Territory Snapshot
          </h3>
          <dl className="mt-3 space-y-2.5">
            {yucayekeData.territoryFacts.map((fact) => (
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
            Family Circle In This Yucayeke
          </h3>
          <ul className="mt-3 space-y-2.5">
            {yucayekeData.circles.map((member, index) => (
              <li
                key={`${member.role}-${member.name}-${index}`}
                className="rounded-[10px] border border-[#e2dfd4] bg-[#fbfcfb] px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-[#184551] sm:text-[13px]">
                    {member.name}
                  </p>
                  <span className="rounded-full bg-[#e8f4ef] px-2 py-0.5 text-[10px] font-semibold text-[#1f6b55] sm:text-[11px]">
                    {member.role}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-[#5f7174] sm:text-[13px]">
                  {member.detail}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="rounded-[16px] border border-[#d7d1c3] bg-white p-4 shadow-[0_14px_26px_-22px_rgba(36,95,109,0.4)] sm:p-5">
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#245f6d] sm:text-[16px]">
          Community Rhythm
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {yucayekeData.rhythm.map((item) => (
            <div
              key={item.label}
              className="rounded-[10px] border border-[#e3e9eb] bg-[#f7fbfc] px-3 py-2.5"
            >
              <p className="text-[11px] font-semibold tracking-[0.03em] text-[#63797f] uppercase">
                {item.label}
              </p>
              <p className="mt-1 text-[12px] font-semibold text-[#184551] sm:text-[13px]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
