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

// The card's reverse face fetches the territory GeoJSON through TanStack
// Query. That is covered by its own suites; here it would only mean giving
// the hero a QueryClientProvider it never needs in the app.
vi.mock("@/features/profile/components/yucayeke-identity-card", () => ({
  YucayekeIdentityCard: () => <div data-testid="yucayeke-face" />,
}));

describe("HomeHero", () => {
  it("renders the primary CTA with the flag-red emphasis variant", () => {
    renderWithIntl(<HomeHero />);

    const cta = screen.getByRole("link", { name: /Start Enrollment/ });
    expect(cta).toHaveClass("bg-emphasis", "text-emphasis-foreground");
  });

  it("keeps the secondary CTA quiet beside the emphasis primary", () => {
    renderWithIntl(<HomeHero />);

    const secondary = screen.getByRole("link", { name: "Explore Community" });
    expect(secondary.className).not.toContain("bg-emphasis");
    expect(secondary.className).not.toContain("border-border");
  });

  it("sizes both CTAs down from the old xl pill", () => {
    renderWithIntl(<HomeHero />);

    for (const name of [/Start Enrollment/, "Explore Community"]) {
      const cta = screen.getByRole("link", { name });
      expect(cta.className).toContain("h-12");
      expect(cta.className).not.toContain("h-14");
    }
  });

  it("centres the copy until lg, then left-aligns it beside the card", () => {
    renderWithIntl(<HomeHero />);

    const column = screen.getByRole("heading", { level: 1 }).parentElement;
    // Unprefixed = the phone; `lg:` = once the card sits alongside. Asserted
    // as whole classes: `items-start` alone would also match `lg:items-start`
    // and let a regression through.
    const classes = column?.className.split(/\s+/) ?? [];
    expect(classes).toContain("items-center");
    expect(classes).toContain("text-center");
    expect(classes).toContain("lg:items-start");
    expect(classes).toContain("lg:text-left");

    // The centred reading column the shared shell defaults to must be gone,
    // or the card has nowhere to sit.
    const layout = column?.parentElement;
    expect(layout?.className).toContain("grid");
    expect(layout?.className).not.toContain("max-w-4xl");
  });

  it("puts the card between the pitch and the actions on a phone", () => {
    renderWithIntl(<HomeHero />);

    const layout = screen.getByRole("heading", { level: 1 }).parentElement
      ?.parentElement;
    const blocks = Array.from(layout?.children ?? []);

    const pitch = blocks.findIndex((b) => b.querySelector("h1"));
    const card = blocks.findIndex((b) => b.querySelector('[role="img"]'));
    const actions = blocks.findIndex((b) =>
      b.querySelector('a[href="/dashboard"]'),
    );

    // DOM order IS the mobile order — the desktop arrangement is explicit
    // grid placement on top of it, so this ordering is what phones get.
    expect(pitch).toBe(0);
    expect(card).toBe(1);
    expect(actions).toBe(2);

    // …and at lg the card must jump to the second column, spanning both copy
    // rows, or the desktop layout collapses back to a single stack.
    expect(blocks[card].className).toContain("lg:col-start-2");
    expect(blocks[card].className).toContain("lg:row-span-2");
    expect(blocks[actions].className).toContain("lg:col-start-1");
    expect(blocks[actions].className).toContain("lg:row-start-2");
  });

  it("anchors the hero with the sample tribal ID card", () => {
    renderWithIntl(<HomeHero />);

    expect(
      screen.getByRole("img", {
        name: /sample Taíno Nation of Borikén tribal/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders the English hero copy under the default locale", () => {
    renderWithIntl(<HomeHero />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Welcome to Taíno Nation of Borikén",
    );
    expect(
      screen.getByText(/Reconnect with your ancestral roots/),
    ).toBeInTheDocument();
  });

  it("renders the full hero slice in Puerto Rican Spanish under the es locale", () => {
    renderWithIntl(<HomeHero />, "es");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Bienvenido a la Nación Taíno de Borikén",
    );
    expect(
      screen.getByText(/Reconecta con tus raíces ancestrales/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Comienza tu Inscripción/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /tarjeta de identificación tribal de muestra/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explora la Comunidad" }),
    ).toBeInTheDocument();
  });
});
