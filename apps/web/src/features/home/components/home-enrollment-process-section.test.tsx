import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { enrollmentStepDefinitions } from "@/features/enrollment/config/enrollment-steps";
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

/** The marketing step cards — one per real enrollment step. */
function getStepCards() {
  return Array.from(
    document.querySelectorAll("[data-slot='home-enrollment-step-card']"),
  ) as HTMLElement[];
}

describe("HomeEnrollmentProcessSection — anti-drift with the real flow", () => {
  // REGRESSION GUARD. This section used to hardcode a 4-item, maternal-only
  // process ("Create Account / Personal Information / Maternal Lineage /
  // Upload Documents") while the application had already grown to five steps
  // including paternal kinship. The cards are now derived from
  // `enrollmentStepDefinitions`; these assertions keep them derived.
  it("renders exactly one card per enrollment step, with the real step titles in order", () => {
    renderWithIntl(<HomeEnrollmentProcessSection />);

    const cards = getStepCards();
    expect(cards).toHaveLength(enrollmentStepDefinitions.length);

    enrollmentStepDefinitions.forEach((definition, index) => {
      expect(cards[index]).toHaveTextContent(definition.title);
      expect(cards[index]).toHaveTextContent(String(definition.step));
    });

    // The step the stale copy never mentioned.
    expect(screen.getByText("Paternal Kinship")).toBeInTheDocument();
  });

  it("presents creating an account as a prerequisite, not as one of the steps", () => {
    renderWithIntl(<HomeEnrollmentProcessSection />);

    expect(screen.getByText("Before you start")).toBeInTheDocument();
    expect(
      screen.getByText(/create your account and verify your email address/i),
    ).toBeInTheDocument();
    // …and it is not one of the numbered cards.
    for (const card of getStepCards()) {
      expect(card).not.toHaveTextContent(/create your account/i);
    }
  });

  it("renders the full process slice in Puerto Rican Spanish under the es locale", () => {
    renderWithIntl(<HomeEnrollmentProcessSection />, "es");

    // Section header
    expect(
      screen.getByText("Cómo Inscribirte en la Nación Taíno de Borikén"),
    ).toBeInTheDocument();
    // One "Paso" bubble per real step, and the localized titles.
    expect(screen.getAllByText("Paso")).toHaveLength(
      enrollmentStepDefinitions.length,
    );
    expect(screen.getByText("Datos demográficos")).toBeInTheDocument();
    expect(screen.getByText("Parentesco paterno")).toBeInTheDocument();
    // Prerequisite line
    expect(screen.getByText("Antes de empezar")).toBeInTheDocument();
    // Document checklist + tips
    expect(screen.getByText("¿Qué vas a necesitar?")).toBeInTheDocument();
    expect(screen.getByText("Certificado de Nacimiento")).toBeInTheDocument();
    expect(screen.getByText("Consejos Útiles")).toBeInTheDocument();
    // CTA
    expect(
      screen.getByRole("link", { name: /Comienza tu Solicitud/ }),
    ).toBeInTheDocument();
  });
});

describe("HomeEnrollmentProcessSection", () => {
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
