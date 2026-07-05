import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeHero } from "@/features/home/components/home-hero";
import { renderWithIntl } from "@/test/i18n";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

describe("HomeHero", () => {
  it("renders the primary CTA with the flag-red emphasis variant", () => {
    renderWithIntl(<HomeHero />);

    const cta = screen.getByRole("link", { name: /Start Your Enrollment/ });
    expect(cta).toHaveClass("bg-emphasis", "text-emphasis-foreground");
  });

  it("keeps the secondary CTA on the outline variant", () => {
    renderWithIntl(<HomeHero />);

    const secondary = screen.getByRole("link", { name: "Explore Community" });
    expect(secondary.className).toContain("border-border");
    expect(secondary.className).not.toContain("bg-emphasis");
  });

  it("renders the English hero copy under the default locale", () => {
    renderWithIntl(<HomeHero />);

    expect(
      screen.getByRole("heading", { level: 1 }),
    ).toHaveTextContent("Welcome to Taíno Nation of Borikén");
    expect(
      screen.getByText(/Reconnect with your ancestral roots/),
    ).toBeInTheDocument();
  });

  it("renders the full hero slice in Puerto Rican Spanish under the es locale", () => {
    renderWithIntl(<HomeHero />, "es");

    expect(
      screen.getByRole("heading", { level: 1 }),
    ).toHaveTextContent("Bienvenido a la Nación Taíno de Borikén");
    expect(
      screen.getByText(/Reconecta con tus raíces ancestrales/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Comienza tu Inscripción/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explora la Comunidad" }),
    ).toBeInTheDocument();
  });
});
