import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/features/enrollment/lib/enrollment-queries", () => ({
  accountQueryKeys: { info: ["account", "info"] },
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
