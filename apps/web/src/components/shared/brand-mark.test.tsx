import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BrandMark } from "@/components/shared/brand-mark";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} src={typeof src === "string" ? src : ""} />
  ),
}));

describe("BrandMark", () => {
  it("renders the Borikén brand label by default", () => {
    render(<BrandMark showSubtitle={false} />);
    expect(screen.getByText("Taíno Nation of Borikén")).toBeInTheDocument();
  });
});
