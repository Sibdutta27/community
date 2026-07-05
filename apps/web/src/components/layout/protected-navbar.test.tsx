import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProtectedNavbar } from "@/components/layout/protected-navbar";
import type { AuthUser } from "@/lib/auth";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
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
  it("shows the brand wordmark next to the logo (not logo-only)", () => {
    render(<ProtectedNavbar user={user} />);
    expect(screen.getByText("Taíno Nation")).toBeInTheDocument();
  });

  it("renders the globe language switcher", () => {
    render(<ProtectedNavbar user={user} />);
    expect(
      screen.getByRole("button", { name: "Change language" }),
    ).toBeInTheDocument();
  });

  it("gives the profile trigger a visible azul focus ring", () => {
    render(<ProtectedNavbar user={user} />);

    const trigger = screen.getByText("Test Member").closest("button");
    expect(trigger).not.toBeNull();
    expect(trigger?.className).toContain("focus-visible:ring-2");
    expect(trigger?.className).toContain("focus-visible:ring-ring");
  });

  it("renders a refined initials avatar with an azul (not red) status badge", () => {
    render(<ProtectedNavbar user={user} />);

    const avatar = screen.getByText("TM");
    // Refined treatment: hairline ring, not the plain border.
    expect(avatar.className).toContain("ring-1");

    const badge = avatar.querySelector("span");
    expect(badge).not.toBeNull();
    expect(badge).toHaveClass("bg-primary");
    expect(badge).not.toHaveClass("bg-emphasis");
  });

  it("keeps the app navigation links", () => {
    render(<ProtectedNavbar user={user} />);

    for (const label of [
      "Dashboard",
      "My Profile",
      "Yucayeke",
      "Community",
      "Services",
    ]) {
      expect(
        screen.getAllByRole("link", { name: label }).length,
      ).toBeGreaterThan(0);
    }
  });
});
