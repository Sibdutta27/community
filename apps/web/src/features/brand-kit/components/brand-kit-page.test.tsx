import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithIntl as render } from "@/test/i18n";

import { BrandKitPage } from "./brand-kit-page";

describe("BrandKitPage", () => {
  it("renders the brand-kit hero and every section landmark", () => {
    const { container } = render(<BrandKitPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /brand kit/i }),
    ).toBeInTheDocument();

    for (const name of [
      /palette/i,
      /typography/i,
      /spacing, radius & shadow/i,
      /components/i,
      /patterns/i,
      /motion/i,
      /do & don't/i,
    ]) {
      expect(
        screen.getByRole("heading", { level: 2, name }),
      ).toBeInTheDocument();
    }

    // Section jump-nav for the whole kit.
    expect(
      screen.getByRole("navigation", { name: /brand kit sections/i }),
    ).toBeInTheDocument();

    // No hardcoded hex utilities anywhere in the rendered markup — the old
    // showcase's tan `bg-[#fff9e8]` container must be gone.
    expect(container.innerHTML).not.toMatch(/bg-\[#/);
  });

  it("shows palette swatches with token names and AA badges", () => {
    render(<BrandKitPage />);

    expect(screen.getByText("--primary")).toBeInTheDocument();
    expect(screen.getByText("--emphasis")).toBeInTheDocument();
    // Azul hex label appears on its swatches (--primary and --ring share it).
    expect(screen.getAllByText("#0a56a8").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/AA/).length).toBeGreaterThan(5);
    // Contrast ratios rendered as n.n:1.
    expect(screen.getAllByText(/\d+(\.\d+)?:1/).length).toBeGreaterThan(5);
    // Celeste / red usage note.
    expect(screen.getByText(/logo artwork only/i)).toBeInTheDocument();
  });

  it("renders the full button catalog", () => {
    render(<BrandKitPage />);

    for (const label of [
      "Primary",
      "Emphasis",
      "Outline",
      "Secondary",
      "Accent",
      "Ghost",
    ]) {
      expect(
        screen.getByRole("button", { name: label }),
      ).toBeInTheDocument();
    }

    expect(screen.getByText("Submitting...")).toBeInTheDocument();
  });

  it("renders the signature patterns — stepper, surface card and navbar pill", () => {
    render(<BrandKitPage />);

    const stepper = screen.getByRole("list", { name: /enrollment steps/i });
    expect(
      within(stepper).getByText(/maternal kinship/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/SurfaceCard/)).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /example site navigation/i }),
    ).toBeInTheDocument();
  });

  it("lists the shared motion presets", () => {
    render(<BrandKitPage />);

    for (const preset of [
      "fadeInUpContainer",
      "fadeInUpItem",
      "fadeInScaleItem",
      "enrollmentStepEnter",
      "enrollmentFieldGroup",
      "mobileMenuVariants",
    ]) {
      expect(screen.getByText(preset)).toBeInTheDocument();
    }
  });
});
