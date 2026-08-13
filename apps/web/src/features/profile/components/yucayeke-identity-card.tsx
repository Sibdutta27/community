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

import { CARD_GRADIENT, CELESTE_GLOW } from "./tribal-id-card-face";

/**
 * The reverse face of the tribal ID: the member's ancestral yucayeke.
 *
 * Chrome is deliberately identical to the ID face — same gradient, glow,
 * border, radius and padding — so flipping the deck reads as turning one
 * physical card over rather than swapping two components. The gradient and
 * glow are imported rather than restated so the two cannot drift; the border,
 * radius and padding classes below still have to be kept in step by hand.
 */

type YucayekeIdentityCardProps = Readonly<{
  yucayekeValue: string | null;
  yucayekeUnknown: boolean;
  /**
   * Unissued presentation, for the marketing hero: the island drawn whole with
   * no territory singled out, "Your Yukayeke" where a name would be, and a
   * ruled blank for the municipalities — the reverse of the blank ID face it
   * spins opposite. No status pill (nothing is being attested) and no action
   * row: those buttons would break the height the two faces share in one grid
   * cell, and they would be links inside an `inert`, continuously rotating
   * element.
   */
  sample?: boolean;
}>;

export function YucayekeIdentityCard({
  yucayekeValue,
  yucayekeUnknown,
  sample = false,
}: YucayekeIdentityCardProps) {
  const t = useTranslations("profile.yucayekeCard");
  const media = useTranslations("media");
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
              {/* Plain <img>, not next/image: this subtree is rasterized by
                  html-to-image for the PNG/PDF export. If the seal is ever
                  reassigned to an uploaded image, the public bucket must send
                  CORS headers or the export cannot inline it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                aria-hidden="true"
                className="size-full rounded-full object-cover"
                src={media("brand.logo")}
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

          {territory && !sample ? (
            <span className="bg-secondary text-secondary-foreground inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.5rem] font-semibold tracking-[0.06em] uppercase">
              {territory.status === "confirmed" ? (
                <ShieldCheck aria-hidden="true" className="size-2.5" />
              ) : null}
              {tMap(`status.${territory.status}`)}
            </span>
          ) : null}
        </div>

        {sample || territory ? (
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
                    // Whole island, nothing singled out: the sample card is
                    // nobody's, so highlighting a territory would claim one.
                    highlightedKey={sample ? null : territory!.geometryKey}
                  />
                ) : (
                  <div className="bg-secondary/60 absolute inset-0 animate-pulse rounded-lg" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="text-foreground text-[1.3rem] leading-none font-semibold tracking-[-0.03em]">
                  {sample ? t("sampleName") : territory!.displayName}
                </p>
                {!sample && territory!.cacique ? (
                  <p className="text-muted-foreground mt-1.5 text-[0.58rem] font-semibold tracking-[0.12em] uppercase">
                    {t("caciqueLabel")} · {territory!.cacique}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="border-border mt-2.5 flex shrink-0 items-end justify-between gap-2 border-t pt-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-[0.46rem] font-semibold tracking-[0.12em] uppercase">
                  {t("municipalitiesLabel")}
                </p>
                {sample ? (
                  // Matches the ruled blanks on the ID face — the reverse of an
                  // unissued card is unissued too.
                  <span
                    aria-hidden="true"
                    className="bg-primary/12 mt-1 block h-[0.5rem] w-[62%] rounded-full"
                  />
                ) : (
                  <p className="text-foreground truncate text-[0.72rem] font-semibold">
                    {territory!.municipalities.join(" · ")}
                  </p>
                )}
              </div>

              {!sample && territory!.geometryKey === null ? (
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
      {sample ? null : (
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
      )}
    </div>
  );
}
