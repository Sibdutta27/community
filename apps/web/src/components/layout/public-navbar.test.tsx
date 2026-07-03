import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PublicNavbar } from "@/components/layout/public-navbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

describe("PublicNavbar", () => {
  it("renders the primary CTA as 'Enroll Today'", () => {
    render(<PublicNavbar />);
    expect(
      screen.getByRole("link", { name: "Enroll Today" }),
    ).toBeInTheDocument();
  });

  it("does not render the old 'Apply Now' CTA", () => {
    render(<PublicNavbar />);
    expect(screen.queryByText("Apply Now")).not.toBeInTheDocument();
  });

  it("renders the placeholder 'En Español' language link", () => {
    render(<PublicNavbar />);
    const links = screen.getAllByRole("link", { name: /En Español/i });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "?lang=es");
    }
  });
});
