import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProtectedNavbar } from "@/components/layout/protected-navbar";
import type { AuthUser } from "@/lib/auth";
import { renderWithIntl } from "@/test/i18n";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
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

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ clear: vi.fn() }),
}));

vi.mock("@/features/auth/lib/auth-mutations", () => ({
  useLogoutMutation: () => ({
    reset: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

const user: AuthUser = {
  id: "user-1",
  email: "member@example.com",
  name: "Test Member",
  role: "USER",
  publicId: "TN-0001",
} as AuthUser;

describe("ProtectedNavbar", () => {
  it("shows the full brand wordmark next to the logo (not logo-only)", () => {
    renderWithIntl(<ProtectedNavbar user={user} />);
    expect(screen.getByText("Taíno Nation of Borikén")).toBeInTheDocument();
  });

  it("renders the globe language switcher", () => {
    renderWithIntl(<ProtectedNavbar user={user} />);
    expect(
      screen.getByRole("button", { name: /change language/i }),
    ).toBeInTheDocument();
  });

  it("gives the profile trigger a visible azul focus ring", () => {
    renderWithIntl(<ProtectedNavbar user={user} />);

    const trigger = screen.getByText("Test Member").closest("button");
    expect(trigger).not.toBeNull();
    expect(trigger?.className).toContain("focus-visible:ring-2");
    expect(trigger?.className).toContain("focus-visible:ring-ring");
  });

  it("renders a refined initials avatar with an azul (not red) status badge", () => {
    renderWithIntl(<ProtectedNavbar user={user} />);

    const avatar = screen.getByText("TM");
    // Refined treatment: hairline ring, not the plain border.
    expect(avatar.className).toContain("ring-1");

    const badge = avatar.querySelector("span");
    expect(badge).not.toBeNull();
    expect(badge).toHaveClass("bg-primary");
    expect(badge).not.toHaveClass("bg-emphasis");
  });

  it("labels the account menu trigger and wires menu semantics", () => {
    renderWithIntl(<ProtectedNavbar user={user} />);

    const trigger = screen.getByRole("button", { name: "Account menu" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu", { name: "Account" });
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
    expect(screen.getAllByRole("menuitem").length).toBeGreaterThanOrEqual(2);
  });

  it("closes the account menu on Escape and returns focus to the trigger", () => {
    renderWithIntl(<ProtectedNavbar user={user} />);

    const trigger = screen.getByRole("button", { name: "Account menu" });
    fireEvent.click(trigger);
    expect(screen.getByRole("menu", { name: "Account" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.queryByRole("menu", { name: "Account" }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("wires the mobile menu toggle with aria-controls and aria-expanded", () => {
    renderWithIntl(<ProtectedNavbar user={user} />);

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
    renderWithIntl(<ProtectedNavbar user={user} />);
    expect(
      screen.getAllByRole("navigation", { name: "Main" }).length,
    ).toBeGreaterThan(0);
  });

  it("keeps the app navigation links", () => {
    renderWithIntl(<ProtectedNavbar user={user} />);

    for (const label of ["Dashboard", "Yukayeke"]) {
      expect(
        screen.getAllByRole("link", { name: label }).length,
      ).toBeGreaterThan(0);
    }

    // Profile is reachable from the account menu, not duplicated in the bar.
    expect(screen.queryByRole("link", { name: "My Profile" })).toBeNull();
  });

  it("groups Community and Services behind the Programs menu", () => {
    renderWithIntl(<ProtectedNavbar user={user} />);

    // Collapsed by default — that is the point of grouping them.
    expect(screen.queryByRole("link", { name: "Community" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Services" })).toBeNull();

    const trigger = screen.getByRole("button", { name: "Programs" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu", { name: "Programs" });
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
    // Menu children are menuitems, not plain links — that role overrides the
    // implicit one, so query them as such.
    expect(
      screen.getByRole("menuitem", { name: "Community" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Services" }),
    ).toBeInTheDocument();
  });

  describe("mobile account disclosure", () => {
    const openMobilePanel = () => {
      renderWithIntl(<ProtectedNavbar user={user} />);
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

      const panelId = screen
        .getByRole("button", { name: "Close menu" })
        .getAttribute("aria-controls") as string;

      return document.getElementById(panelId) as HTMLElement;
    };

    // The regression this whole disclosure exists for: the desktop account
    // menu sits in a `lg:flex` container, so before this the mobile drawer
    // had no route to /profile whatsoever.
    it("reaches the profile page from the mobile drawer", () => {
      const panel = openMobilePanel();

      fireEvent.click(
        within(panel).getByRole("button", { name: /Test Member/ }),
      );

      expect(
        within(panel).getByRole("menuitem", { name: "Profile" }),
      ).toHaveAttribute("href", "/profile");
    });

    it("keeps the account actions collapsed until the card is tapped", () => {
      const panel = openMobilePanel();
      const trigger = within(panel).getByRole("button", {
        name: /Test Member/,
      });

      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(within(panel).queryByRole("menuitem")).toBeNull();

      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      const menu = within(panel).getByRole("menu", { name: "Account" });
      expect(trigger).toHaveAttribute("aria-controls", menu.id);
      expect(
        within(menu).getByRole("menuitem", { name: /Sign out/ }),
      ).toBeInTheDocument();
    });

    // Two sign-out controls in one small drawer is worse than one; the card
    // is now the single account surface, mirroring desktop.
    it("offers exactly one sign-out control", () => {
      const panel = openMobilePanel();
      fireEvent.click(
        within(panel).getByRole("button", { name: /Test Member/ }),
      );

      // Counted across both roles on purpose: the control this replaced was a
      // plain button, so a regression would reappear as one.
      expect([
        ...within(panel).queryAllByRole("button", { name: /Sign out/ }),
        ...within(panel).queryAllByRole("menuitem", { name: /Sign out/ }),
      ]).toHaveLength(1);
    });

    it("collapses the account section when the drawer is closed and reopened", () => {
      const panel = openMobilePanel();
      fireEvent.click(
        within(panel).getByRole("button", { name: /Test Member/ }),
      );
      expect(
        within(panel).getByRole("menu", { name: "Account" }),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

      expect(screen.queryByRole("menu", { name: "Account" })).toBeNull();
    });
  });

  it("closes the Programs menu on Escape", () => {
    renderWithIntl(<ProtectedNavbar user={user} />);

    fireEvent.click(screen.getByRole("button", { name: "Programs" }));
    expect(screen.getByRole("menu", { name: "Programs" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menu", { name: "Programs" })).toBeNull();
  });
});
