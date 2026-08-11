import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const startEnrollmentMock = vi.fn();

let accountInfoData: Record<string, unknown> | undefined;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/features/dashboard/lib/enrollment-queries", () => ({
  accountQueryKeys: { info: ["account", "info"] },
  useAccountInfoQuery: () => ({
    data: accountInfoData,
    error: null,
    isLoading: false,
  }),
  useStartEnrollmentMutation: () => ({
    mutateAsync: startEnrollmentMock,
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
  startEnrollmentMock.mockReset();
  startEnrollmentMock.mockResolvedValue({});
});

const acceptedConsent = {
  id: "consent-1",
  key: "communication_consent",
  version: 1,
  title: "Communication Consent",
  accepted: true,
  acceptedAt: "2026-07-08T00:00:00.000Z",
  required: true,
};

const allStepsIncomplete = {
  "1": false,
  "2": false,
  "3": false,
  "4": false,
} as const;

describe("DashboardEnrollmentSection (consent moved off the dashboard)", () => {
  it("never opens a consent dialog — consent lives on the enrollment intro now", async () => {
    accountInfoData = buildAccountInfo({
      status: "DRAFT",
      consentAccepted: false,
      consent: [],
    });

    render(<DashboardEnrollmentSection />);
    await clickStepOneCta();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/enrollment/start");
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("routes a member with a pending required consent to the one consent surface", async () => {
    // A newly published required consent no longer stops the dashboard: the
    // intro decides what still needs accepting.
    accountInfoData = buildAccountInfo({
      status: "DRAFT",
      consentAccepted: true,
      consent: [acceptedConsent],
      steps: allStepsIncomplete,
    });

    render(<DashboardEnrollmentSection />);
    await clickStepOneCta();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/enrollment/start");
    });
  });
});

describe("DashboardEnrollmentSection (where the step-1 CTA lands)", () => {
  it("sends members who have not completed step 1 to the enrollment overview first", async () => {
    accountInfoData = buildAccountInfo({
      status: "DRAFT",
      consentAccepted: true,
      consent: [acceptedConsent],
      steps: allStepsIncomplete,
    });

    render(<DashboardEnrollmentSection />);
    await clickStepOneCta();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/enrollment/start");
    });
  });

  it("sends returning members whose step 1 is already complete straight to the form", async () => {
    accountInfoData = buildAccountInfo({
      status: "DRAFT",
      consentAccepted: true,
      consent: [acceptedConsent],
      steps: { ...allStepsIncomplete, "1": true },
    });

    render(<DashboardEnrollmentSection />);
    await clickStepOneCta();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/enrollment/step-1");
    });
    // No extra click through the introduction for someone already underway.
    expect(pushMock).not.toHaveBeenCalledWith("/enrollment/start");
  });

  it("falls back to the overview while the completion state is still unknown", async () => {
    accountInfoData = buildAccountInfo({
      status: "DRAFT",
      consentAccepted: true,
      consent: [acceptedConsent],
    });

    render(<DashboardEnrollmentSection />);
    await clickStepOneCta();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/enrollment/start");
    });
  });
});

describe("DashboardEnrollmentSection (starting the enrollment)", () => {
  it("creates the enrollment before handing off, for a member who has none", async () => {
    accountInfoData = buildAccountInfo(null);

    render(<DashboardEnrollmentSection />);
    await clickStepOneCta();

    await waitFor(() => {
      expect(startEnrollmentMock).toHaveBeenCalled();
    });
    expect(pushMock).toHaveBeenCalledWith("/enrollment/start");
  });

  it("never restarts an existing enrollment — that would reset it to DRAFT", async () => {
    accountInfoData = buildAccountInfo({
      status: "SUBMITTED",
      consentAccepted: true,
      consent: [acceptedConsent],
      steps: { "1": true, "2": true, "3": true, "4": true },
    });

    render(<DashboardEnrollmentSection />);
    await clickStepOneCta();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalled();
    });
    expect(startEnrollmentMock).not.toHaveBeenCalled();
  });
});
