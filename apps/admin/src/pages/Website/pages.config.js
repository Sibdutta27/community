/**
 * The site as staff think about it: pages, not i18n namespaces.
 *
 * The catalog's namespaces are an implementation detail — `yucayeke` and
 * `yucayekeMap` are one place to anyone who does not read the code, and
 * `nav` + `footer` are "the bits on every page". Grouping them here means the
 * editor never asks someone to know which namespace a sentence lives in.
 *
 * Only namespaces the API marks editable can appear; anything else is refused
 * server-side regardless of what this file says.
 */
export const WEBSITE_PAGES = [
  {
    id: "home",
    label: "Home",
    description: "The landing page — hero, heritage, process and FAQ.",
    namespaces: ["home"],
    previewPath: "/",
  },
  {
    id: "about",
    label: "About",
    description: "Who the Nation is and what the platform is for.",
    namespaces: ["about"],
    previewPath: "/about",
  },
  {
    id: "yucayeke",
    label: "Yukayeke",
    description:
      "The territory map, the directory, and each territory's blurb.",
    namespaces: ["yucayeke", "yucayekeMap"],
    previewPath: "/yucayeke",
  },
  {
    id: "services",
    label: "Programs",
    description: "Programme listing copy and category names.",
    namespaces: ["services"],
    previewPath: "/services",
  },
  {
    id: "community",
    label: "Community",
    description: "Events and community page copy.",
    namespaces: ["community"],
    previewPath: "/community",
  },
  {
    id: "contact",
    label: "Contact & support",
    description: "Contact page and the support panel shown across the site.",
    namespaces: ["contact", "support"],
    previewPath: "/contact",
  },
  {
    id: "chrome",
    label: "Header & footer",
    description: "Navigation labels and footer text on every page.",
    namespaces: ["nav", "footer"],
    previewPath: "/",
  },
  {
    id: "metadata",
    label: "Search & sharing",
    description: "The title and description shown in search results.",
    namespaces: ["metadata"],
    previewPath: "/",
  },
];

/** Namespace → the page that owns it. */
export const NAMESPACE_TO_PAGE = WEBSITE_PAGES.reduce((map, page) => {
  for (const namespace of page.namespaces) {
    map[namespace] = page.id;
  }

  return map;
}, {});

export function findPage(pageId) {
  return WEBSITE_PAGES.find((page) => page.id === pageId) ?? WEBSITE_PAGES[0];
}

/**
 * Which page a message key belongs to.
 *
 * The change log stores key paths, but "what did this change look like?" is a
 * question about a page — so history rows need this to point anywhere useful.
 * Returns null for a key whose namespace no page claims (developer-owned copy,
 * or a namespace added since this map was written), and callers must handle
 * that rather than guessing at a page.
 */
export function findPageForKeyPath(keyPath) {
  if (typeof keyPath !== "string") {
    return null;
  }

  const pageId = NAMESPACE_TO_PAGE[keyPath.split(".")[0]];

  return pageId ? findPage(pageId) : null;
}
