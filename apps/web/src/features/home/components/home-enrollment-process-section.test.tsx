import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeEnrollmentProcessSection } from "@/features/home/components/home-enrollment-process-section";

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

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

describe("HomeEnrollmentProcessSection", () => {
  it("renders the enrollment steps", () => {
    render(<HomeEnrollmentProcessSection />);
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByText("Upload Documents")).toBeInTheDocument();
  });

  it("uses semantic tokens instead of hardcoded earthy colors", () => {
    const { container } = render(<HomeEnrollmentProcessSection />);

    expect(container.innerHTML).not.toMatch(/#fffdec/i);
    expect(container.innerHTML).not.toMatch(/#d7efd3/i);
    expect(container.innerHTML).not.toMatch(/#103f36/i);
    expect(container.innerHTML).not.toMatch(/#24acc3/i);
    expect(container.querySelector(".bg-background")).not.toBeNull();
    expect(container.querySelector(".text-foreground")).not.toBeNull();
  });
});
