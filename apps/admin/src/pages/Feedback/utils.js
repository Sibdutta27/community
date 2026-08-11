/**
 * The triage lanes, in the order staff work them.
 *
 * RESOLVED and DECLINED are both endings on purpose: "Declined" is for the
 * duplicates, questions and out-of-scope wishes that a beta queue fills up
 * with, so "Resolved" keeps meaning "we actually did something".
 */
export const FEEDBACK_STATUSES = [
  {
    value: "NEW",
    label: "New",
    help: "Nobody has looked at it yet",
  },
  {
    value: "IN_REVIEW",
    label: "In review",
    help: "Someone has picked it up",
  },
  {
    value: "RESOLVED",
    label: "Resolved",
    help: "Acted on",
  },
  {
    value: "DECLINED",
    label: "Declined",
    help: "Read, and closed without action",
  },
];

/**
 * Human label for a status, falling back to the raw value so an unknown lane
 * shows up instead of disappearing.
 */
export function feedbackStatusLabel(status) {
  return (
    FEEDBACK_STATUSES.find((entry) => entry.value === status)?.label ||
    status ||
    "Unknown"
  );
}

/**
 * MUI Chip colour for a status.
 */
export function feedbackStatusColor(status) {
  switch (status) {
    case "NEW":
      return "primary";

    case "IN_REVIEW":
      return "warning";

    case "RESOLVED":
      return "success";

    default:
      return "default";
  }
}

/**
 * Who sent it — the member's name, or a plain "Anonymous" so an empty cell is
 * never mistaken for missing data.
 */
export function feedbackSubmitterName(row) {
  if (!row?.submitter) {
    return "Anonymous";
  }

  return row.submitter.name || row.submitter.email || "Member";
}

/**
 * Format a submission timestamp for the table / detail view.
 */
export function formatFeedbackDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Show the path of the page a tester was on — the origin is the same app on
 * every row, so it only crowds the column.
 */
export function formatPageUrl(pageUrl) {
  if (!pageUrl) return "—";

  try {
    const url = new URL(pageUrl);
    return `${url.pathname}${url.search}` || "/";
  } catch {
    // Relative URLs are already the readable part.
    return pageUrl;
  }
}

/**
 * Attachment size in the units a human reads.
 */
export function formatFileSize(bytes) {
  if (typeof bytes !== "number" || bytes <= 0) return "";

  const KB = 1024;
  const MB = KB * 1024;

  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;

  return `${Math.max(1, Math.round(bytes / KB))} KB`;
}
