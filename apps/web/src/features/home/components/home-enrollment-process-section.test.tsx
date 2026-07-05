import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeEnrollmentProcessSection } from "@/features/home/components/home-enrollment-process-section";
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

describe("HomeEnrollmentProcessSection", () => {
  it("renders the enrollment steps", () => {
    renderWithIntl(<HomeEnrollmentProcessSection />);
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByText("Upload Documents")).toBeInTheDocument();
  });

  it("renders the full process slice in Puerto Rican Spanish under the es locale", () => {
    renderWithIntl(<HomeEnrollmentProcessSection />, "es");

    // Section header
    expect(
      screen.getByText("Cómo Inscribirte en la Nación Taíno de Borikén"),
    ).toBeInTheDocument();
    // Steps (titles + the "Paso" bubble label)
    expect(screen.getByText("Crea tu Cuenta")).toBeInTheDocument();
    expect(screen.getByText("Sube tus Documentos")).toBeInTheDocument();
    expect(screen.getAllByText("Paso")).toHaveLength(4);
    // Document checklist + tips
    expect(screen.getByText("¿Qué vas a necesitar?")).toBeInTheDocument();
    expect(screen.getByText("Certificado de Nacimiento")).toBeInTheDocument();
    expect(screen.getByText("Consejos Útiles")).toBeInTheDocument();
    // CTA
    expect(
      screen.getByRole("link", { name: /Comienza tu Solicitud/ }),
    ).toBeInTheDocument();
  });

  it("uses semantic tokens instead of hardcoded earthy colors", () => {
    const { container } = renderWithIntl(<HomeEnrollmentProcessSection />);

    expect(container.innerHTML).not.toMatch(/#fffdec/i);
    expect(container.innerHTML).not.toMatch(/#d7efd3/i);
    expect(container.innerHTML).not.toMatch(/#103f36/i);
    expect(container.innerHTML).not.toMatch(/#24acc3/i);
    expect(container.querySelector(".bg-background")).not.toBeNull();
    expect(container.querySelector(".text-foreground")).not.toBeNull();
  });
});
