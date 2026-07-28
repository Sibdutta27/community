import { readFileSync } from "node:fs";
import { join } from "node:path";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "@/test/i18n";

import type { TerritoryFeatureCollection } from "../lib/geometry";
import { yucayekeMapQueryKeys } from "../lib/yucayeke-map-queries";
import { YourYucayekeCard } from "./your-yucayeke-card";

const geojson = JSON.parse(
  readFileSync(
    join(process.cwd(), "public/geo/yucayeke-boundaries.json"),
    "utf8",
  ),
) as TerritoryFeatureCollection;

function renderCard(props: {
  yucayekeValue: string | null;
  yucayekeUnknown: boolean;
}) {
  const queryClient = new QueryClient();
  // Seed the geometry cache so the card never fetches in jsdom.
  queryClient.setQueryData(yucayekeMapQueryKeys.geometry, geojson);

  return render(
    <QueryClientProvider client={queryClient}>
      {withIntl(<YourYucayekeCard {...props} />)}
    </QueryClientProvider>,
  );
}

describe("YourYucayekeCard", () => {
  it("shows the resolved territory for the API spelling Guaynía", () => {
    renderCard({ yucayekeValue: "Guaynía", yucayekeUnknown: false });

    expect(screen.getByText("Guanía")).toBeDefined();
    expect(screen.getByText("Cacique Agüeybaná")).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Explore the territories" }),
    ).toHaveProperty("href", expect.stringContaining("/yucayeke/map"));
  });

  it("shows help-finding framing when yucayeke is unknown", () => {
    renderCard({ yucayekeValue: null, yucayekeUnknown: true });

    expect(screen.getByText(/marked your yucayeke as unknown/)).toBeDefined();
    expect(
      screen.queryByRole("link", { name: "Complete enrollment" }),
    ).toBeNull();
  });

  it("shows the enrollment CTA when nothing is declared", () => {
    renderCard({ yucayekeValue: null, yucayekeUnknown: false });

    expect(screen.getByText(/No yucayeke recorded yet/)).toBeDefined();
    expect(
      screen.getByRole("link", { name: "Complete enrollment" }),
    ).toBeDefined();
  });

  it("degrades gracefully for an unmapped territory", () => {
    renderCard({ yucayekeValue: "Hayuya", yucayekeUnknown: false });

    expect(screen.getByText("Hayuya")).toBeDefined();
    expect(screen.getByText("Not yet mapped")).toBeDefined();
  });
});
