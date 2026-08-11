import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock, documentBuckets } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  // Mutable so each test can stage the uploads the member already has.
  documentBuckets: { current: [] as unknown[] },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  pushMock.mockReset();
  documentBuckets.current = [];
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
    data: documentBuckets.current,
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
import { withIntl } from "@/test/i18n";
import type { EnrollmentDocumentType } from "@/types/enrollment";

/** Stages the given document types as already-uploaded single-file buckets. */
function stageUploads(...documentTypes: EnrollmentDocumentType[]) {
  documentBuckets.current = documentTypes.map((type) => ({
    type,
    isSingle: true,
    documents: {
      id: `doc-${type}`,
      type,
      status: "PENDING",
      fileName: `${type.toLowerCase()}.pdf`,
      fileKey: `${type.toLowerCase()}/file.pdf`,
      fileSize: 1024,
      url: "https://example.com/file.pdf",
      verifiedByAdmin: false,
      rejectedReason: null,
      uploadedAt: "2026-06-01T00:00:00.000Z",
    },
  }));
}

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    withIntl(
      <QueryClientProvider client={queryClient}>
        <EnrollmentStepFourForm />
      </QueryClientProvider>,
    ),
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

  it("blocks continuing with the photo + birth certificate + social security card (no government ID)", () => {
    stageUploads("USER_PHOTO", "BIRTH_CERTIFICATE", "SOCIAL_SECURITY_CARD");
    renderForm();

    expect(screen.getByRole("button", { name: /^Next$/ })).toBeDisabled();
  });

  it("blocks continuing with the photo + government ID alone", () => {
    stageUploads("USER_PHOTO", "STATE_ID");
    renderForm();

    expect(screen.getByRole("button", { name: /^Next$/ })).toBeDisabled();
  });

  it.each(["BIRTH_CERTIFICATE", "SOCIAL_SECURITY_CARD"] as const)(
    "enables Next with the photo + government ID + %s",
    (secondIdentityType) => {
      stageUploads("USER_PHOTO", "STATE_ID", secondIdentityType);
      renderForm();

      expect(screen.getByRole("button", { name: /^Next$/ })).toBeEnabled();
    },
  );

  it("marks only the government ID with the required asterisk among the identity slots", () => {
    renderForm();

    expect(
      screen.getByRole("heading", { name: /Government-Issued ID/ }).textContent,
    ).toContain("*");
    expect(
      screen.getByRole("heading", { name: /Birth Certificate/ }).textContent,
    ).not.toContain("*");
    expect(
      screen.getByRole("heading", { name: /Social Security Card/ }).textContent,
    ).not.toContain("*");
  });

  it("'Save & finish later' just returns to the dashboard (files already saved per upload)", () => {
    renderForm();

    fireEvent.click(
      screen.getByRole("button", { name: /save & finish later/i }),
    );

    expect(pushMock).toHaveBeenCalledWith("/dashboard?draftSaved=1");
  });
});
