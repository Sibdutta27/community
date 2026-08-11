import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/i18n";

import { TERRITORIES } from "../content/territories";
import { TerritoryList } from "./territory-list";

describe("TerritoryList", () => {
  it("renders every territory including unmapped ones", () => {
    renderWithIntl(<TerritoryList selectedSlug={null} onSelect={() => {}} />);

    expect(document.querySelectorAll("[data-territory-slug]").length).toBe(
      TERRITORIES.length,
    );
    expect(screen.getAllByText("Not yet mapped").length).toBe(2);
  });

  it("commits selection on pointerdown (mouse) and click (keyboard)", () => {
    const onSelect = vi.fn();
    renderWithIntl(<TerritoryList selectedSlug={null} onSelect={onSelect} />);

    const row = document.querySelector('[data-territory-slug="guajataca"]')!;
    // Mouse path: pointerdown must be enough on its own — the info card
    // above the list resizes on hover and can swallow the ensuing click.
    fireEvent.pointerDown(row);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].slug).toBe("guajataca");

    // Keyboard path: Enter on a focused button fires click, not pointerdown.
    fireEvent.click(row);
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it("marks the selected and own territories", () => {
    renderWithIntl(
      <TerritoryList
        selectedSlug="turabo"
        highlightedSlug="guania"
        onSelect={() => {}}
      />,
    );

    expect(
      document
        .querySelector('[data-territory-slug="turabo"]')
        ?.getAttribute("aria-current"),
    ).toBe("true");
    expect(screen.getByText(/• Your yukayeke/)).toBeDefined();
  });
});
