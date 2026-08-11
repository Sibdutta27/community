import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PublicNavbar } from "@/components/layout/public-navbar";
import { renderWithIntl } from "@/test/i18n";

const routerMocks = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => routerMocks.pathname,
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/i18n/locale-actions", () => ({
  setUserLocale: vi.fn(async () => {}),
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
    renderWithIntl(<PublicNavbar />);

    const activeLink = screen.getByRole("link", { name: "About Us" });
    expect(activeLink).toHaveAttribute("aria-current", "page");
    // The active section is marked by an azul baseline rule now, not a pill.
    expect(activeLink).toHaveClass("text-primary", "after:bg-primary");

    const inactiveLink = screen.getByRole("link", { name: "Enrollment" });
    expect(inactiveLink).not.toHaveAttribute("aria-current");
    expect(inactiveLink).toHaveClass("text-muted-foreground");
  });

  it("renders only the trimmed signed-out links (About Us + Enrollment)", () => {
    renderWithIntl(<PublicNavbar />);

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
    renderWithIntl(<PublicNavbar />);
    expect(
      screen.getByRole("link", { name: "Enroll Today" }),
    ).toBeInTheDocument();
  });

  it("renders every 'Enroll Today' CTA with the flag-red emphasis variant", () => {
    renderWithIntl(<PublicNavbar />);

    // Open the mobile menu so both the desktop and mobile CTAs render.
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const ctas = screen.getAllByRole("link", { name: "Enroll Today" });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    for (const cta of ctas) {
      expect(cta).toHaveClass("bg-emphasis", "text-emphasis-foreground");
    }
  });

  it("does not render the old 'Apply Now' CTA", () => {
    renderWithIntl(<PublicNavbar />);
    expect(screen.queryByText("Apply Now")).not.toBeInTheDocument();
  });

  it("wires the mobile menu toggle to the panel it controls", () => {
    renderWithIntl(<PublicNavbar />);

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls");

    fireEvent.click(toggle);

    const closeToggle = screen.getByRole("button", { name: "Close menu" });
    expect(closeToggle).toHaveAttribute("aria-expanded", "true");
    const panelId = closeToggle.getAttribute("aria-controls") as string;
    expect(document.getElementById(panelId)).not.toBeNull();
  });

  it("labels the main navigation landmark", () => {
    renderWithIntl(<PublicNavbar />);
    expect(
      screen.getAllByRole("navigation", { name: "Main" }).length,
    ).toBeGreaterThan(0);
  });

  it("renders the globe language switcher instead of the old 'En Español' link", () => {
    renderWithIntl(<PublicNavbar />);
    expect(
      screen.getByRole("button", { name: /change language/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("En Español")).not.toBeInTheDocument();
  });

  it("renders the nav links and CTAs in Puerto Rican Spanish under the es locale", () => {
    renderWithIntl(<PublicNavbar />, "es");

    expect(
      screen.getAllByRole("link", { name: "Sobre Nosotros" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "Inscripción" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "Iniciar Sesión" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "Inscríbete Hoy" }).length,
    ).toBeGreaterThan(0);

    // The English source strings must be fully replaced.
    for (const english of ["About Us", "Sign In", "Enroll Today"]) {
      expect(
        screen.queryByRole("link", { name: english }),
      ).not.toBeInTheDocument();
    }
  });
});
