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
        <div className="flex items-start justify-between gap-3 border-b border-[#dbe5df] px-4 py-3.5 sm:px-5 sm:py-3.5">
          <DialogHeader className="min-w-0 flex-1 gap-1">
            <DialogTitle className="text-[0.72rem] font-semibold tracking-[0.2em] text-[#1f8ca5] uppercase sm:text-xs">
              ENROLLMENT CONSENT
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-600 sm:text-[0.92rem]">
              Please accept the required consents to continue.
            </DialogDescription>
          </DialogHeader>

          <button
            aria-label="Close consent dialog"
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#d5e1da] bg-white text-slate-500 transition-colors hover:bg-[#f4faf8] hover:text-[#12393d] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="button"
            onClick={onClose}
          >
            <X className="size-4 sm:size-[18px]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-4">
          {errorMessage ? (
            <div className="rounded-[18px] border border-[#e7c6c2] bg-[#fff3f1] px-4 py-3 text-sm font-medium text-[#9e493f]">
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
                    "grid cursor-pointer grid-cols-[auto_1fr] gap-x-3 gap-y-2 rounded-[18px] border px-3.5 py-3.5 transition-colors sm:gap-x-3.5 sm:px-3.5 sm:py-3.5",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-[#d5e1da] bg-white",
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
                      <p className="text-[1.05rem] font-semibold tracking-[-0.03em] text-[#12393d] sm:text-[1rem] lg:text-[1.05rem]">
                        {consent.title}
                        {consent.required ? (
                          <span className="ml-1 text-sm text-[#c63d3d]">*</span>
                        ) : null}
                      </p>
                    </div>

                    <p className="mt-1.5 text-[0.95rem] leading-6 text-slate-600 sm:mt-2 sm:text-[0.92rem] sm:leading-6 lg:text-[0.95rem]">
                      {consent.content}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <p className="mt-4 text-[0.88rem] leading-6 text-slate-600 sm:text-[0.9rem]">
            Read all the{" "}
            <Link
              className="font-medium underline-offset-2 hover:underline"
              href="/privacy-policy"
              style={{ color: "#20A3B9" }}
            >
              terms and conditions.
            </Link>
          </p>
        </div>

        <DialogFooter className="border-t border-[#dbe5df] bg-white/88 px-4 py-4 sm:px-5 sm:py-4">
          <Button
            className="h-10 rounded-xl border-[#d5e1da] px-4 text-sm shadow-none"
            disabled={isSubmitting}
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            className="!bg-primary h-10 rounded-xl !bg-none px-4 text-sm !text-white shadow-[0_18px_34px_-22px_rgba(197,49,51,0.45)] hover:!bg-[#aa2a2d]"
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
