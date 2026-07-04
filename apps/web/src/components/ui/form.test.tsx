import * as React from "react";
import { useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Values = { email: string };

function TestForm({ error }: { error?: string }) {
  const form = useForm<Values>({
    defaultValues: { email: "" },
  });

  React.useEffect(() => {
    if (error) {
      form.setError("email", { type: "manual", message: error });
    }
    // Set once on mount; `error` is stable per render in these tests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

describe("Form field", () => {
  it("renders the label wired to the control", () => {
    render(<TestForm />);
    const input = screen.getByLabelText("Email address");
    expect(input).toBeInTheDocument();
  });

  it("renders a validation error message", () => {
    render(<TestForm error="Email is required" />);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("styles the validation message and label with the destructive token", () => {
    render(<TestForm error="Email is required" />);
    expect(screen.getByText("Email is required")).toHaveClass(
      "text-destructive",
    );
    expect(screen.getByText("Email address")).toHaveClass("text-destructive");
  });
});
