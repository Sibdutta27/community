/**
 * The membership section's own pages, reachable from one bar.
 *
 * The consent CATALOG lives here rather than on the top-level rail. Two
 * different questions were both called "consents": "what has this member
 * agreed to?" — which is a property of a person, and now answered on the user
 * record — and "which consents do we ask for?" — which is configuration, and
 * belongs beside the people it governs. Removing the rail entry without
 * rehoming this would have deleted the only way to publish a new version.
 */
export const USER_SECTION_ITEMS = [
  { label: "Members", to: "/users", end: true },
  { label: "Consent catalog", to: "/consents" },
];
