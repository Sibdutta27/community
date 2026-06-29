import { test, expect } from "@playwright/test";

/**
 * Public (unauthenticated) member-frontend pages. These are the strongest parity
 * signal that doesn't need a backend login: each page must load and render, and its
 * visual baseline must stay stable across the migration.
 */

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/community",
  "/contact",
  "/services",
  "/yucayeke",
  "/enrollment",
  "/cookie-policy",
  "/privacy-policy",
  "/terms-of-service",
];

for (const route of PUBLIC_ROUTES) {
  test(`public page loads: ${route}`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    // Page is served (some routes may 200 via SSR even if data is empty).
    expect(response, `no response for ${route}`).toBeTruthy();
    expect(response!.status(), `bad status for ${route}`).toBeLessThan(400);
    // A primary landmark/heading is visible.
    await expect(page.locator("body")).toBeVisible();
    await expect(
      page.locator("h1, h2, main, [role=main]").first(),
    ).toBeVisible();
  });
}

test("home page visual baseline", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  // Capture the above-the-fold hero as the visual contract.
  await expect(page).toHaveScreenshot("web-home.png", {
    fullPage: false,
    animations: "disabled",
  });
});

test("primary navigation is present", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("navigation").first()).toBeVisible();
});
