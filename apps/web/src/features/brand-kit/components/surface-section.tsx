import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { KitDemo, KitSection, TokenChip } from "./kit-primitives";

/**
 * Spacing / radius / shadow section — the physical system: the radius
 * ladder, the two shared card shadows + the azul focus elevation, and the
 * 4px spacing rhythm, all shown visually with their utilities.
 */

const radiusSteps = [
  { label: "rounded-lg", note: "inputs, selects", className: "rounded-lg" },
  { label: "rounded-xl", note: "icon tiles, demo wells", className: "rounded-xl" },
  { label: "rounded-2xl", note: "cards, panels", className: "rounded-2xl" },
  {
    label: "rounded-[28px]",
    note: "dialogs",
    className: "rounded-[28px]",
  },
  {
    label: "rounded-full",
    note: "buttons, pills, badges",
    className: "rounded-full",
  },
] as const;

const spacingSteps = [
  { token: "1", rem: "0.25rem", className: "w-1" },
  { token: "2", rem: "0.5rem", className: "w-2" },
  { token: "3", rem: "0.75rem", className: "w-3" },
  { token: "4", rem: "1rem", className: "w-4" },
  { token: "5", rem: "1.25rem", className: "w-5" },
  { token: "6", rem: "1.5rem", className: "w-6" },
  { token: "8", rem: "2rem", className: "w-8" },
  { token: "10", rem: "2.5rem", className: "w-10" },
] as const;

export function SurfaceSection() {
  return (
    <KitSection
      description="Soft geometry on a 4px rhythm: large radii, hairline borders and low-opacity ink-tinted shadows with a long negative spread. Elevation is always calm — never heavy or saturated."
      id="surfaces"
      kicker="Space & depth"
      title="Spacing, radius & shadow"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <KitDemo
          caption="The pill (rounded-full / rounded-[200px]) is reserved for buttons, nav links and badges; rectangular surfaces step down from rounded-2xl."
          title="Radius scale"
        >
          <ul className="grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-5">
            {radiusSteps.map((step) => (
              <li
                className="flex flex-col items-center gap-2 text-center"
                key={step.label}
              >
                <div
                  className={cn(
                    "border-border bg-surface h-16 w-full border shadow-card-soft",
                    step.className,
                  )}
                />
                <TokenChip>{step.label}</TokenChip>
                <span className="text-muted-foreground text-[0.72rem]">
                  {step.note}
                </span>
              </li>
            ))}
          </ul>
        </KitDemo>

        <KitDemo
          caption="Sections stack with space-y-10; card grids use gap-4/gap-5; card padding is p-5 sm:p-6 (compact) or p-6 sm:p-8 lg:p-10 (roomy)."
          title="Spacing rhythm"
        >
          <div className="flex items-end gap-3 overflow-x-auto pb-1">
            {spacingSteps.map((step) => (
              <div
                className="flex shrink-0 flex-col items-center gap-2"
                key={step.token}
              >
                <div
                  className={cn("bg-primary/25 h-16 rounded-sm", step.className)}
                />
                <TokenChip>{step.token}</TokenChip>
                <span className="text-muted-foreground text-[0.7rem]">
                  {step.rem}
                </span>
              </div>
            ))}
          </div>
        </KitDemo>
      </div>

      <KitDemo
        caption="shadow-card is the hero-level elevation (the enrollment step card); shadow-card-soft suits grid/list cards. Focus never relies on shadow alone: inputs pair the azul ring with a faint focus elevation."
        title="Elevation & focus"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="border-border bg-surface flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border shadow-card">
            <TokenChip>shadow-card</TokenChip>
            <span className="text-muted-foreground text-[0.72rem]">
              hero-level cards
            </span>
          </div>
          <div className="border-border bg-surface flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border shadow-card-soft">
            <TokenChip>shadow-card-soft</TokenChip>
            <span className="text-muted-foreground text-[0.72rem]">
              grid / list cards
            </span>
          </div>
          <div className="flex h-32 flex-col justify-center gap-2">
            <Label htmlFor="brand-kit-focus-demo">Focus me</Label>
            <Input
              id="brand-kit-focus-demo"
              placeholder="Tab or click to see the azul ring"
            />
            <span className="text-muted-foreground text-[0.72rem]">
              ring-2 ring-ring/25 + soft azul elevation
            </span>
          </div>
        </div>
      </KitDemo>
    </KitSection>
  );
}
