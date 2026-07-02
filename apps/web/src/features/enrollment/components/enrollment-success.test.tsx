import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EnrollmentSuccess } from "@/features/enrollment/components/enrollment-success";

describe("EnrollmentSuccess", () => {
  it("renders the success heading and the 90-day council review notice", () => {
    render(<EnrollmentSuccess />);

    expect(
      screen.getByRole("heading", { name: "Success!" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/review your application within 90 days/i),
    ).toBeInTheDocument();
  });

  it("links back to the dashboard", () => {
    render(<EnrollmentSuccess />);

    expect(
      screen.getByRole("link", { name: /back to dashboard/i }),
    ).toHaveAttribute("href", "/dashboard");
  });
});
