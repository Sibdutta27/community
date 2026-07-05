import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AboutValuesSection } from "@/features/about/components/about-values-section";
import { renderWithIntl } from "@/test/i18n";

// `next/font/google` loaders only run inside the Next.js build; stub the fonts
// module so the section (which imports `@/styles/fonts`) can render in jsdom.
vi.mock("@/styles/fonts", () => {
  const mockFont = {
    className: "mock-font",
    variable: "mock-font-variable",
    style: { fontFamily: "mock-font" },
  };
  return {
    inter: mockFont,
    cinzel: mockFont,
    montserrat: mockFont,
    lato: mockFont,
    poppins: mockFont,
  };
});

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

describe("AboutValuesSection", () => {
  it("renders the values", () => {
    renderWithIntl(<AboutValuesSection />);
    expect(screen.getByText("Sovereign Data")).toBeInTheDocument();
    expect(screen.getByText("Community Access")).toBeInTheDocument();
  });

  it("renders the values in Puerto Rican Spanish under the es locale", () => {
    renderWithIntl(<AboutValuesSection />, "es");
    expect(screen.getByText("Datos Soberanos")).toBeInTheDocument();
    expect(screen.getByText("Acceso Comunitario")).toBeInTheDocument();
    expect(
      screen.getByText("Los Principios Detrás de la Plataforma"),
    ).toBeInTheDocument();
  });

  it("uses semantic tokens instead of hardcoded earthy colors", () => {
    const { container } = renderWithIntl(<AboutValuesSection />);

    expect(container.innerHTML).not.toMatch(/#fffdec/i);
    expect(container.innerHTML).not.toMatch(/#d7efd3/i);
    expect(container.innerHTML).not.toMatch(/#1b5b4f/i);
    expect(container.querySelector(".bg-background")).not.toBeNull();
    expect(container.querySelector(".bg-surface")).not.toBeNull();
  });

  it("renders the value cards as elevated surface cards", () => {
    const { container } = renderWithIntl(<AboutValuesSection />);

    const cards = container.querySelectorAll("article.shadow-card-soft");
    expect(cards).toHaveLength(3);
    cards.forEach((card) => {
      expect(card.classList.contains("rounded-2xl")).toBe(true);
      expect(card.classList.contains("border-border")).toBe(true);
    });
  });
});
