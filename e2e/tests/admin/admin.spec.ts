import { test, expect } from "@playwright/test";
import {
  emailField,
  hasAdminCreds,
  loginAdmin,
  passwordField,
} from "../../fixtures/auth";

test.describe("admin panel", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(emailField(page)).toBeVisible();
    await expect(passwordField(page)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in|log ?in|continue/i }),
    ).toBeVisible();
  });

  test("protected route redirects to /login when unauthenticated", async ({
    page,
  }) => {
    await page.goto("/enrollments/all");
    await expect(page).toHaveURL(/\/login/);
  });

  test.describe("authenticated", () => {
    test.skip(
      !hasAdminCreds(),
      "Set TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD to run admin flows.",
    );

    test.beforeEach(async ({ page }) => {
      await loginAdmin(page);
    });

    // NOTE: /dashboard is intentionally absent — it's an unrouted stub;
    // enrollments live under /enrollments/{all,submitted,approved,rejected}.
    const routes = [
      "/users",
      "/enrollments/all",
      "/cultural-connections",
      "/consents",
      "/services",
      "/service-categories",
      "/events",
      "/event-categories",
    ];

    for (const route of routes) {
      test(`admin route loads: ${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: "networkidle" });
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page.locator("body")).toBeVisible();
      });
    }

    test("enrollments list shows a data table", async ({ page }) => {
      await page.goto("/enrollments/all", { waitUntil: "networkidle" });
      // react-data-table-component renders a table/grid structure.
      await expect(
        page.locator("table, [role=table], [role=grid]").first(),
      ).toBeVisible();
    });
  });
});
