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
    stepTwoMaternalKinship: ["enrollment", "step2", "maternal-kinship"],
  },
  useAccountInfoQuery: () => ({ data: undefined }),
  useEnrollmentStepTwoQuery: () => ({ data: undefined, error: null }),
  useEnrollmentStepTwoUpsertMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

import { EnrollmentStepTwoForm } from "@/features/enrollment/components/enrollment-step-two-form";

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EnrollmentStepTwoForm />
    </QueryClientProvider>,
  );
}

describe("EnrollmentStepTwoForm — maternal kinship", () => {
  it("renders one section per maternal ancestor", () => {
    renderForm();

    expect(screen.getByRole("heading", { name: "Mother" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Maternal Grandmother" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Maternal Grandfather" }),
    ).toBeInTheDocument();
  });

  it("asks the Borikua Taíno heritage question for each ancestor", () => {
    renderForm();

    expect(
      screen.getByText("Is your mother of Borikua Taíno heritage?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Is your maternal grandmother of Borikua Taíno heritage?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Is your maternal grandfather of Borikua Taíno heritage?"),
    ).toBeInTheDocument();
  });

  it("only captures a date of birth for the mother", () => {
    renderForm();

    expect(screen.getAllByText("Date of Birth")).toHaveLength(1);
  });

  it("no longer renders the retired 5-generation lineage fields", () => {
    renderForm();

    expect(screen.queryByText("Maiden Name")).not.toBeInTheDocument();
    expect(screen.queryByText("Living Status")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Approximate Birth Year"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Great-Grandmother" }),
    ).not.toBeInTheDocument();
  });
});
