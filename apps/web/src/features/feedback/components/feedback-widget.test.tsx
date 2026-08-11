import type { ReactElement, ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FeedbackWidget } from "@/features/feedback/components/feedback-widget";
import { withIntl, type TestLocale } from "@/test/i18n";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

function renderWidget(
  ui: ReactElement = <FeedbackWidget />,
  locale?: TestLocale,
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return render(withIntl(<Wrapper>{ui}</Wrapper>, locale));
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const successPayload = {
  message: "Feedback submitted successfully",
  feedback: {
    id: "feedback-1",
    createdAt: "2026-08-11T00:00:00.000Z",
    hasAttachment: false,
  },
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function getLauncher() {
  return screen.getByRole("button", {
    name: "Share feedback about this page",
  });
}

describe("FeedbackWidget — open / close", () => {
  it("starts closed with an unexpanded launcher", () => {
    renderWidget();

    const launcher = getLauncher();
    expect(launcher).toHaveAttribute("aria-expanded", "false");
    expect(launcher).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the panel from the launcher and moves focus into it", async () => {
    const user = userEvent.setup();
    renderWidget();

    await user.click(getLauncher());

    const panel = screen.getByRole("dialog");
    expect(panel).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close feedback" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("What's happening?")).toHaveFocus();
  });

  it("shows the captured page and language so testers do not have to", async () => {
    const user = userEvent.setup();
    renderWidget();

    await user.click(getLauncher());

    expect(screen.getByText("Page: /dashboard")).toBeInTheDocument();
    expect(screen.getByText("Language: English")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the launcher", async () => {
    const user = userEvent.setup();
    renderWidget();

    await user.click(getLauncher());
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(getLauncher()).toHaveFocus();
  });

  it("toggles closed when the launcher is pressed again", async () => {
    const user = userEvent.setup();
    renderWidget();

    await user.click(getLauncher());
    await user.click(screen.getByRole("button", { name: "Close feedback" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("FeedbackWidget — validation", () => {
  it("blocks an empty submission and never calls the API", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    renderWidget();
    await user.click(getLauncher());
    await user.click(screen.getByRole("button", { name: "Send to the team" }));

    expect(
      await screen.findByText(
        "Please tell us a little about what you're seeing.",
      ),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("blocks a whitespace-only submission", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    renderWidget();
    await user.click(getLauncher());
    await user.type(screen.getByLabelText("What's happening?"), "   ");
    await user.click(screen.getByRole("button", { name: "Send to the team" }));

    expect(
      await screen.findByText(
        "Please tell us a little about what you're seeing.",
      ),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an attachment with a disallowed type before sending", async () => {
    // `applyAccept: false` bypasses the input's `accept` filter — a determined
    // member can still force-pick any file, so the runtime check must hold.
    const user = userEvent.setup({ applyAccept: false });
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    renderWidget();
    await user.click(getLauncher());

    await user.upload(
      screen.getByLabelText("Add a picture (optional)"),
      new File(["x"], "notes.txt", { type: "text/plain" }),
    );

    expect(
      await screen.findByText(
        "That file type can't be attached. Please use a PNG, JPG, WEBP or PDF.",
      ),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("FeedbackWidget — submission", () => {
  it("posts the note with the captured page context and confirms warmly", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(successPayload));
    vi.stubGlobal("fetch", fetchMock);

    renderWidget();
    await user.click(getLauncher());
    await user.type(
      screen.getByLabelText("What's happening?"),
      "The map is blank",
    );
    await user.click(screen.getByRole("button", { name: "Send to the team" }));

    expect(
      await screen.findByText("Thank you — we got it."),
    ).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(String(requestUrl)).toBe("/api/feedback");
    expect(requestInit?.method).toBe("POST");

    const body = requestInit?.body as FormData;
    expect(body.get("message")).toBe("The map is blank");
    expect(body.get("locale")).toBe("en");
    expect(String(body.get("pageUrl"))).toContain("http");
    expect(body.get("attachment")).toBeNull();
  });

  it("sends an allowed attachment along with the note", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(successPayload));
    vi.stubGlobal("fetch", fetchMock);

    renderWidget();
    await user.click(getLauncher());
    await user.type(screen.getByLabelText("What's happening?"), "See picture");
    await user.upload(
      screen.getByLabelText("Add a picture (optional)"),
      new File(["x"], "shot.png", { type: "image/png" }),
    );
    await user.click(screen.getByRole("button", { name: "Send to the team" }));

    await screen.findByText("Thank you — we got it.");

    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect((body.get("attachment") as File).name).toBe("shot.png");
  });

  it("lets the member send another note from the confirmation", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(successPayload)),
    );

    renderWidget();
    await user.click(getLauncher());
    await user.type(screen.getByLabelText("What's happening?"), "First note");
    await user.click(screen.getByRole("button", { name: "Send to the team" }));

    await screen.findByText("Thank you — we got it.");
    await user.click(screen.getByRole("button", { name: "Send another note" }));

    expect(screen.getByLabelText("What's happening?")).toHaveValue("");
  });

  it("keeps the panel open and closes it from the confirmation", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(successPayload)),
    );

    renderWidget();
    await user.click(getLauncher());
    await user.type(screen.getByLabelText("What's happening?"), "A note");
    await user.click(screen.getByRole("button", { name: "Send to the team" }));

    await screen.findByText("Thank you — we got it.");
    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("FeedbackWidget — error state", () => {
  it("surfaces a recoverable error and keeps what the member typed", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({ message: "Feedback is temporarily unavailable." }, 500),
      )
      .mockResolvedValueOnce(jsonResponse(successPayload));
    vi.stubGlobal("fetch", fetchMock);

    renderWidget();
    await user.click(getLauncher());
    await user.type(screen.getByLabelText("What's happening?"), "Broken link");
    await user.click(screen.getByRole("button", { name: "Send to the team" }));

    expect(
      await screen.findByText("Feedback is temporarily unavailable."),
    ).toBeInTheDocument();
    // Recoverable: the note is still there and the form is still submittable.
    expect(screen.getByLabelText("What's happening?")).toHaveValue(
      "Broken link",
    );

    await user.click(screen.getByRole("button", { name: "Send to the team" }));
    expect(
      await screen.findByText("Thank you — we got it."),
    ).toBeInTheDocument();
  });

  it("falls back to the localized error when the API returns nothing usable", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new TypeError("network down")),
    );

    renderWidget();
    await user.click(getLauncher());
    await user.type(screen.getByLabelText("What's happening?"), "Offline");
    await user.click(screen.getByRole("button", { name: "Send to the team" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});

describe("FeedbackWidget (es)", () => {
  it("renders the widget in Puerto Rican Spanish", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(successPayload));
    vi.stubGlobal("fetch", fetchMock);

    renderWidget(<FeedbackWidget />, "es");

    const launcher = screen.getByRole("button", {
      name: "Enviar un comentario sobre esta página",
    });
    await user.click(launcher);

    expect(
      screen.getByText("Cuéntenos lo que está viendo"),
    ).toBeInTheDocument();
    expect(screen.getByText("Idioma: Español")).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("¿Qué está pasando?"),
      "El mapa no carga",
    );
    await user.click(screen.getByRole("button", { name: "Enviar al equipo" }));

    expect(
      await screen.findByText("Gracias — ya lo recibimos."),
    ).toBeInTheDocument();

    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.get("locale")).toBe("es");
  });
});
