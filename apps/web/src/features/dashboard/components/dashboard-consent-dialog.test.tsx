import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardConsentDialog } from "@/features/dashboard/components/dashboard-consent-dialog";
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

function renderDialog() {
  return render(
    <DashboardConsentDialog
      activeConsents={activeConsents}
      errorMessage={null}
      isOpen
      isSubmitting={false}
      selectedConsentIds={[]}
      onClose={vi.fn()}
      onSubmit={vi.fn()}
      onToggleConsent={vi.fn()}
    />,
  );
}

describe("DashboardConsentDialog", () => {
  it("renders every active consent's title and content", () => {
    renderDialog();

    expect(screen.getByText("Communication Consent")).toBeInTheDocument();
    expect(screen.getByText(REWORDED_COMMUNICATION_COPY)).toBeInTheDocument();
    expect(
      screen.getByText(
        "Evergreen Collective Memory / Indigenous Archives of Puerto Rico",
      ),
    ).toBeInTheDocument();
  });

  it("marks required consents with an asterisk and leaves optional ones unmarked", () => {
    renderDialog();

    const requiredTitle = screen.getByText("Communication Consent");
    expect(requiredTitle).toHaveTextContent("*");

    const optionalTitle = screen.getByText(
      "Evergreen Collective Memory / Indigenous Archives of Puerto Rico",
    );
    expect(optionalTitle).not.toHaveTextContent("*");
  });

  it("uses semantic tokens instead of hardcoded earthy colors", () => {
    renderDialog();

    const dialog = screen.getByRole("dialog");
    const html = dialog.innerHTML;

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

    expect(dialog.querySelector(".border-border")).not.toBeNull();
    expect(dialog.querySelector(".text-muted-foreground")).not.toBeNull();
  });
});
