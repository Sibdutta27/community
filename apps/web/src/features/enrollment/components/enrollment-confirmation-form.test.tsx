import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const mutateAsyncMock = vi.fn();

const stepStateRef: {
  current: Partial<Record<"1" | "2" | "3" | "4" | "5", boolean>>;
} = { current: {} };

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
    },
    isPending: false,
  }),
  useCompleteEnrollmentMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

import { EnrollmentConfirmationForm } from "@/features/enrollment/components/enrollment-confirmation-form";

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EnrollmentConfirmationForm />
    </QueryClientProvider>,
  );
}

describe("EnrollmentConfirmationForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    mutateAsyncMock.mockReset();
    mutateAsyncMock.mockResolvedValue({ success: true });
    // Default: everything the submit requires (steps 1-4) is complete.
    setStepState({ "1": true, "2": true, "3": true, "4": true });
  });

  it("enables Submit and shows no missing-step notice when steps 1-4 are complete", () => {
    renderForm();

    expect(
      screen.getByRole("button", { name: /submit application/i }),
    ).toBeEnabled();
    expect(screen.queryByText(/finish/i)).not.toBeInTheDocument();
  });

  it("disables Submit and lists the unfinished steps, linked, when steps are missing", () => {
    setStepState({ "2": true, "3": true });
    renderForm();

    expect(
      screen.getByRole("button", { name: /submit application/i }),
    ).toBeDisabled();

    const notice = screen.getByText(/finish/i);
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

  it("renders the e-signature fields and both agreements", () => {
    renderForm();

    expect(screen.getByText("Sign your full legal name")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(
      screen.getByText("I agree to submit my information"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("I agree to the terms of service"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit application/i }),
    ).toBeInTheDocument();
  });

  it("blocks submission until the name and both checkboxes are provided", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(
      screen.getByRole("button", { name: /submit application/i }),
    );

    expect(
      await screen.findByText("Please sign with your full legal name."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You must agree to submit your information."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You must agree to the terms of service."),
    ).toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("submits the e-signature and routes to the success screen", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByPlaceholderText("Full legal name"),
      "Anani Guarocuya",
    );
    await user.click(screen.getByText("I agree to submit my information"));
    await user.click(screen.getByText("I agree to the terms of service"));
    await user.click(
      screen.getByRole("button", { name: /submit application/i }),
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          signatureName: "Anani Guarocuya",
          agreedToTerms: true,
        }),
      );
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/enrollment/success");
    });
  });
});
