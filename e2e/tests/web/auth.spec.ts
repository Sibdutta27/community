import { test, expect } from "@playwright/test";
import {
  emailField,
  hasMemberCreds,
  loginMember,
  passwordField,
} from "../../fixtures/auth";

test.describe("member auth", () => {
  test("sign-in page renders a login form", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(emailField(page)).toBeVisible();
    await expect(passwordField(page)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in|log ?in|continue/i }),
    ).toBeVisible();
  });

  test("sign-up page renders", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(emailField(page)).toBeVisible();
    // Sign-up has Password + Confirm Password; match the first to avoid strict-mode.
    await expect(passwordField(page)).toBeVisible();
  });

  test("protected route redirects unauthenticated users to sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("member can sign in and reach the dashboard", async ({ page }) => {
    test.skip(
      !hasMemberCreds(),
      "Set TEST_MEMBER_EMAIL / TEST_MEMBER_PASSWORD to run authenticated flows.",
    );
    await loginMember(page);
    await expect(
      page.locator("h1, h2, main, [role=main]").first(),
    ).toBeVisible();
  });
});
