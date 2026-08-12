import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithIntl } from "@/test/i18n";

import { getTerritoryBySlug } from "../content/territories";
import { TerritoryOverridesProvider } from "../lib/territory-overrides-context";
import { TerritoryInfoCard } from "./territory-info-card";

describe("TerritoryInfoCard", () => {
  it("shows identity, status, and municipalities for a confirmed territory", () => {
    renderWithIntl(
      <TerritoryInfoCard territory={getTerritoryBySlug("guania")} />,
    );

    expect(screen.getByText("Wainia")).toBeDefined();
    expect(screen.getByText("Cacique Agüeybaná")).toBeDefined();
    expect(screen.getByText("Historically documented")).toBeDefined();
    expect(screen.getByText("Ponce")).toBeDefined();
    expect(screen.queryByText("Your yukayeke")).toBeNull();
  });

  it("shows the oral-tradition badge for unconfirmed territories", () => {
    renderWithIntl(
      <TerritoryInfoCard territory={getTerritoryBySlug("guajataca")} />,
    );

    expect(screen.getByText("Oral tradition")).toBeDefined();
  });

  it("flags the member's own territory", () => {
    renderWithIntl(
      <TerritoryInfoCard
        territory={getTerritoryBySlug("guania")}
        isOwnTerritory
      />,
    );

    expect(screen.getByText("Your yukayeke")).toBeDefined();
  });

  it("shows the not-yet-mapped tag for unmapped territories", () => {
    renderWithIntl(
      <TerritoryInfoCard territory={getTerritoryBySlug("hayuya")} />,
    );

    expect(screen.getByText("Not yet mapped")).toBeDefined();
  });

  it("prompts for a selection when no territory is chosen", () => {
    renderWithIntl(<TerritoryInfoCard territory={null} />);

    expect(screen.getByTestId("territory-info-empty")).toBeDefined();
  });
});

describe("TerritoryInfoCard — Website Studio edits", () => {
  // The wiring proof for the whole override path: the provider is fed from the
  // root layout, and this is the boundary where it is allowed to take effect.
  it("shows the Nation's edited name, cacique and municipalities", () => {
    renderWithIntl(
      <TerritoryOverridesProvider
        value={{
          guania: {
            displayName: "Wainía",
            cacique: "Agüeybaná II",
            municipalities: ["Ponce", "Yauco"],
          },
        }}
      >
        <TerritoryInfoCard territory={getTerritoryBySlug("guania")} />
      </TerritoryOverridesProvider>,
    );

    expect(screen.getByText("Wainía")).toBeDefined();
    expect(screen.getByText("Cacique Agüeybaná II")).toBeDefined();
    expect(screen.getByText("Yauco")).toBeDefined();
    expect(screen.queryByText("Cabo Rojo")).toBeNull();
  });

  // The card links by slug and asks next-intl for `territories.<slug>` — an
  // edited name must not move either, or the link 404s and the blurb vanishes.
  it("keeps the slug it links and looks copy up by", () => {
    renderWithIntl(
      <TerritoryOverridesProvider
        value={{ guania: { displayName: "Somewhere Else" } }}
      >
        <TerritoryInfoCard territory={getTerritoryBySlug("guania")} />
      </TerritoryOverridesProvider>,
    );

    const link = screen.getByRole("link");

    expect(link.getAttribute("href")).toBe("/yucayeke/guania");
  });

  it("leaves a territory nobody edited exactly as the code ships it", () => {
    renderWithIntl(
      <TerritoryOverridesProvider value={{ guania: { displayName: "Wainía" } }}>
        <TerritoryInfoCard territory={getTerritoryBySlug("guajataca")} />
      </TerritoryOverridesProvider>,
    );

    expect(screen.getByText("Guajataca")).toBeDefined();
  });
});
