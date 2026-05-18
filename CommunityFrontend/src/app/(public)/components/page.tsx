import Link from "next/link";
import type { HTMLInputTypeAttribute } from "react";

import {
  ArrowRight,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EnrollmentFormSection } from "@/features/enrollment/components/enrollment-form-section";

function ShowcaseField({
  label,
  placeholder,
  type = "text",
  required = false,
}: Readonly<{
  label: string;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
}>) {
  return (
    <label className="block" htmlFor={label}>
      <span className="mb-2 block text-[0.82rem] font-medium tracking-[-0.02em] text-[#5f666a]">
        {label}
        {required ? <span className="text-[#d65a52]"> *</span> : null}
      </span>
      <input
        className="text-foreground flex h-11 w-full rounded-xl border border-black/5 bg-[#F2F2F2] px-4 text-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none placeholder:text-[#9ca3a7] sm:h-12"
        defaultValue=""
        id={label}
        placeholder={placeholder}
        readOnly
        type={type}
      />
    </label>
  );
}

export default function ComponentsPage() {
  return (
    <main className="bg-background min-h-screen px-6 pt-24 pb-16 sm:pt-28">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-3 text-center">
          <span className="border-border bg-surface text-muted-foreground inline-flex rounded-full border px-4 py-1 text-sm font-medium">
            Component Showcase
          </span>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
            Button component
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-7 sm:text-lg">
            Use this page to preview reusable UI components while building the
            design system.
          </p>
        </div>

        <section className="border-border bg-surface space-y-6 rounded-[2rem] border p-6 shadow-[0_28px_70px_-50px_rgba(16,47,52,0.45)] sm:p-8">
          <div className="space-y-1">
            <h2 className="text-foreground text-2xl font-semibold">Variants</h2>
            <p className="text-muted-foreground text-sm">
              Primary, outline, secondary, accent, and ghost styles.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </section>

        <section className="border-border bg-surface space-y-6 rounded-[2rem] border p-6 shadow-[0_28px_70px_-50px_rgba(16,47,52,0.45)] sm:p-8">
          <div className="space-y-1">
            <h2 className="text-foreground text-2xl font-semibold">Sizes</h2>
            <p className="text-muted-foreground text-sm">
              Common button sizes for different contexts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
            <Button size="icon" aria-label="Add item">
              <Plus />
            </Button>
          </div>
        </section>

        <section className="border-border bg-surface space-y-6 rounded-[2rem] border p-6 shadow-[0_28px_70px_-50px_rgba(16,47,52,0.45)] sm:p-8">
          <div className="space-y-1">
            <h2 className="text-foreground text-2xl font-semibold">
              Icon support
            </h2>
            <p className="text-muted-foreground text-sm">
              Left icon, right icon, links, loading state, and full-width usage.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Button size="xl" rightIcon={<ArrowRight />}>
              Apply Now
            </Button>
            <Button variant="accent" size="lg" leftIcon={<Phone />}>
              Call Support
            </Button>
            <Button variant="secondary" size="lg" leftIcon={<Mail />}>
              Email Us
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/services">
                View Services
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Button loading loadingText="Submitting..." size="lg" fullWidth>
              Submit Form
            </Button>
            <Button variant="outline" size="lg" fullWidth disabled>
              Disabled Action
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-foreground text-2xl font-semibold sm:text-3xl">
              Enrollment Form Section
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-6 sm:text-base">
              Preview of the reusable enrollment form section with configurable
              row layouts.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#e8e2c8] bg-[#fff9e8] p-4 shadow-[0_28px_70px_-50px_rgba(16,47,52,0.32)] sm:p-6 lg:p-8">
            <div className="space-y-5 sm:space-y-6">
              <EnrollmentFormSection
                description="Please provide your legal name as it appears on your government-issued identification."
                fieldsPerRow={[2, 2, 1]}
                footer="This name will be used in community communications and your member profile."
                icon={UserRound}
                title="Basic Information"
              >
                <ShowcaseField
                  label="First Name"
                  placeholder="Enter Your First Name"
                  required
                />
                <ShowcaseField
                  label="Middle Name"
                  placeholder="Enter Your Middle Name"
                />
                <ShowcaseField
                  label="Last Name"
                  placeholder="Enter Your Last Name"
                  required
                />
                <ShowcaseField
                  label="Maiden Name (if applicable)"
                  placeholder="Enter Your Maiden Name"
                />
                <ShowcaseField
                  label="Preferred Name"
                  placeholder="Enter Your Display Name"
                />
              </EnrollmentFormSection>

              <EnrollmentFormSection
                description="Your date and place of birth help us verify your identity and trace your lineage."
                fieldsPerRow={[2, 2, 1]}
                icon={CalendarDays}
                iconWrapperClassName="bg-[#c85d57] shadow-[0_14px_28px_-22px_rgba(200,93,87,0.52)]"
                title="Birth Information"
              >
                <ShowcaseField
                  label="Birth Date"
                  placeholder="09/09/2000"
                  required
                  type="date"
                />
                <ShowcaseField
                  label="Select Country"
                  placeholder="Select Birth Country"
                  required
                />
                <ShowcaseField
                  label="Birth City/Town"
                  placeholder="Enter City or Town"
                  required
                />
                <ShowcaseField
                  label="Specify Area or Landmark"
                  placeholder="Enter Your Specify Area or Landmark"
                />
                <ShowcaseField label="Pin Code" placeholder="Enter Pin code" />
              </EnrollmentFormSection>

              <EnrollmentFormSection
                description="This example shows a denser row configuration for future sections with more compact groups."
                fieldsPerRow={[3, 2]}
                icon={MapPin}
                iconWrapperClassName="bg-[#2e6d73] shadow-[0_14px_28px_-22px_rgba(46,109,115,0.5)]"
                title="Layout Variation"
              >
                <ShowcaseField label="City" placeholder="Enter city" />
                <ShowcaseField label="State" placeholder="Enter state" />
                <ShowcaseField label="Postal Code" placeholder="Enter code" />
                <ShowcaseField label="County" placeholder="Enter county" />
                <ShowcaseField label="Landmark" placeholder="Enter landmark" />
              </EnrollmentFormSection>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
