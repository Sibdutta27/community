import { KitSection, TokenChip } from "./kit-primitives";

/**
 * Typography section — the Inter scale as it's actually used across the app
 * (hero display, page/section/card headings, body, small, label, kicker),
 * each rendered live with its size/weight/tracking and utility classes.
 */

type TypeSpecimen = Readonly<{
  className: string;
  meta: string;
  name: string;
  sample: string;
  utilities: string;
}>;

const specimens: readonly TypeSpecimen[] = [
  {
    name: "Display",
    meta: "Inter 600 · 2.25–3rem · tracking -0.03em (globals h1/h2)",
    utilities: "text-4xl sm:text-5xl font-semibold tracking-tight",
    className:
      "text-foreground text-4xl font-semibold tracking-tight sm:text-5xl",
    sample: "Higüayagua Taíno Community",
  },
  {
    name: "Heading 1 — page title",
    meta: "Inter 600 · 1.55–1.9rem · tight leading",
    utilities:
      "text-[1.55rem] sm:text-[1.9rem] font-semibold tracking-tight leading-tight",
    className:
      "text-foreground text-[1.55rem] leading-tight font-semibold tracking-tight sm:text-[1.9rem]",
    sample: "1. Add your demographics",
  },
  {
    name: "Heading 2 — section",
    meta: "Inter 600 · 1.5rem",
    utilities: "text-2xl font-semibold tracking-tight",
    className: "text-foreground text-2xl font-semibold tracking-tight",
    sample: "Enrollment & citizenship",
  },
  {
    name: "Heading 3 — card title",
    meta: "Inter 600 · 1.05–1.15rem",
    utilities:
      "text-[1.05rem] sm:text-[1.15rem] font-semibold tracking-tight leading-tight",
    className:
      "text-foreground text-[1.05rem] leading-tight font-semibold tracking-tight sm:text-[1.15rem]",
    sample: "Basic information",
  },
  {
    name: "Body",
    meta: "Inter 400 · 1rem · leading 1.75",
    utilities: "text-base leading-7 text-foreground",
    className: "text-foreground text-base leading-7",
    sample:
      "A community of Taíno descendants preserving maternal lineage, culture and kinship for the next generation.",
  },
  {
    name: "Small / muted",
    meta: "Inter 400 · 0.875rem · muted ink",
    utilities: "text-sm leading-6 text-muted-foreground",
    className: "text-muted-foreground text-sm leading-6",
    sample:
      "Provide your legal name exactly as it appears on your government-issued identification.",
  },
  {
    name: "Label",
    meta: "Inter 500 · 0.875rem · tracking -0.01em (ui/label)",
    utilities: "text-sm font-medium tracking-[-0.01em] leading-snug",
    className:
      "text-foreground text-sm leading-snug font-medium tracking-[-0.01em]",
    sample: "First name *",
  },
  {
    name: "Kicker / eyebrow",
    meta: "Inter 600 · 0.6rem · uppercase, tracking 0.3em",
    utilities:
      "text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground",
    className:
      "text-muted-foreground text-[0.6rem] font-semibold tracking-[0.3em] uppercase",
    sample: "Tribal citizenship",
  },
];

export function TypographySection() {
  return (
    <KitSection
      description="One typeface: Inter, for display and body alike. globals.css gives h1/h2 the display weight (700) and -0.03em tracking; utilities refine each role. The legacy cinzel/montserrat/lato font exports all resolve to Inter — never add another Google font."
      id="typography"
      kicker="Type"
      title="Typography"
    >
      <ul className="divide-border border-border bg-surface list-none divide-y rounded-xl border p-0">
        {specimens.map((specimen) => (
          <li
            className="grid gap-3 p-5 sm:grid-cols-[14rem_1fr] sm:items-center sm:gap-6"
            key={specimen.name}
          >
            <div className="space-y-1.5">
              <p className="text-foreground text-sm font-semibold">
                {specimen.name}
              </p>
              <p className="text-muted-foreground text-[0.72rem] leading-5">
                {specimen.meta}
              </p>
              <TokenChip>{specimen.utilities}</TokenChip>
            </div>
            <p className={specimen.className}>{specimen.sample}</p>
          </li>
        ))}
      </ul>
    </KitSection>
  );
}
