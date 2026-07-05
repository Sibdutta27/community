import { Check, X } from "lucide-react";

import { KitSection } from "./kit-primitives";

/**
 * Do / Don't section — the concise brand rules distilled from
 * docs/design-system.md.
 */

const dos: readonly string[] = [
  "Use deep azul (bg-primary, ring-ring) for every action, active state, link and focus ring.",
  "Reserve flag red: bg-emphasis ONLY for the Enroll Today / hero CTA; destructive ONLY for errors.",
  "Use celeste (bg-secondary / bg-accent) for tasteful highlights and supporting fills — always with dark ink-azul text.",
  "Keep icon tiles neutral — ink bg-foreground squares/circles with white glyphs.",
  "Meet WCAG AA on every text pairing; keep a visible azul focus ring on all interactives.",
  "Respect prefers-reduced-motion — the shared wrappers and motion-reduce utilities already do.",
  "Set everything in Inter via the existing font exports; compose classes with cn() and CVA variants.",
];

const donts: readonly string[] = [
  "Don't hardcode hex/rgb values — every color comes from a semantic token in tokens.css.",
  "Don't put small or body text on celeste or bright red — they're fill/accent hues only.",
  "Don't use star yellow in the UI — it belongs to logo artwork alone.",
  "Don't scatter red beyond the one emphasis CTA per view — the palette is 60-30-10.",
  "Don't introduce colored or gradient icon tiles, heavy shadows or saturated panels.",
  "Don't add new fonts or new one-off animations — reuse the Inter scale and motion presets.",
  "Don't import the admin panel's dark MUI theme (or vice-versa) — the two design systems never mix.",
];

export function GuidelinesSection() {
  return (
    <KitSection
      description="The rules that keep every new screen on-brand. When in doubt: calm, azul, AA."
      id="guidelines"
      kicker="Rules"
      title="Do & Don't"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border-border bg-surface rounded-xl border p-6">
          <h3 className="text-primary text-[1.05rem] font-semibold tracking-tight">
            Do
          </h3>
          <ul className="mt-4 list-none space-y-3 p-0">
            {dos.map((rule) => (
              <li className="flex gap-2.5 text-sm leading-6" key={rule}>
                <Check
                  aria-hidden="true"
                  className="text-primary mt-1 size-4 shrink-0 stroke-[2.5]"
                />
                <span className="text-foreground">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border bg-surface rounded-xl border p-6">
          <h3 className="text-destructive text-[1.05rem] font-semibold tracking-tight">
            Don&apos;t
          </h3>
          <ul className="mt-4 list-none space-y-3 p-0">
            {donts.map((rule) => (
              <li className="flex gap-2.5 text-sm leading-6" key={rule}>
                <X
                  aria-hidden="true"
                  className="text-destructive mt-1 size-4 shrink-0 stroke-[2.5]"
                />
                <span className="text-foreground">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </KitSection>
  );
}
