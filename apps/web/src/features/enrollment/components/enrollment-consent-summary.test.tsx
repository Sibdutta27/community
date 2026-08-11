import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EnrollmentConsentSummary } from "@/features/enrollment/components/enrollment-consent-summary";
import { renderWithIntl, type TestLocale } from "@/test/i18n";
import type { AccountEnrollmentConsent } from "@/types/enrollment";

const acceptedRequired: AccountEnrollmentConsent = {
  id: "consent-1",
  key: "accuracy_declaration",
  version: 1,
  title: "Accuracy Declaration",
  accepted: true,
  acceptedAt: "2026-07-08T15:04:00.000Z",
  required: true,
};

const pendingOptional: AccountEnrollmentConsent = {
  id: "consent-2",
  key: "community_directory",
  version: 3,
  title: "Community Directory (Optional)",
  accepted: false,
  acceptedAt: null,
  required: false,
};

function renderSummary(
  consents: readonly AccountEnrollmentConsent[],
  locale: TestLocale = "en",
) {
  return renderWithIntl(
    <EnrollmentConsentSummary consents={consents} />,
    locale,
  );
}

function getItems() {
  return Array.from(
    document.querySelectorAll("[data-slot='enrollment-consent-summary-item']"),
  ) as HTMLElement[];
}

describe("EnrollmentConsentSummary", () => {
  it("shows an accepted consent with its title, requirement, version and date", () => {
    renderSummary([acceptedRequired]);

    const [item] = getItems();
    expect(within(item).getByText("Accuracy Declaration")).toBeInTheDocument();
    expect(within(item).getByText("Required")).toBeInTheDocument();
    expect(item).toHaveTextContent("Version 1");
    // Mirrors the admin panel's ConsentReview: reviewer and member read the
    // same record, so the acceptance date must be visible here too.
    expect(item).toHaveTextContent(/Accepted July 8, 2026/);
  });

  it("marks a consent that was never accepted without blocking anything", () => {
    renderSummary([acceptedRequired, pendingOptional]);

    const [, optional] = getItems();
    expect(within(optional).getByText("Optional")).toBeInTheDocument();
    expect(optional).toHaveTextContent("Not accepted yet");
    expect(optional).toHaveTextContent("Version 3");

    // Read-only: the summary never re-asks, so it renders no inputs at all.
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("degrades to a link back to the consent screen when there is no record", () => {
    const { container } = renderSummary([]);

    expect(getItems()).toHaveLength(0);
    expect(
      container.querySelector("[data-slot='enrollment-consent-summary-empty']"),
    ).not.toBeNull();
    expect(
      screen.getByRole("link", { name: /review your consents/i }),
    ).toHaveAttribute("href", "/enrollment/start");
  });

  it("renders the record in PR-Spanish under the es catalog", () => {
    renderSummary([acceptedRequired, pendingOptional], "es");

    const [required, optional] = getItems();
    expect(within(required).getByText("Obligatorio")).toBeInTheDocument();
    expect(required).toHaveTextContent("Versión 1");
    expect(required).toHaveTextContent(/Aceptado el 8 de julio de 2026/);

    expect(within(optional).getByText("Opcional")).toBeInTheDocument();
    expect(optional).toHaveTextContent("Aún no aceptado");

    // Consent titles are backend-owned and stay verbatim in either locale.
    expect(screen.getByText("Accuracy Declaration")).toBeInTheDocument();
  });
});
