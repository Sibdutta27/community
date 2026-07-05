import { Check, Info, X } from "lucide-react";

import {
  contrastRatio,
  formatContrastRatio,
  meetsContrastTarget,
} from "@/features/brand-kit/lib/contrast";
import {
  paletteGroups,
  paletteNotes,
  type PaletteEntry,
} from "@/features/brand-kit/lib/palette";
import { cn } from "@/lib/utils";

import { KitSection, TokenChip } from "./kit-primitives";

/**
 * Palette section — one swatch card per semantic token, grouped by role,
 * with the measured WCAG contrast ratio against the token's typical partner
 * and an AA pass/fail badge. Ratios are computed from the documented hex
 * values (see `lib/palette.ts`); swatches are painted with token utilities.
 */

function ContrastBadge({ entry }: Readonly<{ entry: PaletteEntry }>) {
  const ratio = contrastRatio(entry.hex, entry.pairedWith.hex);
  const label = formatContrastRatio(ratio);

  if (entry.assessment === "decorative") {
    return (
      <span className="border-border bg-surface-muted text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold">
        <Info aria-hidden="true" className="size-3" />
        {label} · decorative
      </span>
    );
  }

  const passes = meetsContrastTarget(ratio, entry.assessment);
  const target = entry.assessment === "aa-ui" ? "AA (UI)" : "AA";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold",
        passes
          ? "border-secondary bg-secondary text-secondary-foreground"
          : "border-destructive/40 bg-destructive/10 text-destructive",
      )}
    >
      {passes ? (
        <Check aria-hidden="true" className="size-3 stroke-[3]" />
      ) : (
        <X aria-hidden="true" className="size-3 stroke-[3]" />
      )}
      {label} {target} {passes ? "✓" : "✗"}
    </span>
  );
}

function SwatchCard({ entry }: Readonly<{ entry: PaletteEntry }>) {
  return (
    <li className="border-border bg-surface flex flex-col overflow-hidden rounded-xl border">
      <div
        className={cn(
          "border-border flex h-20 items-end justify-between border-b px-4 pb-2.5",
          entry.swatchClassName,
        )}
      >
        <span
          className={cn(
            "text-lg font-semibold tracking-tight",
            entry.swatchTextClassName,
          )}
          aria-hidden="true"
        >
          Aa
        </span>
        <span
          className={cn("font-mono text-[0.72rem]", entry.swatchTextClassName)}
        >
          {entry.hex}
        </span>
      </div>

      <div className="flex grow flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <TokenChip>{entry.token}</TokenChip>
          <ContrastBadge entry={entry} />
        </div>
        <p className="text-foreground text-[0.82rem] leading-5 font-medium">
          {entry.role}
        </p>
        <p className="text-muted-foreground mt-auto text-[0.75rem] leading-5">
          Measured against {entry.pairedWith.label}.
        </p>
      </div>
    </li>
  );
}

export function PaletteSection() {
  return (
    <KitSection
      description="The azul-led Puerto-Rican-flag palette on a 60-30-10 rhythm: a cool near-white base (60), deep azul + celeste for every interaction (30), and flag red held back for the one emphasis moment (10). Every pairing below is measured against WCAG AA."
      id="palette"
      kicker="Color"
      title="Palette"
    >
      <div className="space-y-10">
        {paletteGroups.map((group) => (
          <div className="space-y-4" key={group.id}>
            <div className="max-w-3xl space-y-1">
              <h3 className="text-foreground text-[1.05rem] leading-tight font-semibold tracking-tight">
                {group.title}
              </h3>
              <p className="text-muted-foreground text-[0.82rem] leading-5">
                {group.description}
              </p>
            </div>

            <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {group.entries.map((entry) => (
                <SwatchCard entry={entry} key={entry.token} />
              ))}
            </ul>
          </div>
        ))}

        <ul className="border-border bg-surface-muted/60 text-muted-foreground list-none space-y-2 rounded-xl border p-5 text-[0.82rem] leading-6">
          {paletteNotes.map((note) => (
            <li className="flex gap-2" key={note}>
              <Info
                aria-hidden="true"
                className="text-primary mt-1 size-3.5 shrink-0"
              />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </KitSection>
  );
}
