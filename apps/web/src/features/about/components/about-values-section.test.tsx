import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AboutValuesSection } from "@/features/about/components/about-values-section";

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
    render(<AboutValuesSection />);
    expect(screen.getByText("Sovereign Data")).toBeInTheDocument();
    expect(screen.getByText("Community Access")).toBeInTheDocument();
  });

  it("uses semantic tokens instead of hardcoded earthy colors", () => {
    const { container } = render(<AboutValuesSection />);

    expect(container.innerHTML).not.toMatch(/#fffdec/i);
    expect(container.innerHTML).not.toMatch(/#d7efd3/i);
    expect(container.innerHTML).not.toMatch(/#1b5b4f/i);
    expect(container.querySelector(".bg-background")).not.toBeNull();
    expect(container.querySelector(".bg-surface")).not.toBeNull();
  });
});
