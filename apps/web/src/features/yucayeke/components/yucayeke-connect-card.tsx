import Image from "next/image";
import Link from "next/link";

import type { YucayekeConnectionLink } from "@/features/yucayeke/constants/yucayeke-content";

/**
 * Whole-card link on the ink (`bg-foreground`) connect band. The focus ring
 * uses the celeste `accent` token (the azul family) because the deep-azul
 * `ring` token is invisible against the dark ink background; the offset
 * matches the band so the ring reads as a clean halo.
 */
export function YucayekeConnectCard({
  link,
}: Readonly<{ link: YucayekeConnectionLink }>) {
  return (
    <Link
      className="group border-background/15 bg-background/10 text-background hover:bg-background/15 focus-visible:ring-accent focus-visible:ring-offset-foreground flex h-full min-h-[11.5rem] flex-col items-center rounded-2xl border p-5 text-center backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transform-none sm:min-h-[12rem] sm:p-6"
      href={link.href}
    >
      <div className="bg-background/15 flex size-12 items-center justify-center rounded-xl">
        <Image
          alt=""
          aria-hidden="true"
          className="h-[1.375rem] w-[1.375rem] object-contain"
          height={22}
          src={link.iconSrc}
          width={22}
        />
      </div>

      <h3 className="text-background mt-4 text-[1.15rem] leading-tight font-semibold tracking-tight sm:text-[1.25rem]">
        {link.title}
      </h3>

      <p className="text-background/75 mt-3 max-w-[22rem] text-[0.9rem] leading-6 sm:text-[0.94rem]">
        {link.description}
      </p>

      <span className="text-background mt-auto pt-4 text-[0.95rem] font-semibold tracking-tight underline-offset-4 transition-colors duration-200 group-hover:underline">
        {link.ctaLabel}
      </span>
    </Link>
  );
}
