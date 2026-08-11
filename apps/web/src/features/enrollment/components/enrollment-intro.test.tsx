import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const acceptConsentsMock = vi.fn();
const startEnrollmentMock = vi.fn();

const activeConsents = [
  {
    id: "consent-1",
    key: "accuracy_declaration",
    title: "Accuracy Declaration",
    content: "I certify that all information provided is true and accurate.",
    required: true,
    version: 1,
  },
  {
    id: "consent-2",
    key: "community_directory",
    title: "Community Directory (Optional)",
    content: "I agree to be listed in the Yukayeke member directory.",
    required: false,
    version: 1,
  },
];

let accountInfoData: Record<string, unknown> | undefined;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/features/enrollment/lib/enrollment-queries", () => ({
  accountQueryKeys: { info: ["account", "info"] },
  enrollmentQueryKeys: {
    activeConsents: ["enrollment", "consent", "active"],
  },
  useAccountInfoQuery: () => ({ data: accountInfoData }),
  useActiveConsentsQuery: () => ({ data: activeConsents }),
  useAcceptEnrollmentConsentsMutation: () => ({
    mutateAsync: acceptConsentsMock,
    isPending: false,
  }),
  useStartEnrollmentMutation: () => ({
    mutateAsync: startEnrollmentMock,
    isPending: false,
  }),
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { EnrollmentIntro } from "@/features/enrollment/components/enrollment-intro";
import { enrollmentStepDefinitions } from "@/features/enrollment/config/enrollment-steps";
import {
  enrollmentStepFourEvidenceUploadSlots,
  enrollmentStepFourIdentityUploadSlots,
  enrollmentStepFourUserPhotoCard,
} from "@/features/enrollment/lib/enrollment-step-four-form";
import { messagesByLocale, withIntl, type TestLocale } from "@/test/i18n";

/** Consent already on record — the intro should not ask again. */
const consentedAccountInfo = {
  hasEnrollment: true,
  enrollment: {
    status: "DRAFT",
    consentAccepted: true,
    consent: [
      {
        id: "consent-1",
        key: "accuracy_declaration",
        version: 1,
        title: "Accuracy Declaration",
        accepted: true,
        acceptedAt: "2026-07-08T00:00:00.000Z",
        required: true,
      },
    ],
  },
};

/** An enrollment that has never consented. */
const unconsentedAccountInfo = {
  hasEnrollment: true,
  enrollment: { status: "DRAFT", consentAccepted: false, consent: [] },
};

function renderIntro(locale: TestLocale = "en") {
  return render(
    withIntl(
      <QueryClientProvider client={new QueryClient()}>
        <EnrollmentIntro />
      </QueryClientProvider>,
      locale,
    ),
  );
}

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

function getConsentRows() {
  return Array.from(
    document.querySelectorAll("[data-slot='consent-checklist-item']"),
  ) as HTMLElement[];
}

beforeEach(() => {
  pushMock.mockReset();
  acceptConsentsMock.mockReset();
  acceptConsentsMock.mockResolvedValue({});
  startEnrollmentMock.mockReset();
  startEnrollmentMock.mockResolvedValue({});
  accountInfoData = consentedAccountInfo;
});

describe("EnrollmentIntro — what the application asks for", () => {
  it("lists every real enrollment step, in order, including the paternal-kinship step the old copy omitted", () => {
    renderIntro();

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
    renderIntro();

    expect(screen.getByText("Who you are enrolling with")).toBeInTheDocument();
    expect(
      screen.getByText(messagesByLocale.en.enrollment.intro.nation.paragraph1),
    ).toBeInTheDocument();
  });
});

describe("EnrollmentIntro — what you'll need", () => {
  it("lists every step-4 upload slot and marks the required ones", () => {
    renderIntro();

    const rows = getDocumentRows();
    expect(rows).toHaveLength(
      1 +
        enrollmentStepFourIdentityUploadSlots.length +
        enrollmentStepFourEvidenceUploadSlots.length,
    );

    // Derived from the slot configs rather than hardcoded: which uploads are
    // mandatory is a product rule that moves (the government ID became
    // required in T2), and this list must follow it automatically.
    const slotRequirements = [
      enrollmentStepFourUserPhotoCard,
      ...enrollmentStepFourIdentityUploadSlots,
      ...enrollmentStepFourEvidenceUploadSlots,
    ].map((slot) => Boolean(slot.required));

    expect(rows[0]).toHaveTextContent("Your Photo");

    rows.forEach((row, index) => {
      expect(
        within(row).getByText(
          slotRequirements[index] ? "Required" : "Optional",
        ),
      ).toBeInTheDocument();
    });

    expect(screen.getAllByText("Required")).toHaveLength(
      slotRequirements.filter(Boolean).length,
    );

    // …but the 2-of-3 proof-of-identity rule is still spelled out.
    expect(
      screen.getByText(/at least 2 of the three proof-of-identity documents/i),
    ).toBeInTheDocument();
  });
});

describe("EnrollmentIntro — the single consent surface", () => {
  it("asks for consent here, before step 1, when the enrollment has none on record", () => {
    accountInfoData = unconsentedAccountInfo;
    renderIntro();

    expect(screen.getByText("Your consent")).toBeInTheDocument();
    expect(getConsentRows()).toHaveLength(activeConsents.length);
    expect(screen.getByText("Accuracy Declaration")).toBeInTheDocument();

    // Nothing is pre-ticked, so the CTA is blocked until the member accepts.
    expect(
      screen.getByRole("button", { name: /accept and start step 1/i }),
    ).toBeDisabled();
  });

  it("accepts the consents and enters step 1 once the required boxes are ticked", async () => {
    accountInfoData = unconsentedAccountInfo;
    const user = userEvent.setup();
    renderIntro();

    await user.click(screen.getAllByRole("checkbox")[0]);

    const cta = screen.getByRole("button", {
      name: /accept and start step 1/i,
    });
    expect(cta).toBeEnabled();
    await user.click(cta);

    await waitFor(() => {
      expect(acceptConsentsMock).toHaveBeenCalledWith({ acceptRequired: true });
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/enrollment/step-1");
    });
    // The enrollment already exists — never restart it (that resets a
    // non-DRAFT enrollment back to DRAFT).
    expect(startEnrollmentMock).not.toHaveBeenCalled();
  });

  it("starts the enrollment first when the member arrives without one", async () => {
    accountInfoData = { hasEnrollment: false, enrollment: null };
    const user = userEvent.setup();
    renderIntro();

    await user.click(screen.getAllByRole("checkbox")[0]);
    await user.click(
      screen.getByRole("button", { name: /accept and start step 1/i }),
    );

    await waitFor(() => {
      expect(startEnrollmentMock).toHaveBeenCalled();
    });
    expect(acceptConsentsMock).toHaveBeenCalledWith({ acceptRequired: true });
  });

  it("re-asks for a newly published required consent, pre-ticking what is already on record", () => {
    // The residual edge case: consent is accepted, but the catalog gained a
    // required entry since. The band comes back for that one alone.
    accountInfoData = consentedAccountInfo;
    activeConsents[1].required = true;

    try {
      renderIntro();

      expect(screen.getByText("Your consent")).toBeInTheDocument();

      // The already-accepted consent stays ticked, so the member only has to
      // read and accept what is genuinely new.
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(
        screen.getByRole("button", { name: /accept and start step 1/i }),
      ).toBeDisabled();
    } finally {
      activeConsents[1].required = false;
    }
  });

  it("does not ask again once consent is on record — the CTA is a plain link", () => {
    renderIntro();

    expect(screen.queryByText("Your consent")).not.toBeInTheDocument();
    expect(getConsentRows()).toHaveLength(0);
    expect(screen.getByRole("link", { name: /start step 1/i })).toHaveAttribute(
      "href",
      "/enrollment/step-1",
    );
  });
});

describe("EnrollmentIntro — actions", () => {
  it("routes Back to the dashboard and the primary CTA into step 1", () => {
    renderIntro();

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
    renderIntro("es");

    expect(
      screen.getByText("Con quién se está inscribiendo"),
    ).toBeInTheDocument();
    expect(screen.getByText("Qué le pide la solicitud")).toBeInTheDocument();
    expect(screen.getByText("Qué va a necesitar")).toBeInTheDocument();
    expect(screen.getByText("Cómo funciona")).toBeInTheDocument();

    // The five steps translate too, paternal kinship included.
    expect(getStepRows()).toHaveLength(5);
    expect(screen.getByText("Parentesco paterno")).toBeInTheDocument();

    // Required/Optional pills and the CTA. Count derived from the slot
    // configs, for the same reason as the English case above.
    expect(screen.getAllByText("Obligatorio")).toHaveLength(
      [
        enrollmentStepFourUserPhotoCard,
        ...enrollmentStepFourIdentityUploadSlots,
        ...enrollmentStepFourEvidenceUploadSlots,
      ].filter((slot) => slot.required).length,
    );
    expect(
      screen.getByRole("link", { name: /comenzar el paso 1/i }),
    ).toHaveAttribute("href", "/enrollment/step-1");
  });

  it("translates the consent band and its CTA", () => {
    accountInfoData = unconsentedAccountInfo;
    renderIntro("es");

    expect(screen.getByText("Su consentimiento")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /aceptar y comenzar el paso 1/i }),
    ).toBeInTheDocument();
  });
});
