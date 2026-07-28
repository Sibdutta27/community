"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { TERRITORIES, type Territory } from "../content/territories";

type TerritoryListProps = Readonly<{
  selectedSlug: string | null;
  highlightedSlug?: string | null;
  onSelect: (territory: Territory) => void;
  onHover?: (territory: Territory | null) => void;
  className?: string;
}>;

/**
 * Focusable territory list — the keyboard/touch peer of the SVG map.
 * Selection and hover stay in sync with the map both ways; unmapped
 * territories (no polygon yet) are selectable here even though they
 * cannot be reached on the map.
 */
export function TerritoryList({
  selectedSlug,
  highlightedSlug = null,
  onSelect,
  onHover,
  className,
}: TerritoryListProps) {
  const t = useTranslations("yucayekeMap");

  return (
    <ul
      aria-label={t("listAriaLabel")}
      className={cn(
        "flex max-h-72 flex-col gap-1 overflow-y-auto pr-1",
        className,
      )}
    >
      {TERRITORIES.map((territory) => {
        const isSelected = territory.slug === selectedSlug;
        const isOwn = territory.slug === highlightedSlug;

        return (
          <li key={territory.slug}>
            <button
              type="button"
              aria-current={isSelected || undefined}
              data-territory-slug={territory.slug}
              onClick={() => onSelect(territory)}
              onMouseEnter={() => onHover?.(territory)}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(territory)}
              onBlur={() => onHover?.(null)}
              className={cn(
                "focus-visible:ring-ring flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none",
                isSelected
                  ? "bg-secondary text-secondary-foreground"
                  : "text-foreground hover:bg-surface-muted",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold">
                  {territory.displayName}
                  {isOwn ? (
                    <span className="text-primary ml-1.5 text-[11px] font-semibold">
                      • {t("labels.yourTerritory")}
                    </span>
                  ) : null}
                </span>
                {territory.cacique ? (
                  <span
                    className={cn(
                      "block truncate text-[12px]",
                      isSelected
                        ? "text-secondary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {t("labels.cacique", { name: territory.cacique })}
                  </span>
                ) : null}
              </span>

              <span className="flex shrink-0 items-center gap-1.5">
                {territory.geometryKey === null ? (
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.03em] uppercase">
                    {t("labels.notMapped")}
                  </span>
                ) : null}
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 rounded-full",
                    territory.status === "confirmed"
                      ? "bg-accent"
                      : "border-muted-foreground border bg-transparent",
                  )}
                  title={t(`status.${territory.status}`)}
                />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
