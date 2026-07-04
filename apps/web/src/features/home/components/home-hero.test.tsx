import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeHero } from "@/features/home/components/home-hero";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

describe("HomeHero", () => {
  it("renders the primary CTA with the flag-red emphasis variant", () => {
    render(<HomeHero />);

    const cta = screen.getByRole("link", { name: /Start Your Enrollment/ });
    expect(cta).toHaveClass("bg-emphasis", "text-emphasis-foreground");
  });

  it("keeps the secondary CTA on the outline variant", () => {
    render(<HomeHero />);

    const secondary = screen.getByRole("link", { name: "Explore Community" });
    expect(secondary.className).toContain("border-border");
    expect(secondary.className).not.toContain("bg-emphasis");
  });
});
