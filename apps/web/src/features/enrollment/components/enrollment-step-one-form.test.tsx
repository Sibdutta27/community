import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock, saveDraftMutateAsync, upsertMutateAsync } = vi.hoisted(
  () => ({
    pushMock: vi.fn(),
    saveDraftMutateAsync: vi.fn(),
    upsertMutateAsync: vi.fn(),
  }),
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

vi.mock("@/features/enrollment/lib/enrollment-queries", () => ({
  accountQueryKeys: { info: ["account", "info"] },
  enrollmentQueryKeys: {
    stepOneDemographics: ["enrollment", "step1", "demographics"],
  },
  useAccountInfoQuery: () => ({ data: undefined }),
  useEnrollmentStepOneQuery: () => ({ data: undefined, error: null }),
  useEnrollmentStepOneUpsertMutation: () => ({
    mutateAsync: upsertMutateAsync,
    isPending: false,
  }),
  useEnrollmentStepOneSaveDraftMutation: () => ({
    mutateAsync: saveDraftMutateAsync,
    isPending: false,
  }),
}));

beforeEach(() => {
  pushMock.mockReset();
  saveDraftMutateAsync.mockReset().mockResolvedValue({ success: true });
  upsertMutateAsync.mockReset().mockResolvedValue({ success: true });
});

import { EnrollmentStepOneForm } from "@/features/enrollment/components/enrollment-step-one-form";

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EnrollmentStepOneForm />
    </QueryClientProvider>,
  );
}

describe("EnrollmentStepOneForm — demographics only", () => {
  it("renders one flowing field grid, keeping only the Yucayekeno sub-header", () => {
    renderForm();

    // The Figma layout drops the old per-card section headers…
    expect(
      screen.queryByRole("heading", { name: "Basic Information" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Birth Information" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Sex & Gender" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Marital Status & Occupation" }),
    ).not.toBeInTheDocument();
    // …but keeps the distinct Yucayekeno sub-header + explainer.
    expect(
      screen.getByRole("heading", { name: "Your Yucayekeno Information" }),
    ).toBeInTheDocument();
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Date of Birth")).toBeInTheDocument();
  });

  it("adds info tooltips to the Sex and Gender labels", () => {
    renderForm();

    expect(screen.getByTitle("Sex assigned at birth")).toBeInTheDocument();
    expect(screen.getByTitle("Gender identity")).toBeInTheDocument();
  });

  it("renders the yucayeke fields", () => {
    renderForm();

    expect(screen.getByText("Identity")).toBeInTheDocument();
    expect(screen.getByText("Yucayeke")).toBeInTheDocument();
    expect(screen.getByText("I don't know my Yucayeke")).toBeInTheDocument();
    expect(screen.getByText("Do you have children?")).toBeInTheDocument();
  });

  it("hides the 'under 18' question until children is set to Yes", () => {
    renderForm();

    expect(
      screen.queryByText("Any children under 18?"),
    ).not.toBeInTheDocument();
  });

  it("no longer renders the removed contact/address/emergency sections", () => {
    renderForm();

    expect(
      screen.queryByRole("heading", { name: "Contact Information" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Current Address" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Mailing Address" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Emergency Contact" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Additional Information" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Middle Name")).not.toBeInTheDocument();
    expect(screen.queryByText("Pronouns")).not.toBeInTheDocument();
  });
});

describe("EnrollmentStepOneForm — Save & finish later (partial draft)", () => {
  it("saves the current values without validation and returns to the dashboard", async () => {
    renderForm();

    // Fill only ONE field — the required fields stay empty on purpose.
    fireEvent.change(screen.getByPlaceholderText("Enter your first name"), {
      target: { value: "Anani" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /save & finish later/i }),
    );

    await waitFor(() => {
      expect(saveDraftMutateAsync).toHaveBeenCalledTimes(1);
    });

    // Partial payload: only the provided field (+ the definite checkbox state).
    expect(saveDraftMutateAsync).toHaveBeenCalledWith({
      firstName: "Anani",
      yucayekeUnknown: false,
    });
    // The full upsert (with required-field validation) is never triggered…
    expect(upsertMutateAsync).not.toHaveBeenCalled();
    // …and no required-field errors are surfaced.
    expect(screen.queryByText(/last name is required/i)).toBeNull();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard?draftSaved=1");
    });
  });

  it("surfaces a server error instead of navigating when the draft save fails", async () => {
    saveDraftMutateAsync.mockRejectedValueOnce(
      new Error("Enrollment is not in draft status"),
    );
    renderForm();

    fireEvent.click(
      screen.getByRole("button", { name: /save & finish later/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Enrollment is not in draft status"),
      ).toBeInTheDocument();
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
