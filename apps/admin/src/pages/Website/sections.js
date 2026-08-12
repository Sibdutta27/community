/**
 * The Website Studio's tabs.
 *
 * Yukayeke and Media are tabs of the Studio rather than top-level rail items:
 * editing a territory's description or swapping a photograph is the same job
 * as editing any other page copy, and it publishes through the same queue.
 */
export const WEBSITE_SECTION_ITEMS = [
  { label: "Pages", to: "/website", end: true },
  { label: "Yukayeke", to: "/website/yucayeke" },
  { label: "Media", to: "/website/media" },
  { label: "History", to: "/website/history" },
];
