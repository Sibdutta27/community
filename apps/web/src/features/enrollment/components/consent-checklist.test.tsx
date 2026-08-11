import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConsentChecklist } from "@/features/enrollment/components/consent-checklist";
import { renderWithIntl as render, type TestLocale } from "@/test/i18n";
import type { ActiveConsent } from "@/types/enrollment";

const REWORDED_COMMUNICATION_COPY =
  "I consent to receive communications from the Taíno Nation of Borikén regarding my enrollment application and community updates via email, phone, and/or SMS.";

const activeConsents: readonly ActiveConsent[] = [
  {
    id: "consent-1",
    key: "communication_consent",
    title: "Communication Consent",
    content: REWORDED_COMMUNICATION_COPY,
    required: true,
    version: 1,
  },
  {
    id: "consent-2",
    key: "evergreen_memory",
    title: "Evergreen Collective Memory / Indigenous Archives of Puerto Rico",
    content:
      "I consent to have my ancestor's information added to the Evergreen Collective Memory.",
    required: false,
    version: 1,
  },
];

function renderChecklist(
  locale: TestLocale = "en",
  overrides: Partial<React.ComponentProps<typeof ConsentChecklist>> = {},
) {
  return render(
    <ConsentChecklist
      activeConsents={activeConsents}
      selectedConsentIds={[]}
      onToggleConsent={vi.fn()}
      {...overrides}
    />,
    locale,
  );
}

describe("ConsentChecklist", () => {
  it("renders every active consent's title and content", () => {
    renderChecklist();

    expect(screen.getByText("Communication Consent")).toBeInTheDocument();
    expect(screen.getByText(REWORDED_COMMUNICATION_COPY)).toBeInTheDocument();
    expect(
      screen.getByText(
        "Evergreen Collective Memory / Indigenous Archives of Puerto Rico",
      ),
    ).toBeInTheDocument();
  });

  it("marks required consents with an asterisk and leaves optional ones unmarked", () => {
    renderChecklist();

    const requiredTitle = screen.getByText("Communication Consent");
    expect(requiredTitle).toHaveTextContent("*");

    const optionalTitle = screen.getByText(
      "Evergreen Collective Memory / Indigenous Archives of Puerto Rico",
    );
    expect(optionalTitle).not.toHaveTextContent("*");
  });

  it("reflects the selection it is given and reports toggles to the owner", async () => {
    // Purely presentational: it holds no selection state of its own, which is
    // what lets the enrollment introduction seed it from the server record.
    const onToggleConsent = vi.fn();
    const user = userEvent.setup();

    renderChecklist("en", {
      onToggleConsent,
      selectedConsentIds: ["consent-1"],
    });

    const [required, optional] = screen.getAllByRole("checkbox");
    expect(required).toBeChecked();
    expect(optional).not.toBeChecked();

    await user.click(optional);
    expect(onToggleConsent).toHaveBeenCalledWith("consent-2");
  });

  it("disables every box while the acceptance is in flight", () => {
    renderChecklist("en", { isSubmitting: true });

    screen.getAllByRole("checkbox").forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it("translates the chrome to PR-Spanish while keeping the backend-sourced consent copy untouched", () => {
    renderChecklist("es");

    // Chrome comes from the catalog…
    expect(
      screen.getByRole("link", { name: /términos y condiciones/i }),
    ).toHaveAttribute("href", "/privacy-policy");
    // …while the consent items themselves stay exactly as the backend sent them.
    expect(screen.getByText("Communication Consent")).toBeInTheDocument();
    expect(screen.getByText(REWORDED_COMMUNICATION_COPY)).toBeInTheDocument();
  });

  it("uses semantic tokens instead of hardcoded earthy colors", () => {
    const { container } = renderChecklist();
    const html = container.innerHTML;

    expect(html).not.toMatch(/#1f8ca5/i);
    expect(html).not.toMatch(/#fffdec/i);
    expect(html).not.toMatch(/#12393d/i);
    expect(html).not.toMatch(/#20A3B9/i);
    expect(html).not.toMatch(/#c63d3d/i);
    expect(html).not.toMatch(/#d5e1da/i);
    expect(html).not.toMatch(/#dbe5df/i);
    expect(html).not.toContain("brand-sky");
    expect(html).not.toContain("brand-brown");
    expect(html).not.toContain("text-slate-600");

    expect(container.querySelector(".border-border")).not.toBeNull();
    expect(container.querySelector(".text-muted-foreground")).not.toBeNull();
  });
});
