/**
 * The lifecycle a program moves through, in the order staff work it.
 *
 * These mirror the `ServiceStatus` enum in the Prisma schema — the API is the
 * source of truth, this is only the human wording.
 *
 * The distinction matters at the front desk: only an ACTIVE program accepts
 * registrations (the member API refuses the rest), so "is this one live?" has
 * to be answerable at a glance rather than buried in an edit form.
 */
export const SERVICE_STATUSES = [
  {
    value: "ACTIVE",
    label: "Active",
    help: "Listed to members and accepting registrations",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
    help: "Paused — not accepting registrations",
  },
  {
    value: "CLOSED",
    label: "Closed",
    help: "Finished; kept for the record",
  },
];

/**
 * Human label for a status, falling back to the raw value so an unknown state
 * shows up instead of disappearing.
 */
export function serviceStatusLabel(status) {
  return (
    SERVICE_STATUSES.find((entry) => entry.value === status)?.label ||
    status ||
    "Unknown"
  );
}

/**
 * MUI Chip colour for a status. Green for live, amber for paused, plain grey
 * for closed — red stays reserved for destructive actions.
 */
export function serviceStatusColor(status) {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "INACTIVE":
      return "warning";

    default:
      return "default";
  }
}
