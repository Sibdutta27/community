"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { MAP_VIEWBOX, type TerritoryShape } from "../lib/geometry";

type BorikenMapProps = Readonly<{
  shapes: readonly TerritoryShape[];
  highlightedKey?: string | null;
  selectedKey?: string | null;
  hoveredKey?: string | null;
  onSelect?: (geometryKey: string) => void;
  onHover?: (geometryKey: string | null) => void;
  variant?: "interactive" | "preview";
  labels?: boolean;
  className?: string;
}>;

/**
 * Token-colored SVG silhouette of Borikén split into yucayeke territories.
 * Every fill/stroke derives from the azul design tokens; oral-tradition
 * territories carry a dashed border as the non-color status cue. The
 * `preview` variant is decorative (profile card) — no focus, no handlers.
 */
export function BorikenMap({
  shapes,
  highlightedKey = null,
  selectedKey = null,
  hoveredKey = null,
  onSelect,
  onHover,
  variant = "interactive",
  labels = false,
  className,
}: BorikenMapProps) {
  const t = useTranslations("yucayekeMap");
  const isInteractive = variant === "interactive";

  return (
    <svg
      viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
      role={isInteractive ? "group" : undefined}
      aria-label={isInteractive ? t("mapAriaLabel") : undefined}
      aria-hidden={isInteractive ? undefined : true}
      className={cn("block h-auto w-full", className)}
    >
      {shapes.map((shape) => {
        const isHighlighted = shape.geometryKey === highlightedKey;
        const isSelected = shape.geometryKey === selectedKey;
        const isHovered = shape.geometryKey === hoveredKey;
        const isOralTradition = shape.territory?.status === "oralTradition";

        const fill = isHighlighted
          ? "var(--primary)"
          : isSelected || isHovered
            ? "var(--secondary)"
            : "var(--surface-muted)";
        const stroke = isHighlighted
          ? "var(--primary)"
          : isSelected || isHovered
            ? "var(--accent)"
            : "var(--border)";

        const territoryLabel =
          shape.territory?.displayName ?? shape.geometryKey;
        const ariaLabel = shape.territory?.cacique
          ? `${territoryLabel} — ${t("labels.cacique", { name: shape.territory.cacique })}`
          : territoryLabel;

        return (
          <path
            key={shape.geometryKey}
            d={shape.d}
            fill={fill}
            stroke={stroke}
            strokeWidth={isSelected || isHighlighted ? 1.6 : 1}
            strokeDasharray={isOralTradition ? "4 3" : undefined}
            fillRule="evenodd"
            data-territory={shape.geometryKey}
            data-highlighted={isHighlighted || undefined}
            data-selected={isSelected || undefined}
            className={cn(
              "transition-[fill,stroke] duration-150",
              isInteractive &&
                // `outline-none` must apply to plain :focus too, not only
                // :focus-visible — a mouse click sets :focus without
                // :focus-visible, and the UA then paints its default
                // rectangle around the path's bounding box. That black box
                // is what reads as "a square border round the territory".
                // Keyboard focus stays visible via the stroke below.
                "cursor-pointer outline-none focus:outline-none focus-visible:stroke-[var(--ring)] focus-visible:stroke-2 focus-visible:outline-none",
            )}
            {...(isInteractive
              ? {
                  tabIndex: 0,
                  role: "button",
                  "aria-label": ariaLabel,
                  "aria-pressed": isSelected,
                  onClick: () => onSelect?.(shape.geometryKey),
                  onKeyDown: (event: React.KeyboardEvent<SVGPathElement>) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect?.(shape.geometryKey);
                    }
                  },
                  onMouseEnter: () => onHover?.(shape.geometryKey),
                  onMouseLeave: () => onHover?.(null),
                  onFocus: () => onHover?.(shape.geometryKey),
                  onBlur: () => onHover?.(null),
                }
              : undefined)}
          />
        );
      })}

      {labels
        ? shapes.map((shape) => (
            <text
              key={`label-${shape.geometryKey}`}
              x={shape.labelPoint[0]}
              y={shape.labelPoint[1]}
              textAnchor="middle"
              className="pointer-events-none select-none"
              fill={
                shape.geometryKey === highlightedKey
                  ? "var(--primary-foreground)"
                  : "var(--muted-foreground)"
              }
              fontSize={11}
              fontWeight={600}
            >
              {shape.territory?.displayName ?? shape.geometryKey}
            </text>
          ))
        : null}
    </svg>
  );
}
