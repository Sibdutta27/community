import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PublicNavbar } from "@/components/layout/public-navbar";

const routerMocks = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => routerMocks.pathname,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

describe("PublicNavbar", () => {
  beforeEach(() => {
    routerMocks.pathname = "/";
  });

  it("marks the active link with the azul active treatment", () => {
    routerMocks.pathname = "/about";
    render(<PublicNavbar />);

    const activeLink = screen.getByRole("link", { name: "About Us" });
    expect(activeLink).toHaveAttribute("aria-current", "page");
    expect(activeLink).toHaveClass("text-primary", "bg-primary/8");

    const inactiveLink = screen.getByRole("link", { name: "Enrollment" });
    expect(inactiveLink).not.toHaveAttribute("aria-current");
    expect(inactiveLink).toHaveClass("text-muted-foreground");
  });

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

  it("renders every 'Enroll Today' CTA with the flag-red emphasis variant", () => {
    render(<PublicNavbar />);

    // Open the mobile menu so both the desktop and mobile CTAs render.
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const ctas = screen.getAllByRole("link", { name: "Enroll Today" });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    for (const cta of ctas) {
      expect(cta).toHaveClass("bg-emphasis", "text-emphasis-foreground");
    }
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
