"use client";

import { useSearchParams } from "next/navigation";

/**
 * Confirmation banner shown when the member lands on the dashboard via
 * "Save & finish later" (`?draftSaved=1`) on an enrollment step — the saved
 * partial draft will prefill the step when they return.
 */
export function DashboardDraftSavedNotice() {
  const searchParams = useSearchParams();

  if (searchParams.get("draftSaved") !== "1") {
    return null;
  }

  return (
    <div
      className="border-border bg-surface-muted text-foreground rounded-xl border px-4 py-3 text-sm font-medium sm:px-5"
      role="status"
    >
      Your progress has been saved — you can finish later.
    </div>
  );
}
