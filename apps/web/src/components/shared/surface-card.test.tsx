import { render, screen } from "@testing-library/react";
import { Landmark } from "lucide-react";
import { describe, expect, it } from "vitest";

import { SectionHeader, SurfaceCard } from "./surface-card";

describe("SurfaceCard", () => {
  it("renders an elevated bg-surface card with the shared radius/border/shadow", () => {
    render(<SurfaceCard data-testid="card">Content</SurfaceCard>);

    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("SECTION");
    expect(card.className).toContain("bg-surface");
    expect(card.className).toContain("border-border");
    expect(card.className).toContain("rounded-2xl");
    expect(card.className).toContain("shadow-card-soft");
    expect(card).toHaveTextContent("Content");
  });

  it("supports the hero-level elevated shadow tone", () => {
    render(
      <SurfaceCard data-testid="card" tone="elevated">
        Content
      </SurfaceCard>,
    );

    const card = screen.getByTestId("card");
    expect(card.className).toContain("shadow-card");
    expect(card.className).not.toContain("shadow-card-soft");
  });

  it("renders as the requested element with roomy enrollment-card padding", () => {
    render(
      <SurfaceCard as="article" data-testid="card" padding="roomy">
        Content
      </SurfaceCard>,
    );

    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("ARTICLE");
    expect(card.className).toContain("p-6");
    expect(card.className).toContain("sm:p-8");
    expect(card.className).toContain("lg:p-10");
  });

  it("supports padding=none and merges custom classes", () => {
    render(
      <SurfaceCard className="p-3" data-testid="card" padding="none">
        Content
      </SurfaceCard>,
    );

    const card = screen.getByTestId("card");
    expect(card.className).toContain("p-3");
    expect(card.className).not.toContain("sm:p-6");
  });
});

describe("SectionHeader", () => {
  it("renders a neutral icon tile, an h2 title and a muted description", () => {
    render(
      <SectionHeader
        description="What we hold on record."
        icon={Landmark}
        title="Records"
      />,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Records" });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("What we hold on record.")).toBeInTheDocument();
  });

  it("supports a custom heading level for logical document outlines", () => {
    render(
      <SectionHeader description="Desc" headingAs="h3" title="Nested" />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Nested" }),
    ).toBeInTheDocument();
  });

  it("renders an optional header action", () => {
    render(
      <SectionHeader
        action={<button type="button">Edit</button>}
        description="Desc"
        title="Records"
      />,
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});
