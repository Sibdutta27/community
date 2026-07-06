import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TribalIdentificationCard } from "@/features/profile/components/tribal-identification-card";
import type { IdCardData } from "@/features/profile/lib/id-card-data";
import { renderWithIntl } from "@/test/i18n";

// Keep the heavy export libs (html-to-image, jspdf) out of jsdom.
vi.mock("@/lib/download", () => ({
  downloadBlob: vi.fn(),
  exportNodeToPng: vi.fn(),
  exportNodeToPdf: vi.fn(),
}));

const base: IdCardData = {
  status: "approved",
  isApproved: true,
  fullName: "Carmen María Rodríguez Torres",
  initials: "CT",
  memberId: "TN-2847-GUA",
  dateOfBirth: "03/12/1985",
  yucayeke: "Guainía Region",
  enrollmentDate: "January 15, 2023",
  documentNumber: "TN-2023-00847",
  photoUrl: "",
};

const preview: IdCardData = {
  ...base,
  status: "notStarted",
  isApproved: false,
  memberId: "",
  dateOfBirth: "",
  yucayeke: "",
  enrollmentDate: "",
  documentNumber: "",
};

describe("TribalIdentificationCard", () => {
  it("shows verified real data and download actions when approved", () => {
    renderWithIntl(<TribalIdentificationCard data={base} />);

    expect(
      screen.getByText("Carmen María Rodríguez Torres"),
    ).toBeInTheDocument();
    expect(screen.getByText("TN-2847-GUA")).toBeInTheDocument();
    expect(screen.getByText("TN-2023-00847")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Download PDF" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save Image" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /enroll/i })).toBeNull();
  });

  it("shows a preview with placeholders and an Enroll CTA when not enrolled", () => {
    renderWithIntl(<TribalIdentificationCard data={preview} />);

    // Placeholder values instead of real data.
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    expect(screen.queryByText("TN-2023-00847")).toBeNull();

    const cta = screen.getByRole("link", { name: "Enroll Now" });
    expect(cta).toHaveAttribute("href", "/dashboard#enrollment-dashboard");

    // No downloads for an unverified preview.
    expect(screen.queryByRole("button", { name: "Download PDF" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Save Image" })).toBeNull();
  });

  it("shows a pending badge and no CTA while submitted", () => {
    renderWithIntl(
      <TribalIdentificationCard data={{ ...preview, status: "submitted" }} />,
    );

    expect(screen.getAllByText("Pending verification").length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByRole("link", { name: /enroll|update/i })).toBeNull();
    expect(screen.queryByRole("button", { name: "Download PDF" })).toBeNull();
  });

  it("offers an Update Enrollment CTA when rejected", () => {
    renderWithIntl(
      <TribalIdentificationCard data={{ ...preview, status: "rejected" }} />,
    );

    expect(
      screen.getByRole("link", { name: "Update Enrollment" }),
    ).toBeInTheDocument();
  });
});
