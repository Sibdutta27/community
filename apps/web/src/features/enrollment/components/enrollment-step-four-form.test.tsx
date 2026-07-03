import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  pushMock.mockReset();
});

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

vi.mock("@/features/enrollment/lib/enrollment-queries", () => ({
  accountQueryKeys: { info: ["account", "info"] },
  enrollmentQueryKeys: {
    stepFourDocumentList: ["enrollment", "step4", "document-list"],
  },
  useEnrollmentStepFourDocumentListQuery: () => ({
    data: [],
    error: null,
    isPending: false,
    isRefetching: false,
    refetch: vi.fn(),
  }),
  useEnrollmentDocumentUploadMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useEnrollmentStepFourNextMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

import { EnrollmentStepFourForm } from "@/features/enrollment/components/enrollment-step-four-form";

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EnrollmentStepFourForm />
    </QueryClientProvider>,
  );
}

describe("EnrollmentStepFourForm — document evidence slots", () => {
  it("renders the required user photo slot", () => {
    renderForm();

    expect(
      screen.getByRole("heading", { name: /Your Photo/ }),
    ).toBeInTheDocument();
  });

  it("renders the four supporting evidence slots", () => {
    renderForm();

    expect(
      screen.getByRole("heading", { name: /Genealogical Records/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Kinship Letters/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Oral History/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /DNA Testing/ }),
    ).toBeInTheDocument();
  });

  it("no longer renders the retired family document slots", () => {
    renderForm();

    expect(
      screen.queryByText(/Mother's Birth Certificate/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Grandmother's Photo/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Additional Evidence/ }),
    ).not.toBeInTheDocument();
  });

  it("blocks continuing until the user photo is uploaded", () => {
    renderForm();

    expect(screen.getByRole("button", { name: /^Next$/ })).toBeDisabled();
    expect(screen.getByText(/Your Photo/i, { selector: "p" })).toBeTruthy();
  });

  it("'Save & finish later' just returns to the dashboard (files already saved per upload)", () => {
    renderForm();

    fireEvent.click(
      screen.getByRole("button", { name: /save & finish later/i }),
    );

    expect(pushMock).toHaveBeenCalledWith("/dashboard?draftSaved=1");
  });
});
