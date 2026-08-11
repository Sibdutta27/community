/**
 * The events section's own pages, reachable from one bar.
 *
 * Lives beside the pages rather than inside one of them so both Events and
 * Event Categories can render the same bar without importing a component file
 * for a constant.
 */
export const EVENT_SECTION_ITEMS = [
  { label: "Events", to: "/events", end: true },
  { label: "Categories", to: "/event-categories" },
];
