"use client";

import Link from "next/link";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ActiveConsent } from "@/types/enrollment";

type DashboardConsentDialogProps = Readonly<{
  activeConsents: readonly ActiveConsent[];
  errorMessage: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onToggleConsent: (consentId: string) => void;
  selectedConsentIds: readonly string[];
}>;

export function DashboardConsentDialog({
  activeConsents,
  errorMessage,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
  onToggleConsent,
  selectedConsentIds,
}: DashboardConsentDialogProps) {
  const hasAcceptedAllRequired = activeConsents.every(
    (consent) => !consent.required || selectedConsentIds.includes(consent.id),
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="max-h-[calc(100dvh-0.75rem)] w-[calc(100vw-0.75rem)] max-w-[44rem] gap-0 overflow-hidden rounded-[22px] p-0 sm:max-h-[calc(100dvh-2.5rem)] sm:w-[calc(100vw-3rem)] sm:rounded-[24px] lg:max-w-[46rem]"
        onEscapeKeyDown={(event) => {
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
      >
        <div className="border-border flex items-start justify-between gap-3 border-b px-4 py-3.5 sm:px-5 sm:py-3.5">
          <DialogHeader className="min-w-0 flex-1 gap-1">
            <DialogTitle className="text-muted-foreground text-[0.72rem] font-semibold tracking-[0.2em] uppercase sm:text-xs">
              ENROLLMENT CONSENT
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-6 sm:text-[0.92rem]">
              Please accept the required consents to continue.
            </DialogDescription>
          </DialogHeader>

          <button
            aria-label="Close consent dialog"
            className="border-border bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="button"
            onClick={onClose}
          >
            <X className="size-4 sm:size-[18px]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-4">
          {errorMessage ? (
            <div className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium">
              {errorMessage}
            </div>
          ) : null}

          <div
            className={cn("space-y-3 sm:space-y-3", errorMessage && "mt-3.5")}
          >
            {activeConsents.map((consent) => {
              const isSelected = selectedConsentIds.includes(consent.id);

              return (
                <label
                  key={consent.id}
                  className={cn(
                    "grid cursor-pointer grid-cols-[auto_1fr] gap-x-3 gap-y-2 rounded-xl border px-3.5 py-3.5 transition-colors sm:gap-x-3.5 sm:px-3.5 sm:py-3.5",
                    isSelected
                      ? "border-foreground bg-surface-muted"
                      : "border-border bg-surface",
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    className="mt-0.5 size-[18px]"
                    disabled={isSubmitting}
                    onCheckedChange={() => onToggleConsent(consent.id)}
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-foreground text-[1.05rem] font-semibold tracking-[-0.03em] sm:text-[1rem] lg:text-[1.05rem]">
                        {consent.title}
                        {consent.required ? (
                          <span className="text-foreground ml-1 text-sm">*</span>
                        ) : null}
                      </p>
                    </div>

                    <p className="text-muted-foreground mt-1.5 text-[0.95rem] leading-6 sm:mt-2 sm:text-[0.92rem] sm:leading-6 lg:text-[0.95rem]">
                      {consent.content}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <p className="text-muted-foreground mt-4 text-[0.88rem] leading-6 sm:text-[0.9rem]">
            Read all the{" "}
            <Link
              className="text-foreground font-medium underline underline-offset-2"
              href="/privacy-policy"
            >
              terms and conditions.
            </Link>
          </p>
        </div>

        <DialogFooter className="border-border bg-surface border-t px-4 py-4 sm:px-5 sm:py-4">
          <Button
            disabled={isSubmitting}
            size="sm"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            disabled={!hasAcceptedAllRequired}
            loading={isSubmitting}
            loadingText="Saving consent..."
            type="button"
            onClick={onSubmit}
          >
            Accept and Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
