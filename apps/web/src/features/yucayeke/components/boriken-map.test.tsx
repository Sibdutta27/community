import { readFileSync } from "node:fs";
import { join } from "node:path";

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/i18n";

import {
  buildTerritoryShapes,
  type TerritoryFeatureCollection,
} from "../lib/geometry";
import { BorikenMap } from "./boriken-map";

const geojson = JSON.parse(
  readFileSync(
    join(process.cwd(), "public/geo/yucayeke-boundaries.json"),
    "utf8",
  ),
) as TerritoryFeatureCollection;

const shapes = buildTerritoryShapes(geojson);

describe("BorikenMap", () => {
  it("renders one path per territory with data hooks", () => {
    const { container } = renderWithIntl(<BorikenMap shapes={shapes} />);
    const paths = container.querySelectorAll("path[data-territory]");

    expect(paths.length).toBe(19);
    expect(
      container.querySelector('path[data-territory="Guanía"]'),
    ).not.toBeNull();
  });

  it("marks the highlighted territory", () => {
    const { container } = renderWithIntl(
      <BorikenMap shapes={shapes} highlightedKey="Guanía" />,
    );

    expect(
      container.querySelector(
        'path[data-territory="Guanía"][data-highlighted]',
      ),
    ).not.toBeNull();
    expect(container.querySelectorAll("path[data-highlighted]").length).toBe(1);
  });

  it("fires onSelect from click and keyboard", () => {
    const onSelect = vi.fn();
    renderWithIntl(<BorikenMap shapes={shapes} onSelect={onSelect} />);

    const turabo = screen.getByRole("button", { name: /Turabo/ });
    fireEvent.click(turabo);
    fireEvent.keyDown(turabo, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledWith("Turabo");
  });

  it("renders the preview variant as decorative and inert", () => {
    const { container } = renderWithIntl(
      <BorikenMap shapes={shapes} variant="preview" />,
    );
    const svg = container.querySelector("svg");

    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("path[tabindex]")).toBeNull();
    expect(container.querySelector('path[role="button"]')).toBeNull();
  });
});
