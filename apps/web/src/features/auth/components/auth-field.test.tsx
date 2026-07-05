import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { AuthField } from "@/features/auth/components/auth-field";

type HarnessValues = Readonly<{ email: string; password: string }>;

function PasswordFieldHarness({
  errorMessage,
}: Readonly<{ errorMessage?: string }>) {
  const { register } = useForm<HarnessValues>();

  return (
    <AuthField
      autoComplete="current-password"
      name="password"
      label="Password"
      errorMessage={errorMessage}
      register={register}
      placeholder="Minimum 8 Character"
      type="password"
    />
  );
}

function EmailFieldHarness() {
  const { register } = useForm<HarnessValues>();

  return (
    <AuthField
      autoComplete="email"
      name="email"
      label="Email id"
      register={register}
      placeholder="Email id"
      type="email"
    />
  );
}

describe("AuthField", () => {
  it("associates the label with the input", () => {
    render(<PasswordFieldHarness />);
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
  });

  it("announces errors via aria-describedby + aria-invalid", () => {
    render(
      <PasswordFieldHarness errorMessage="Password must be at least 8 characters" />,
    );

    const input = screen.getByLabelText(/^password/i);
    expect(input).toHaveAttribute("aria-invalid", "true");

    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      "Password must be at least 8 characters",
    );
  });

  it("provides an accessible show/hide password toggle", async () => {
    const user = userEvent.setup();
    render(<PasswordFieldHarness />);

    const input = screen.getByLabelText(/^password/i);
    expect(input).toHaveAttribute("type", "password");

    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    expect(input).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("does not render a visibility toggle for non-password fields", () => {
    render(<EmailFieldHarness />);
    expect(
      screen.queryByRole("button", { name: /password/i }),
    ).not.toBeInTheDocument();
  });
});
