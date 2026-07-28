import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithIntl } from "@/test/i18n";

import { getTerritoryBySlug } from "../content/territories";
import { TerritoryInfoCard } from "./territory-info-card";

describe("TerritoryInfoCard", () => {
  it("shows identity, status, and municipalities for a confirmed territory", () => {
    renderWithIntl(
      <TerritoryInfoCard territory={getTerritoryBySlug("guania")} />,
    );

    expect(screen.getByText("Guanía")).toBeDefined();
    expect(screen.getByText("Cacique Agüeybaná")).toBeDefined();
    expect(screen.getByText("Historically documented")).toBeDefined();
    expect(screen.getByText("Ponce")).toBeDefined();
    expect(screen.queryByText("Your yucayeke")).toBeNull();
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

    expect(screen.getByText("Your yucayeke")).toBeDefined();
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
