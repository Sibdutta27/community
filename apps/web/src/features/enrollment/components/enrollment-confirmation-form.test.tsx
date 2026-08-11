import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const mutateAsyncMock = vi.fn();

const stepStateRef: {
  current: Partial<Record<"1" | "2" | "3" | "4" | "5", boolean>>;
} = { current: {} };

const consentRef: { current: Record<string, unknown>[] } = { current: [] };

function setStepState(
  stepState: Partial<Record<"1" | "2" | "3" | "4" | "5", boolean>>,
) {
  stepStateRef.current = stepState;
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/features/enrollment/lib/enrollment-queries", () => ({
  accountQueryKeys: { info: ["account", "info"] },
  useAccountInfoQuery: () => ({
    data: {
      enrollmentStep: {
        "1": false,
        "2": false,
        "3": false,
        "4": false,
        "5": false,
        ...stepStateRef.current,
      },
      enrollmentStatus: "DRAFT",
      enrollment: {
        status: "DRAFT",
        consentAccepted: true,
        consent: consentRef.current,
      },
    },
    isPending: false,
  }),
  useCompleteEnrollmentMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

import { EnrollmentConfirmationForm } from "@/features/enrollment/components/enrollment-confirmation-form";
import { withIntl, type TestLocale } from "@/test/i18n";

function renderForm(locale: TestLocale = "en") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    withIntl(
      <QueryClientProvider client={queryClient}>
        <EnrollmentConfirmationForm />
      </QueryClientProvider>,
      locale,
    ),
  );
}

describe("EnrollmentConfirmationForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    mutateAsyncMock.mockReset();
    mutateAsyncMock.mockResolvedValue({ success: true });
    // Default: everything the submit requires (steps 1-4) is complete.
    setStepState({ "1": true, "2": true, "3": true, "4": true });
    consentRef.current = [
      {
        id: "consent-1",
        key: "accuracy_declaration",
        version: 1,
        title: "Accuracy Declaration",
        accepted: true,
        acceptedAt: "2026-07-08T00:00:00.000Z",
        required: true,
      },
    ];
  });

  it("enables Submit and shows no missing-step notice when steps 1-4 are complete", () => {
    renderForm();

    expect(
      screen.getByRole("button", { name: /submit application/i }),
    ).toBeEnabled();
    expect(screen.queryByText(/almost there/i)).not.toBeInTheDocument();
  });

  it("disables Submit and lists the unfinished steps, linked, when steps are missing", () => {
    setStepState({ "2": true, "3": true });
    renderForm();

    expect(
      screen.getByRole("button", { name: /submit application/i }),
    ).toBeDisabled();

    const notice = screen.getByText(/almost there/i);
    expect(notice).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Demographics" })).toHaveAttribute(
      "href",
      "/enrollment/step-1",
    );
    expect(screen.getByRole("link", { name: "Documents" })).toHaveAttribute(
      "href",
      "/enrollment/step-4",
    );
    expect(
      screen.queryByRole("link", { name: "Maternal Kinship" }),
    ).not.toBeInTheDocument();
  });

  it("renders the e-signature fields under a declaration reaffirming the terms", () => {
    renderForm();

    expect(screen.getByText("Sign your full legal name")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();

    // The declaration is what carries the terms attestation now — sign-up never
    // persists one, so this paragraph plus the signature IS the legal record.
    const declaration = document.querySelector(
      "[data-slot='enrollment-confirmation-declaration']",
    );
    expect(declaration).not.toBeNull();
    expect(declaration).toHaveTextContent(/electronic signature/i);
    expect(
      screen.getByRole("link", { name: "Terms of Service" }),
    ).toHaveAttribute("href", "/terms-of-service");
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy-policy");

    expect(
      screen.getByRole("button", { name: /submit application/i }),
    ).toBeInTheDocument();
  });

  it("asks for NO consent — the checkboxes moved to the one consent surface", () => {
    renderForm();

    // The whole point of the change: step 5 is a signature, not a third ask.
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(
      screen.queryByText("I agree to submit my information"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("I agree to the terms of service"),
    ).not.toBeInTheDocument();
  });

  it("shows the already-accepted consents read-only instead of re-asking", () => {
    renderForm();

    expect(screen.getByText("Consents you accepted")).toBeInTheDocument();
    expect(screen.getByText("Accuracy Declaration")).toBeInTheDocument();
    expect(screen.getByText(/Accepted/)).toBeInTheDocument();
  });

  it("blocks submission until the signature name is provided", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(
      screen.getByRole("button", { name: /submit application/i }),
    );

    expect(
      await screen.findByText("Please sign with your full legal name."),
    ).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("submits the e-signature alone and routes to the success screen", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByPlaceholderText("Full legal name"),
      "Anani Guarocuya",
    );
    await user.click(
      screen.getByRole("button", { name: /submit application/i }),
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        signatureName: "Anani Guarocuya",
        signatureDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      });
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/enrollment/success");
    });
  });

  it("'Save & finish later' returns to the dashboard without submitting or validating", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(
      screen.getByRole("button", { name: /save & finish later/i }),
    );

    expect(pushMock).toHaveBeenCalledWith("/dashboard?draftSaved=1");
    expect(mutateAsyncMock).not.toHaveBeenCalled();
    expect(
      screen.queryByText("Please sign with your full legal name."),
    ).not.toBeInTheDocument();
  });
});
