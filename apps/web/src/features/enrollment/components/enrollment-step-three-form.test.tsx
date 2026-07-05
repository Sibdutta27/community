import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock, saveDraftMutateAsync } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  saveDraftMutateAsync: vi.fn(),
}));

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
    stepThreePaternalKinship: ["enrollment", "step3", "paternal-kinship"],
  },
  useAccountInfoQuery: () => ({ data: undefined }),
  useEnrollmentStepThreeQuery: () => ({ data: undefined, error: null }),
  useEnrollmentStepThreeUpsertMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useEnrollmentStepThreeSaveDraftMutation: () => ({
    mutateAsync: saveDraftMutateAsync,
    isPending: false,
  }),
}));

beforeEach(() => {
  pushMock.mockReset();
  saveDraftMutateAsync.mockReset().mockResolvedValue({ success: true });
});

import { EnrollmentStepLayout } from "@/features/enrollment/components/enrollment-step-layout";
import { EnrollmentStepThreeForm } from "@/features/enrollment/components/enrollment-step-three-form";
import { withIntl } from "@/test/i18n";

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    withIntl(
      <QueryClientProvider client={queryClient}>
        <EnrollmentStepThreeForm />
      </QueryClientProvider>,
    ),
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

  it("saves an empty draft as an empty payload and returns to the dashboard", async () => {
    renderForm();

    fireEvent.click(
      screen.getByRole("button", { name: /save & finish later/i }),
    );

    // Untouched ancestors are omitted entirely — nothing gets nulled out.
    await waitFor(() => {
      expect(saveDraftMutateAsync).toHaveBeenCalledWith({});
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard?draftSaved=1");
    });
  });

  it("runs the same partial-draft save from the layout's TOP header action", async () => {
    render(
      withIntl(
        <QueryClientProvider
          client={
            new QueryClient({ defaultOptions: { queries: { retry: false } } })
          }
        >
          <EnrollmentStepLayout step={3}>
            <EnrollmentStepThreeForm />
          </EnrollmentStepLayout>
        </QueryClientProvider>,
      ),
    );

    fireEvent.click(
      screen.getByRole("button", { name: /save and finish later/i }),
    );

    await waitFor(() => {
      expect(saveDraftMutateAsync).toHaveBeenCalledWith({});
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard?draftSaved=1");
    });
  });
});
