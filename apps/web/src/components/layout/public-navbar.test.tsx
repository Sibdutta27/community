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
  it("renders only the trimmed signed-out links (About Us + Enrollment)", () => {
    render(<PublicNavbar />);

    // Desktop + mobile menus both render the nav list.
    expect(
      screen.getAllByRole("link", { name: "About Us" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "Enrollment" }).length,
    ).toBeGreaterThan(0);

    for (const removed of ["Home", "Yucayeke", "Community", "Services"]) {
      expect(
        screen.queryByRole("link", { name: removed }),
      ).not.toBeInTheDocument();
    }
  });

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

  it("renders the globe language switcher instead of the old 'En Español' link", () => {
    render(<PublicNavbar />);
    expect(
      screen.getByRole("button", { name: "Change language" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("En Español")).not.toBeInTheDocument();
  });
});
