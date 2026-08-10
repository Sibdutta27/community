"use client";

import { useMemo } from "react";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BorikenMap } from "@/features/yucayeke/components/boriken-map";
import { resolveTerritory } from "@/features/yucayeke/content/territories";
import { buildTerritoryShapes } from "@/features/yucayeke/lib/geometry";
import { useYucayekeGeometryQuery } from "@/features/yucayeke/lib/yucayeke-map-queries";

/**
 * The reverse face of the tribal ID: the member's ancestral yucayeke.
 *
 * Chrome is deliberately identical to `tribal-identification-card` — same
 * gradient, glow, border, radius and padding — so flipping the deck reads
 * as turning one physical card over rather than swapping two components.
 * Keep the two in sync if either is restyled.
 */
const CARD_GRADIENT =
  "linear-gradient(150deg, #ffffff 0%, #eef5fc 55%, #e3eefb 100%)";
const CELESTE_GLOW =
  "radial-gradient(circle at 88% 12%, rgba(78,166,220,0.18), transparent 55%)";

type YucayekeIdentityCardProps = Readonly<{
  yucayekeValue: string | null;
  yucayekeUnknown: boolean;
}>;

export function YucayekeIdentityCard({
  yucayekeValue,
  yucayekeUnknown,
}: YucayekeIdentityCardProps) {
  const t = useTranslations("profile.yucayekeCard");
  const tMap = useTranslations("yucayekeMap");

  const geometryQuery = useYucayekeGeometryQuery();
  const territory = resolveTerritory(yucayekeValue);

  const shapes = useMemo(
    () => (geometryQuery.data ? buildTerritoryShapes(geometryQuery.data) : []),
    [geometryQuery.data],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div
        aria-label={t("cardAria")}
        role="group"
        // `aspect-[1.73]` is the tribal ID's own landscape ratio (400×231 at
        // the deck's desktop width). Pinning it here keeps the reverse face
        // the same physical card rather than letting the map stretch it into
        // a different shape.
        className="border-primary/15 shadow-card-soft relative isolate flex aspect-[1.73] flex-col overflow-hidden rounded-2xl border p-3.5"
        style={{ background: CARD_GRADIENT }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: CELESTE_GLOW }}
        />

        {/* Header mirrors the ID face: mark + wordmark left, status right. */}
        {/* Every row but the map is `shrink-0`: with the card's height now
            pinned, flex would otherwise squeeze the text to nothing and let
            the map ride up over it. The map alone absorbs the slack. */}
        <div className="flex shrink-0 items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="border-border relative size-8 shrink-0 overflow-hidden rounded-full border bg-white p-0.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_3px_8px_-5px_rgba(20,26,34,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                aria-hidden="true"
                className="size-full rounded-full object-cover"
                src="/images/logo.png"
              />
            </div>
            <div className="min-w-0">
              <p className="text-secondary-foreground text-[0.48rem] font-semibold tracking-[0.11em] uppercase">
                {t("eyebrow")}
              </p>
              <h2 className="font-display text-primary text-[0.85rem] leading-tight font-bold tracking-[-0.02em] uppercase">
                {t("title")}
              </h2>
            </div>
          </div>

          {territory ? (
            <span className="bg-secondary text-secondary-foreground inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.5rem] font-semibold tracking-[0.06em] uppercase">
              {territory.status === "confirmed" ? (
                <ShieldCheck aria-hidden="true" className="size-2.5" />
              ) : null}
              {tMap(`status.${territory.status}`)}
            </span>
          ) : null}
        </div>

        {territory ? (
          <>
            {/* Mirrors the ID's body: portrait left, identity fields right.
                The map takes the photo's slot, which gives it the full body
                height instead of a leftover strip. */}
            <div className="mt-3 flex min-h-0 flex-1 items-stretch gap-3.5">
              <div
                className="relative w-[46%] shrink-0"
                style={
                  {
                    // The page tokens (--surface-muted #eef2f6, --border
                    // #e2e6eb) are near-white and vanish on this card's white
                    // gradient. Scoped overrides give the unselected
                    // territories and their outlines real contrast; the azul
                    // highlight then reads strongly against them.
                    "--surface-muted": "#c2d5e8",
                    "--border": "#8ba9c6",
                  } as React.CSSProperties
                }
              >
                {/* Absolutely positioned so the SVG's intrinsic 2:1 height is
                  taken out of flow entirely — otherwise it re-inflates the
                  card. preserveAspectRatio letterboxes it in the space left
                  over. */}
                {shapes.length > 0 ? (
                  <BorikenMap
                    className="absolute inset-0 h-full w-full"
                    variant="preview"
                    shapes={shapes}
                    highlightedKey={territory.geometryKey}
                  />
                ) : (
                  <div className="bg-secondary/60 absolute inset-0 animate-pulse rounded-lg" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="text-foreground text-[1.3rem] leading-none font-semibold tracking-[-0.03em]">
                  {territory.displayName}
                </p>
                {territory.cacique ? (
                  <p className="text-muted-foreground mt-1.5 text-[0.58rem] font-semibold tracking-[0.12em] uppercase">
                    {t("caciqueLabel")} · {territory.cacique}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="border-border mt-2.5 flex shrink-0 items-end justify-between gap-2 border-t pt-2.5">
              <div className="min-w-0">
                <p className="text-muted-foreground text-[0.46rem] font-semibold tracking-[0.12em] uppercase">
                  {t("municipalitiesLabel")}
                </p>
                <p className="text-foreground truncate text-[0.72rem] font-semibold">
                  {territory.municipalities.join(" · ")}
                </p>
              </div>

              {territory.geometryKey === null ? (
                <span className="border-border bg-surface text-muted-foreground shrink-0 rounded-full border px-2 py-0.5 text-[0.5rem] font-semibold tracking-[0.06em] uppercase">
                  {t("notMapped")}
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-start justify-center gap-2 py-6">
            <p className="text-foreground text-[0.88rem] leading-5 font-medium">
              {yucayekeUnknown ? t("unknown") : t("unassigned")}
            </p>
          </div>
        )}
      </div>

      {/* Actions sit below the card, matching the ID face's button row. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {territory ? (
          <>
            <Button asChild size="sm">
              <Link href="/yucayeke">{t("explore")}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/yucayeke/${territory.slug}`}>
                {t("learnMore", { name: territory.displayName })}
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="sm">
              <Link href="/yucayeke">{t("explore")}</Link>
            </Button>
            {!yucayekeUnknown ? (
              <Button asChild size="sm" variant="outline">
                <Link href="/enrollment">{t("unassignedCta")}</Link>
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
