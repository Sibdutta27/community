import { servicesHeroContent } from "@/features/services/constants/services-content";

export function ServicesHero() {
  const { badge, description, title } = servicesHeroContent;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#2d2018_0%,#1f1712_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,49,51,0.2),transparent_34%),radial-gradient(circle_at_86%_22%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_82%_80%,rgba(111,175,196,0.15),transparent_24%)]" />
      <div className="absolute bottom-0 -left-12 size-56 rounded-full border border-white/8 bg-white/6 blur-3xl sm:size-72" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[18rem] flex-col justify-end pt-24 pb-10 sm:min-h-[20rem] sm:pt-28 sm:pb-12 lg:min-h-[22rem] lg:pt-32 lg:pb-14">
          <div className="max-w-6xl">
            <div className="inline-flex items-center rounded-full border border-white/65 bg-white/6 px-4 py-1.5 text-xs font-medium tracking-[-0.02em] text-white/92 backdrop-blur-sm sm:px-5 sm:py-2 sm:text-sm">
              {badge}
            </div>

            <h1 className="mt-5 max-w-[13ch] text-[clamp(2.15rem,6vw,4.4rem)] leading-[0.94] font-semibold tracking-[-0.06em] text-white sm:mt-6 sm:max-w-none lg:text-[3.25rem] lg:leading-[0.96] xl:text-[3.85rem] 2xl:text-[4.35rem]">
              {title}
            </h1>

            <p className="mt-4 max-w-5xl text-[0.98rem] leading-6 text-white/86 sm:mt-5 sm:text-[1.02rem] sm:leading-7 lg:max-w-4xl lg:text-[1.08rem] lg:leading-[1.42]">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
