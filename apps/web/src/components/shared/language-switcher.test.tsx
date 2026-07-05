import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { renderWithIntl } from "@/test/i18n";

const routerRefresh = vi.hoisted(() => vi.fn());
const setUserLocale = vi.hoisted(() => vi.fn(async () => {}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: routerRefresh }),
}));

vi.mock("@/i18n/locale-actions", () => ({
  setUserLocale,
}));

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    routerRefresh.mockClear();
    setUserLocale.mockClear();
  });

  it("renders a globe button labelled 'Change language'", () => {
    renderWithIntl(<LanguageSwitcher />);

    const trigger = screen.getByRole("button", { name: /change language/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("includes the current language in the trigger's accessible name", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LanguageSwitcher />);

    expect(
      screen.getByRole("button", { name: /change language.*english/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /change language/i }));
    await user.click(screen.getByRole("menuitemradio", { name: /Español/i }));

    expect(
      screen.getByRole("button", { name: /change language.*español/i }),
    ).toBeInTheDocument();
  });

  it("reflects the active locale from the intl context in the trigger", () => {
    renderWithIntl(<LanguageSwitcher />, "es");

    const trigger = screen.getByRole("button", {
      name: /cambiar idioma.*español/i,
    });
    expect(trigger).toHaveTextContent(/es/i);
  });

  it("persists the choice via the community_locale server action and refreshes", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: /change language/i }));
    await user.click(screen.getByRole("menuitemradio", { name: /Español/i }));

    await waitFor(() => {
      expect(setUserLocale).toHaveBeenCalledWith("es");
      expect(routerRefresh).toHaveBeenCalled();
    });
  });

  it("does not re-set the cookie when re-selecting the current language", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: /change language/i }));
    await user.click(screen.getByRole("menuitemradio", { name: /English/i }));

    expect(setUserLocale).not.toHaveBeenCalled();
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it("opens a menu listing English and Español", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: /change language/i }));

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
    renderWithIntl(<LanguageSwitcher />);

    const trigger = screen.getByRole("button", { name: /change language/i });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("supports arrow-key navigation between languages", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LanguageSwitcher />);

    const trigger = screen.getByRole("button", { name: /change language/i });
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
    renderWithIntl(<LanguageSwitcher />);

    await user.click(screen.getByRole("button", { name: /change language/i }));
    await user.click(screen.getByRole("menuitemradio", { name: /Español/i }));

    // Menu closes on selection; reopen and check the radio state.
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /change language/i }));
    expect(
      screen.getByRole("menuitemradio", { name: /Español/i }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
