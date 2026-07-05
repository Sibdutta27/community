"use client";

import Link from "next/link";

import { ArrowRight, Mail, Phone, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { KitDemo, KitSection, TokenChip } from "./kit-primitives";

/**
 * Components catalog — every shared primitive in `components/ui/*` rendered
 * live with a short usage caption. Client component: the dialog, popover and
 * select demos are interactive.
 */
export function ComponentsSection() {
  return (
    <KitSection
      description="The shared primitives in components/ui/* — shadcn (new-york) restyled onto the azul tokens. Compose classes with cn(); express variants with class-variance-authority. Reach for these before building anything bespoke."
      id="components"
      kicker="Primitives"
      title="Components"
    >
      <div className="space-y-8">
        <KitDemo
          caption="primary is the workhorse CTA; emphasis (flag red) is ONLY the Enroll Today / hero CTA; secondary and accent are celeste fills for supporting actions and highlights; outline and ghost stay quiet."
          title="Button — variants"
        >
          <div className="flex flex-wrap items-center gap-4">
            <Button>Primary</Button>
            <Button variant="emphasis">Emphasis</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </KitDemo>

        <KitDemo
          caption="Sizes sm–xl plus a square icon size (always give icon buttons an aria-label). md is the default."
          title="Button — sizes"
        >
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
            <Button aria-label="Add item" size="icon">
              <Plus />
            </Button>
          </div>
        </KitDemo>

        <KitDemo
          caption="leftIcon/rightIcon slots, asChild for link CTAs, a built-in loading spinner (with optional loadingText), fullWidth for form footers, and the standard disabled treatment."
          title="Button — icons, loading & states"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Button rightIcon={<ArrowRight />} size="lg">
              Apply Now
            </Button>
            <Button leftIcon={<Phone />} size="lg" variant="accent">
              Call Support
            </Button>
            <Button leftIcon={<Mail />} size="lg" variant="secondary">
              Email Us
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/services">
                View Services
                <ArrowRight />
              </Link>
            </Button>
            <Button fullWidth loading loadingText="Submitting..." size="lg">
              Submit Form
            </Button>
            <Button disabled fullWidth size="lg" variant="outline">
              Disabled Action
            </Button>
          </div>
        </KitDemo>

        <div className="grid gap-8 lg:grid-cols-2">
          <KitDemo
            caption="Soft rounded-lg rectangles on bg-surface with hairline borders; focus is the azul ring + faint elevation. Labels are Inter 500 with -0.01em tracking."
            title="Input, Textarea & Label"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="brand-kit-input">First name</Label>
                <Input
                  id="brand-kit-input"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand-kit-textarea">Message</Label>
                <Textarea
                  id="brand-kit-textarea"
                  placeholder="How can the council help?"
                />
              </div>
            </div>
          </KitDemo>

          <KitDemo
            caption="The select trigger reuses the input base style; the dropdown sits on bg-surface with a soft ink shadow and an azul check indicator."
            title="Select"
          >
            <div className="space-y-2">
              <Label htmlFor="brand-kit-select">Birth country</Label>
              <Select>
                <SelectTrigger className="w-full" id="brand-kit-select">
                  <SelectValue placeholder="Select birth country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pr">Puerto Rico</SelectItem>
                  <SelectItem value="do">Dominican Republic</SelectItem>
                  <SelectItem value="cu">Cuba</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </KitDemo>

          <KitDemo
            caption="Checked states fill azul (data-[state=checked]:bg-primary); the radio dot is azul on a white well. Both take the azul focus ring with a 1px offset."
            title="Checkbox & Radio group"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Checkbox defaultChecked id="brand-kit-check-1" />
                  <Label htmlFor="brand-kit-check-1">
                    I accept the consent terms
                  </Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <Checkbox id="brand-kit-check-2" />
                  <Label htmlFor="brand-kit-check-2">
                    Email me community updates
                  </Label>
                </div>
              </div>
              <RadioGroup defaultValue="member">
                <div className="flex items-center gap-2.5">
                  <RadioGroupItem id="brand-kit-radio-1" value="member" />
                  <Label htmlFor="brand-kit-radio-1">Enrolled member</Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <RadioGroupItem id="brand-kit-radio-2" value="applicant" />
                  <Label htmlFor="brand-kit-radio-2">Applicant</Label>
                </div>
              </RadioGroup>
            </div>
          </KitDemo>

          <KitDemo
            caption="Ink scrim (bg-foreground/50) with blur; content on bg-surface at rounded-[28px] with the soft card shadow. Titles use the heading scale; actions sit in DialogFooter."
            title="Dialog"
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg p-6 sm:p-8">
                <DialogHeader>
                  <DialogTitle>Submit your application?</DialogTitle>
                  <DialogDescription>
                    Once submitted, the enrollment council will review your
                    application. You can still withdraw it while it is pending.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button>Submit application</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </KitDemo>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <KitDemo
            caption="react-day-picker restyled onto the tokens: azul selected day, muted chrome, ghost-pill nav buttons. Pairs with ui/popover for date fields."
            title="Calendar & Popover"
          >
            <div className="flex flex-wrap items-start gap-6">
              <div className="border-border bg-surface rounded-xl border shadow-card-soft">
                <Calendar />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open popover</Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 text-sm">
                  Floating panel on bg-surface with a soft ink shadow — used
                  for date pickers and quick actions.
                </PopoverContent>
              </Popover>
            </div>
          </KitDemo>

          <KitDemo
            caption="Forms compose react-hook-form + Zod through the Form* wrappers in ui/form: FormField > FormItem > FormLabel/FormControl/FormMessage. Errors always use the destructive token (text-destructive, border-destructive/50) — never raw red utilities."
            title="Form wrappers & error state"
          >
            <div className="max-w-sm space-y-2">
              <Label className="text-destructive" htmlFor="brand-kit-error">
                Email address
              </Label>
              <Input
                aria-describedby="brand-kit-error-message"
                aria-invalid
                className="border-destructive/50 focus-visible:ring-destructive/20 focus-visible:border-destructive"
                defaultValue="not-an-email"
                id="brand-kit-error"
              />
              <p
                className="text-destructive text-[0.8rem] font-medium"
                id="brand-kit-error-message"
              >
                Enter a valid email address.
              </p>
              <TokenChip>
                FormField → FormItem → FormLabel + FormControl + FormMessage
              </TokenChip>
            </div>
          </KitDemo>
        </div>
      </div>
    </KitSection>
  );
}
