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
    stepOnePersonalInfo: ["enrollment", "step1", "personal-info"],
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

describe("EnrollmentStepOneForm — demographics + yucayeke fields", () => {
  it("renders the Your Yucayekeno Information section and its fields", () => {
    renderForm();

    expect(
      screen.getByRole("heading", { name: "Your Yucayekeno Information" }),
    ).toBeInTheDocument();
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
});
