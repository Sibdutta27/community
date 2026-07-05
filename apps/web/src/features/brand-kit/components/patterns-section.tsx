import { CalendarDays, Feather, Users } from "lucide-react";

import {
  desktopNavLinkClass,
  navbarPillClass,
} from "@/components/layout/navbar-chrome";
import { SectionHeader, SurfaceCard } from "@/components/shared/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnrollmentStepper } from "@/features/enrollment/components/enrollment-stepper";

import { KitDemo, KitSection } from "./kit-primitives";

/**
 * Patterns section — the signature compositions that make the app read as
 * one product: the shared surface-card + section-header primitives, the
 * enrollment folder-tab stepper merged into its elevated card, and the
 * floating frosted-glass navbar pill (static examples).
 */

const demoStepState = {
  "1": true,
  "2": true,
  "3": false,
  "4": false,
  "5": false,
} as const;

const demoNavLinks = [
  { label: "Home", isActive: true },
  { label: "Services", isActive: false },
  { label: "Community", isActive: false },
  { label: "About", isActive: false },
] as const;

export function PatternsSection() {
  return (
    <KitSection
      description="Reusable compositions built from the primitives — reach for these before inventing a new layout."
      id="patterns"
      kicker="Compositions"
      title="Patterns"
    >
      <div className="space-y-8">
        <KitDemo
          caption="components/shared/surface-card.tsx — the elevated white card promoted to a primitive. tone=soft (shadow-card-soft) for grid cards, tone=elevated (shadow-card) for hero panels; the header pairs a neutral icon tile with a title + muted description (pass headingAs to keep the outline logical)."
          title="SurfaceCard & SectionHeader"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <SurfaceCard tone="soft">
              <SectionHeader
                description="Soft tone for grid and list cards — quiet elevation."
                headingAs="h3"
                icon={Users}
                title="Community programs"
              />
              <p className="text-muted-foreground mt-4 text-sm leading-6">
                Card body copy sits on bg-surface with a hairline border and
                generous whitespace.
              </p>
            </SurfaceCard>

            <SurfaceCard padding="roomy" tone="elevated">
              <SectionHeader
                action={
                  <Button size="sm" variant="outline">
                    View all
                  </Button>
                }
                description="Elevated tone for hero-level panels — the enrollment step-card look."
                headingAs="h3"
                icon={CalendarDays}
                title="Upcoming events"
              />
            </SurfaceCard>
          </div>
        </KitDemo>

        <KitDemo
          caption="The enrollment shell: manila folder-tabs attached to the elevated step card. The active tab shares the card's surface with a transparent bottom edge and an azul top accent + number badge; completed tabs get a celeste-tint check; upcoming tabs sit recessed. Every tab is a link (free jump-nav) and the row scrolls on mobile."
          contentClassName="overflow-x-auto"
          title="Folder-tab stepper & elevated step card"
        >
          <div className="min-w-[36rem]">
            <EnrollmentStepper currentStep={3} stepState={demoStepState} />
            <div className="border-border bg-surface relative rounded-b-2xl rounded-tr-2xl border p-6 shadow-card sm:p-8">
              <div className="max-w-3xl">
                <p className="text-foreground text-[1.55rem] leading-tight font-semibold tracking-tight">
                  3. Add your paternal kinship information
                </p>
                <p className="text-muted-foreground mt-2 text-[0.92rem] leading-6">
                  Document your father and paternal grandparents.
                </p>
              </div>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand-kit-step-first">
                    Father&apos;s first name
                  </Label>
                  <Input
                    id="brand-kit-step-first"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-kit-step-last">
                    Father&apos;s last name
                  </Label>
                  <Input
                    id="brand-kit-step-last"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="border-border bg-surface-muted/50 -mx-6 -mb-6 mt-8 flex flex-col-reverse gap-3 rounded-b-[calc(1rem-1px)] border-t px-6 py-5 sm:-mx-8 sm:-mb-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <Button size="lg" variant="outline">
                  Back
                </Button>
                <Button size="lg">Save & Continue</Button>
              </div>
            </div>
          </div>
        </KitDemo>

        <KitDemo
          caption="components/layout/navbar-chrome.ts — the floating frosted-glass pill both navbars share: translucent bg-surface with backdrop blur, hairline border, inner top highlight and layered ink shadow. The active link is a quiet azul pill (bg-primary/8 text-primary); red belongs to the Enroll CTA alone."
          title="Navbar pill"
        >
          <nav aria-label="Example site navigation" className={navbarPillClass}>
            <div className="flex items-center gap-2.5">
              <span className="bg-foreground flex size-9 items-center justify-center rounded-full">
                <Feather
                  aria-hidden="true"
                  className="text-primary-foreground size-4"
                />
              </span>
              <span className="text-foreground hidden text-sm font-semibold tracking-tight sm:block">
                Higüayagua
              </span>
            </div>
            <div className="hidden items-center gap-1 md:flex">
              {demoNavLinks.map((link) => (
                <span
                  className={desktopNavLinkClass(link.isActive)}
                  key={link.label}
                >
                  {link.label}
                </span>
              ))}
            </div>
            <Button size="sm" variant="emphasis">
              Enroll Today
            </Button>
          </nav>
        </KitDemo>
      </div>
    </KitSection>
  );
}
