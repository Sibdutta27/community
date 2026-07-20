import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const activeConsents = [
  {
    id: "consent-1",
    key: "communication_consent",
    title: "Communication Consent",
    content: "…",
    required: true,
    version: 1,
  },
];

let accountInfoData: Record<string, unknown> | undefined;

vi.mock("@/features/dashboard/lib/enrollment-queries", () => ({
  accountQueryKeys: { info: ["account", "info"] },
  enrollmentQueryKeys: {
    activeConsents: ["enrollment", "consent", "active"],
  },
  useAccountInfoQuery: () => ({
    data: accountInfoData,
    error: null,
    isLoading: false,
  }),
  useActiveConsentsQuery: () => ({
    data: activeConsents,
    isFetching: false,
    refetch: () => Promise.resolve({ data: activeConsents, error: undefined }),
  }),
  useStartEnrollmentMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useAcceptEnrollmentConsentsMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DashboardEnrollmentSection } from "@/features/dashboard/components/dashboard-enrollment-section";
import { renderWithIntl } from "@/test/i18n";

function render(ui: React.ReactElement) {
  return renderWithIntl(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );
}

function buildAccountInfo(
  enrollment: Record<string, unknown> | null,
): Record<string, unknown> {
  return {
    hasEnrollment: Boolean(enrollment),
    enrollment,
    enrollmentStatus: enrollment ? "DRAFT" : undefined,
  };
}

async function clickStepOneCta() {
  const stepOneButton = screen.getAllByRole("button")[0];
  fireEvent.click(stepOneButton);
}

beforeEach(() => {
  pushMock.mockReset();
});

describe("DashboardEnrollmentSection (consent-once gating)", () => {
  it("skips the consent dialog when every required consent is already accepted", async () => {
    accountInfoData = buildAccountInfo({
      status: "DRAFT",
      consentAccepted: true,
      consent: [
        {
          id: "consent-1",
          key: "communication_consent",
          version: 1,
          title: "Communication Consent",
          accepted: true,
          acceptedAt: "2026-07-08T00:00:00.000Z",
          required: true,
        },
      ],
    });

    render(<DashboardEnrollmentSection />);
    await clickStepOneCta();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/enrollment/step-1");
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the consent dialog when a required active consent is still pending", async () => {
    accountInfoData = buildAccountInfo({
      status: "DRAFT",
      consentAccepted: false,
      consent: [],
    });

    render(<DashboardEnrollmentSection />);
    await clickStepOneCta();

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("re-prompts when a newly published required consent is not yet accepted", async () => {
    accountInfoData = buildAccountInfo({
      status: "DRAFT",
      consentAccepted: true,
      consent: [
        {
          id: "consent-0-old",
          key: "old_consent",
          version: 1,
          title: "Old Consent",
          accepted: true,
          acceptedAt: "2026-07-08T00:00:00.000Z",
          required: true,
        },
      ],
    });

    render(<DashboardEnrollmentSection />);
    await clickStepOneCta();

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
