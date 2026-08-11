import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EnrollmentIntro } from "@/features/enrollment/components/enrollment-intro";
import { enrollmentStepDefinitions } from "@/features/enrollment/config/enrollment-steps";
import {
  enrollmentStepFourEvidenceUploadSlots,
  enrollmentStepFourIdentityUploadSlots,
  enrollmentStepFourUserPhotoCard,
} from "@/features/enrollment/lib/enrollment-step-four-form";
import { messagesByLocale, renderWithIntl } from "@/test/i18n";

function getStepRows() {
  return Array.from(
    document.querySelectorAll("[data-slot='enrollment-intro-step']"),
  ) as HTMLElement[];
}

function getDocumentRows() {
  return Array.from(
    document.querySelectorAll("[data-slot='enrollment-intro-document']"),
  ) as HTMLElement[];
}

describe("EnrollmentIntro — what the application asks for", () => {
  it("lists every real enrollment step, in order, including the paternal-kinship step the old copy omitted", () => {
    renderWithIntl(<EnrollmentIntro />);

    const rows = getStepRows();
    expect(rows).toHaveLength(enrollmentStepDefinitions.length);
    expect(rows).toHaveLength(5);

    // Derived from `enrollmentStepDefinitions`, so the intro cannot drift
    // from the flow members actually walk through.
    enrollmentStepDefinitions.forEach((definition, index) => {
      expect(rows[index]).toHaveTextContent(String(definition.step));
      expect(rows[index]).toHaveTextContent(definition.title);
    });

    // The regression the client reported: the process copy claimed a
    // maternal-only flow and never mentioned paternal kinship.
    expect(screen.getByText("Paternal Kinship")).toBeInTheDocument();
  });

  it("introduces the Nation the member is enrolling with", () => {
    renderWithIntl(<EnrollmentIntro />);

    expect(screen.getByText("Who you are enrolling with")).toBeInTheDocument();
    expect(
      screen.getByText(messagesByLocale.en.enrollment.intro.nation.paragraph1),
    ).toBeInTheDocument();
  });
});

describe("EnrollmentIntro — what you'll need", () => {
  it("lists every step-4 upload slot and marks the required ones", () => {
    renderWithIntl(<EnrollmentIntro />);

    const rows = getDocumentRows();
    expect(rows).toHaveLength(
      1 +
        enrollmentStepFourIdentityUploadSlots.length +
        enrollmentStepFourEvidenceUploadSlots.length,
    );

    // The photo is the one mandatory upload (`required: true` on the slot).
    expect(enrollmentStepFourUserPhotoCard.required).toBe(true);
    const photoRow = rows[0];
    expect(photoRow).toHaveTextContent("Your Photo");
    expect(within(photoRow).getByText("Required")).toBeInTheDocument();

    // Everything else is optional per its slot config…
    for (const row of rows.slice(1)) {
      expect(within(row).getByText("Optional")).toBeInTheDocument();
    }
    expect(screen.getAllByText("Required")).toHaveLength(1);

    // …but the 2-of-3 proof-of-identity rule is still spelled out.
    expect(
      screen.getByText(/at least 2 of the three proof-of-identity documents/i),
    ).toBeInTheDocument();
  });
});

describe("EnrollmentIntro — actions", () => {
  it("routes Back to the dashboard and the primary CTA into step 1", () => {
    renderWithIntl(<EnrollmentIntro />);

    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: /start step 1/i })).toHaveAttribute(
      "href",
      "/enrollment/step-1",
    );
  });
});

describe("EnrollmentIntro — localization", () => {
  it("renders the whole introduction in PR-Spanish under the es catalog", () => {
    renderWithIntl(<EnrollmentIntro />, "es");

    expect(
      screen.getByText("Con quién se está inscribiendo"),
    ).toBeInTheDocument();
    expect(screen.getByText("Qué le pide la solicitud")).toBeInTheDocument();
    expect(screen.getByText("Qué va a necesitar")).toBeInTheDocument();
    expect(screen.getByText("Cómo funciona")).toBeInTheDocument();

    // The five steps translate too, paternal kinship included.
    expect(getStepRows()).toHaveLength(5);
    expect(screen.getByText("Parentesco paterno")).toBeInTheDocument();

    // Required/Optional pills and the CTA.
    expect(screen.getAllByText("Obligatorio")).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: /comenzar el paso 1/i }),
    ).toHaveAttribute("href", "/enrollment/step-1");
  });
});
