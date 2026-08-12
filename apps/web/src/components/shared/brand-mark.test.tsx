import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BrandMark } from "@/components/shared/brand-mark";
import { MEDIA_SLOTS } from "@/content/media-slots";
import { renderWithIntl } from "@/test/i18n";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

describe("BrandMark", () => {
  it("renders the Borikén brand label by default", () => {
    renderWithIntl(<BrandMark showSubtitle={false} />);
    expect(screen.getByText("Taíno Nation of Borikén")).toBeInTheDocument();
  });

  // The seal is a Website Studio slot now. With nothing assigned — which is
  // every environment today — it must still be the file that ships in git,
  // not an empty `src`.
  it("falls back to the shipped seal when no image is assigned", () => {
    renderWithIntl(<BrandMark showLabel={false} />);

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      MEDIA_SLOTS["brand.logo"],
    );
  });
});
