import { readFileSync } from "node:fs";
import { join } from "node:path";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { profileQueryKeys } from "@/features/profile/lib/profile-queries";
import { withIntl } from "@/test/i18n";

import type { TerritoryFeatureCollection } from "../lib/geometry";
import { yucayekeMapQueryKeys } from "../lib/yucayeke-map-queries";
import { YucayekeMapPageContent } from "./yucayeke-map-page-content";

const geojson = JSON.parse(
  readFileSync(
    join(process.cwd(), "public/geo/yucayeke-boundaries.json"),
    "utf8",
  ),
) as TerritoryFeatureCollection;

function renderPage() {
  const queryClient = new QueryClient();
  // Seed both caches so nothing fetches in jsdom: the geometry asset and the
  // signed-out profile (the page is public — no session is the normal case).
  queryClient.setQueryData(yucayekeMapQueryKeys.geometry, geojson);
  queryClient.setQueryData(profileQueryKeys.optionalInfo, null);

  return render(
    <QueryClientProvider client={queryClient}>
      {withIntl(<YucayekeMapPageContent />)}
    </QueryClientProvider>,
  );
}

describe("YucayekeMapPageContent", () => {
  it("keeps the territory list out of the mobile layout and beside the map from lg up", () => {
    renderPage();

    const list = screen.getByRole("list", { name: "Territory list" });
    const aside = list.closest("aside");

    expect(aside).not.toBeNull();
    // `hidden` at the base width, restored as a grid column at `lg` — the
    // stack of names must not sit between the map and the reading panel on a
    // phone, but the desktop map-left/list-right layout is unchanged.
    expect(aside?.className).toContain("hidden");
    expect(aside?.className).toContain("lg:block");
  });

  it("selecting a territory on the map alone drives the reading panel", () => {
    const { container } = renderPage();

    // The map is the sole selector once the list is hidden, so this is the
    // mobile path end to end: tap a territory, read it below the map. Query
    // the map path directly — jsdom applies no Tailwind, so the list the
    // browser hides at this width is still in the tree here.
    expect(screen.getByTestId("territory-info-empty")).toBeDefined();

    const turabo = container.querySelector('path[data-territory="Turabo"]');
    expect(turabo).not.toBeNull();
    fireEvent.click(turabo!);

    const card = screen.getByTestId("territory-info-card");
    expect(card.textContent).toContain("Turabo");
    expect(card.textContent).toContain("Cacique Caguax");
  });

  it("exposes every mapped territory on the map as a named, focusable control", () => {
    const { container } = renderPage();

    const paths = container.querySelectorAll('path[role="button"]');
    expect(paths.length).toBe(19);
    for (const path of paths) {
      expect(path.getAttribute("tabindex")).toBe("0");
      expect(path.getAttribute("aria-label")).toBeTruthy();
    }
  });
});
