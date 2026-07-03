import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LanguageSwitcher } from "@/components/shared/language-switcher";

describe("LanguageSwitcher", () => {
  it("renders a globe button labelled 'Change language'", () => {
    render(<LanguageSwitcher />);

    const trigger = screen.getByRole("button", { name: "Change language" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens a menu listing English and Español", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: "Change language" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(
      screen.getByRole("menuitemradio", { name: /English/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitemradio", { name: /Español/i }),
    ).toBeInTheDocument();
  });

  it("closes the menu on Escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const trigger = screen.getByRole("button", { name: "Change language" });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("supports arrow-key navigation between languages", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const trigger = screen.getByRole("button", { name: "Change language" });
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("menuitemradio", { name: /English/i }),
    ).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(
      screen.getByRole("menuitemradio", { name: /Español/i }),
    ).toHaveFocus();
  });

  it("marks the selected language after choosing Español", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: "Change language" }));
    await user.click(screen.getByRole("menuitemradio", { name: /Español/i }));

    // Menu closes on selection; reopen and check the radio state.
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Change language" }));
    expect(
      screen.getByRole("menuitemradio", { name: /Español/i }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
