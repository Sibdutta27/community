import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { YucayekeIdentityCard } from "@/features/profile/components/yucayeke-identity-card";
import { renderWithIntl } from "@/test/i18n";

// The geometry lives in a 162KB public asset behind TanStack Query. The card's
// own logic is what is under test, so the query is stubbed with enough shape
// for `buildTerritoryShapes` to produce something drawable.
vi.mock("@/features/yucayeke/lib/yucayeke-map-queries", () => ({
  useYucayekeGeometryQuery: () => ({
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "Guanía" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-67, 18],
                [-66, 18],
                [-66, 18.5],
                [-67, 18.5],
                [-67, 18],
              ],
            ],
          },
        },
      ],
    },
  }),
}));

describe("YucayekeIdentityCard", () => {
  describe("sample mode (the marketing hero's card back)", () => {
    it("names no territory and highlights none", () => {
      renderWithIntl(
        <YucayekeIdentityCard
          sample
          yucayekeUnknown={false}
          yucayekeValue={null}
        />,
      );

      expect(screen.getByText("Your Yukayeke")).toBeInTheDocument();

      // A sample card belongs to nobody, so it must not attest to a specific
      // territory, a named cacique, or a confirmation status.
      expect(screen.queryByText(/Wainia|Guanía/)).toBeNull();
      expect(screen.queryByText(/Agüeybaná/)).toBeNull();
      expect(
        screen.queryByText(/Historically documented|Oral tradition/i),
      ).toBeNull();
    });

    it("keeps every field a filled card carries, blank", () => {
      renderWithIntl(
        <YucayekeIdentityCard
          sample
          yucayekeUnknown={false}
          yucayekeValue={null}
        />,
      );

      // The labels are the point: the card should read as a form waiting to
      // be filled, not as a card missing rows.
      expect(screen.getByText("Ancestral territory")).toBeInTheDocument();
      expect(screen.getByText("Yukayeke")).toBeInTheDocument();
      expect(screen.getByText(/Cacique/)).toBeInTheDocument();
      expect(screen.getByText("Present-day")).toBeInTheDocument();
      expect(screen.getByText("Unissued")).toBeInTheDocument();
    });

    it("drops the action row that would sit inside the rotating card", () => {
      renderWithIntl(
        <YucayekeIdentityCard
          sample
          yucayekeUnknown={false}
          yucayekeValue={null}
        />,
      );

      expect(screen.queryByRole("link")).toBeNull();
    });

    it("never falls into the member empty state despite having no value", () => {
      renderWithIntl(
        <YucayekeIdentityCard
          sample
          yucayekeUnknown={false}
          yucayekeValue={null}
        />,
      );

      // Without `sample` a null value renders "No yukayeke declared yet",
      // which would read as a dead end on the landing page.
      expect(screen.queryByText(/No yukayeke declared/i)).toBeNull();
      expect(screen.getByText("Present-day")).toBeInTheDocument();
    });
  });

  describe("member mode", () => {
    it("still names the member's territory and its cacique", () => {
      renderWithIntl(
        <YucayekeIdentityCard yucayekeUnknown={false} yucayekeValue="Guanía" />,
      );

      expect(screen.getByText("Wainia")).toBeInTheDocument();
      expect(screen.getByText(/Cacique/)).toBeInTheDocument();
      expect(screen.queryByText("Your Yukayeke")).toBeNull();
    });

    it("falls back to the empty state when nothing is declared", () => {
      renderWithIntl(
        <YucayekeIdentityCard yucayekeUnknown={false} yucayekeValue={null} />,
      );

      expect(screen.queryByText("Your Yukayeke")).toBeNull();
      expect(screen.queryByText("Present-day")).toBeNull();
    });
  });
});
