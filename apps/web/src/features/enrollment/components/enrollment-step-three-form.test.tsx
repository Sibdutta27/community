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
    stepThreePaternalKinship: ["enrollment", "step3", "paternal-kinship"],
  },
  useAccountInfoQuery: () => ({ data: undefined }),
  useEnrollmentStepThreeQuery: () => ({ data: undefined, error: null }),
  useEnrollmentStepThreeUpsertMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

import { EnrollmentStepThreeForm } from "@/features/enrollment/components/enrollment-step-three-form";

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EnrollmentStepThreeForm />
    </QueryClientProvider>,
  );
}

describe("EnrollmentStepThreeForm — paternal kinship", () => {
  it("renders one section per paternal ancestor", () => {
    renderForm();

    expect(screen.getByRole("heading", { name: "Father" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Paternal Grandmother" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Paternal Grandfather" }),
    ).toBeInTheDocument();
  });

  it("asks the Borikua Taíno heritage question for each ancestor", () => {
    renderForm();

    expect(
      screen.getByText("Is your father of Borikua Taíno heritage?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Is your paternal grandmother of Borikua Taíno heritage?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Is your paternal grandfather of Borikua Taíno heritage?"),
    ).toBeInTheDocument();
  });

  it("only captures a date of birth for the father", () => {
    renderForm();

    expect(screen.getAllByText("Date of Birth")).toHaveLength(1);
  });

  it("no longer renders the retired cultural-connection step", () => {
    renderForm();

    expect(
      screen.queryByRole("heading", { name: "Cultural Connections" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Loading cultural connection options..."),
    ).not.toBeInTheDocument();
  });
});
