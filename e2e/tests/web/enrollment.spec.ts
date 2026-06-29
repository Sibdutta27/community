import { test, expect } from "@playwright/test";
import { hasMemberCreds, loginMember } from "../../fixtures/auth";

/**
 * Enrollment is the core member flow (DRAFT -> SUBMITTED). These run only when a
 * member test account is configured. They assert the step pages are reachable and
 * render their forms — not a full submission (which would mutate data).
 */
test.describe("enrollment flow", () => {
  test.skip(
    !hasMemberCreds(),
    "Set TEST_MEMBER_EMAIL / TEST_MEMBER_PASSWORD to run enrollment flows.",
  );

  test.beforeEach(async ({ page }) => {
    await loginMember(page);
  });

  test("dashboard shows enrollment status / entry point", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("main, [role=main]").first()).toBeVisible();
  });

  for (const step of [1, 2, 3, 4]) {
    test(`enrollment step ${step} renders`, async ({ page }) => {
      const res = await page.goto(`/enrollment/step-${step}`, {
        waitUntil: "networkidle",
      });
      expect(res!.status()).toBeLessThan(400);
      // The step is a form; at least one input/control is present.
      await expect(
        page.locator("form, input, select, textarea, button").first(),
      ).toBeVisible();
    });
  }
});
