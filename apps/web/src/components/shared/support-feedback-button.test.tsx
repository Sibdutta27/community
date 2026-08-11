import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SupportSection } from "@/components/shared/support-section";
import { FeedbackWidget } from "@/features/feedback/components/feedback-widget";
import { withIntl } from "@/test/i18n";

// `next/font/google` loaders only run inside the Next.js build.
vi.mock("@/styles/fonts", () => {
  const mockFont = {
    className: "mock-font",
    variable: "mock-font-variable",
    style: { fontFamily: "mock-font" },
  };
  return {
    inter: mockFont,
    cinzel: mockFont,
    montserrat: mockFont,
    lato: mockFont,
    poppins: mockFont,
  };
});

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/contact",
}));

function renderSupportPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return render(
    withIntl(
      <Wrapper>
        <SupportSection />
        <FeedbackWidget />
      </Wrapper>,
    ),
  );
}

describe("SupportSection report card", () => {
  it("no longer renders a dead button", () => {
    renderSupportPage();

    expect(
      screen.getByRole("button", { name: "Open the Feedback Box" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Chat in Forums")).not.toBeInTheDocument();
  });

  it("opens the same feedback panel as the floating launcher", async () => {
    const user = userEvent.setup();
    renderSupportPage();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Open the Feedback Box" }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("What's happening?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close feedback" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
