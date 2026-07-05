import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PublicFooter } from "@/components/layout/public-footer";
import { renderWithIntl } from "@/test/i18n";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

describe("PublicFooter", () => {
  it("renders the English tagline under the default locale", () => {
    renderWithIntl(<PublicFooter />);

    expect(
      screen.getByText(
        "Preserving Indigenous heritage through land, lineage, and community connection.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the tagline in Puerto Rican Spanish under the es locale", () => {
    renderWithIntl(<PublicFooter />, "es");

    expect(
      screen.getByText(
        "Preservando la herencia indígena a través de la tierra, el linaje y la conexión comunitaria.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Preserving Indigenous heritage/),
    ).not.toBeInTheDocument();
  });
});
