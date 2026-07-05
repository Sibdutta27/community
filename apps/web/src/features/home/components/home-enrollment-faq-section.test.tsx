import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeEnrollmentFaqSection } from "@/features/home/components/home-enrollment-faq-section";
import { renderWithIntl } from "@/test/i18n";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

describe("HomeEnrollmentFaqSection", () => {
  it("renders the English FAQ under the default locale", () => {
    renderWithIntl(<HomeEnrollmentFaqSection />);

    expect(
      screen.getByText("Who is eligible to enroll in the Taíno Nation?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Is there a fee to enroll?"),
    ).toBeInTheDocument();
    // The timeline item is open by default, so its answer is visible.
    expect(
      screen.getByText(/typically takes 20 to 30 minutes/),
    ).toBeInTheDocument();
  });

  it("renders the FAQ in Puerto Rican Spanish under the es locale", () => {
    renderWithIntl(<HomeEnrollmentFaqSection />, "es");

    expect(
      screen.getByText("¿Preguntas sobre la Inscripción?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("¿Quién es elegible para inscribirse en la Nación Taíno?"),
    ).toBeInTheDocument();
    expect(screen.getByText("¿Hay que pagar para inscribirse?")).toBeInTheDocument();
    // The default-open timeline answer is translated too.
    expect(
      screen.getByText(/normalmente toma de 20 a 30 minutos/),
    ).toBeInTheDocument();
  });
});
