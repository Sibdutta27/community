import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
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
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

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
