import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeMemberServicesSection } from "@/features/home/components/home-member-services-section";
import { renderWithIntl } from "@/test/i18n";

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

describe("HomeMemberServicesSection", () => {
  it("keeps the Email Support action", () => {
    renderWithIntl(<HomeMemberServicesSection />);
    expect(screen.getByText("Email Support")).toBeInTheDocument();
  });

  it("no longer renders a phone / call action", () => {
    renderWithIntl(<HomeMemberServicesSection />);
    expect(screen.queryByText(/call/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/109 02001/)).not.toBeInTheDocument();
  });

  it("does not render any tel: link", () => {
    const { container } = renderWithIntl(<HomeMemberServicesSection />);
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it("renders the services copy in Puerto Rican Spanish under the es locale", () => {
    renderWithIntl(<HomeMemberServicesSection />, "es");

    expect(screen.getByText("Salud y Bienestar")).toBeInTheDocument();
    expect(screen.getByText("Asistencia Legal")).toBeInTheDocument();
    expect(
      screen.getByText("Apoyo Integral para Nuestra Comunidad"),
    ).toBeInTheDocument();
    expect(screen.getByText("Apoyo por Email")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explora los Servicios de Salud" }),
    ).toBeInTheDocument();
  });
});
