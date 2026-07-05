import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/i18n";

import { DashboardDraftSavedNotice } from "./dashboard-draft-saved-notice";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: getMock }),
}));

describe("DashboardDraftSavedNotice", () => {
  it("renders nothing when the draftSaved flag is absent", () => {
    getMock.mockReturnValue(null);

    const { container } = renderWithIntl(<DashboardDraftSavedNotice />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the Puerto-Rican Spanish saved notice when draftSaved=1", () => {
    getMock.mockReturnValue("1");

    renderWithIntl(<DashboardDraftSavedNotice />, "es");

    expect(
      screen.getByText(
        "Su progreso se ha guardado — puede terminar más tarde.",
      ),
    ).toBeInTheDocument();
  });
});
