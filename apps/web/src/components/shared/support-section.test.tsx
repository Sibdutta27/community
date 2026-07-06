import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SupportSection } from "@/components/shared/support-section";
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

describe("SupportSection", () => {
  it("keeps the Email Support action", () => {
    renderWithIntl(<SupportSection />);
    expect(screen.getByText("Email Support")).toBeInTheDocument();
    expect(screen.getByText("support@tainonation.org")).toBeInTheDocument();
  });

  it("no longer renders a phone support card", () => {
    renderWithIntl(<SupportSection />);
    expect(screen.queryByText(/phone support/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\(787\) 555-0100/)).not.toBeInTheDocument();
  });

  it("does not render any tel: link", () => {
    const { container } = renderWithIntl(<SupportSection />);
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it("uses the shared shadow-card-soft elevation on the support cards", () => {
    const { container } = renderWithIntl(<SupportSection />);
    expect(container.querySelector(".shadow-card-soft")).not.toBeNull();
    expect(container.innerHTML).not.toContain("shadow-[0_16px_30px_-26px");
  });

  it("uses semantic tokens instead of hardcoded brand colors", () => {
    const { container } = renderWithIntl(<SupportSection />);
    expect(container.innerHTML).not.toMatch(/#6FAFC4/i);
    expect(container.innerHTML).not.toMatch(/#C53133/i);
    expect(container.innerHTML).not.toContain("brand-sky");
    expect(container.querySelector(".bg-surface")).not.toBeNull();
  });
});
