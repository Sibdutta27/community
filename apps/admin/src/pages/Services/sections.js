/**
 * The programs section's own pages, reachable from one bar.
 *
 * Category management sits on the same bar rather than in a separate corner of
 * the sidebar — adding a program and adding the category it belongs to are the
 * same job, minutes apart.
 */
export const SERVICE_SECTION_ITEMS = [
  { label: "Programs", to: "/services", end: true },
  { label: "Categories", to: "/service-categories" },
];
