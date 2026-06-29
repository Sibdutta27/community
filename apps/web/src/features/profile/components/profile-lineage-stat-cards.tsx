import type { ProfileLineageStat } from "../config/profile-config";

function ProfileLineageStatCard({
  description,
  label,
  value,
}: Readonly<{
  description: string;
  label: string;
  value: string;
}>) {
  return (
    <article className="flex min-h-[132px] flex-col items-center justify-center rounded-[18px] bg-[#2d756d] px-4 py-5 text-center shadow-[0_18px_40px_-30px_rgba(36,95,109,0.35)] sm:min-h-[146px] sm:px-5 sm:py-6 lg:min-h-[138px] lg:px-4 lg:py-5 xl:min-h-[150px] xl:px-5 xl:py-6">
      <p className="text-[clamp(2.05rem,3.6vw,3rem)] leading-none font-semibold tracking-[-0.08em] text-white">
        {value}
      </p>

      <p className="mt-2 text-[clamp(0.95rem,1.7vw,1.2rem)] leading-none font-semibold tracking-[-0.04em] text-white">
        {label}
      </p>

      <p className="mt-1.5 max-w-[14rem] text-[12px] leading-[1.1rem] font-semibold text-white/80 sm:text-[13px] lg:text-[12px] xl:max-w-none">
        {description}
      </p>
    </article>
  );
}

export function ProfileLineageStatCards({
  stats,
}: Readonly<{
  stats: readonly ProfileLineageStat[];
}>) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-3.5 xl:gap-4">
      {stats.map((stat, index) => (
        <ProfileLineageStatCard
          key={`${stat.label}-${index}`}
          description={stat.description}
          label={stat.label}
          value={stat.value}
        />
      ))}
    </div>
  );
}
