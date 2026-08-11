"use client";

import { Button } from "@/components/ui/button";
import { openFeedbackWidget } from "@/features/feedback/lib/feedback-widget-events";

type SupportFeedbackButtonProps = Readonly<{
  className?: string;
  label: string;
}>;

/**
 * The support section's report card CTA. It opens the floating feedback
 * widget mounted in the root layout, so the card and the launcher lead to the
 * same panel. Split into its own client component to keep `SupportSection`
 * a server component.
 */
export function SupportFeedbackButton({
  className,
  label,
}: SupportFeedbackButtonProps) {
  return (
    <Button
      className={className}
      onClick={openFeedbackWidget}
      size="lg"
      type="button"
    >
      {label}
    </Button>
  );
}
