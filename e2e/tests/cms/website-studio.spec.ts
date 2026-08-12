import { test, expect, type Page } from "@playwright/test";

import { adminCreds, hasAdminCreds } from "../../fixtures/auth";

/**
 * The Website Studio round-trip, across both apps.
 *
 * This is the only test that proves the whole chain: an edit made in the admin
 * panel reaches the public site in both languages, and reverting puts the
 * shipped wording back. Everything else tests one half.
 *
 * It mutates real published content, so every case restores the key in
 * `afterEach` — an override left behind would change the live site and poison
 * the visual baselines in `e2e/snapshots/`.
 */

const WEB_BASE_URL = process.env.WEB_BASE_URL ?? "http://localhost:3000";
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL ?? "http://localhost:5173";
const API_BASE_URL = process.env.API_BASE_URL ?? "";

/** The key under test: the homepage h1, which carries a rich-text tag. */
const KEY = "home.hero.title";
const NONCE = `Kaya ${Date.now()}`;

async function adminToken(page: Page): Promise<string> {
  const response = await page.request.post(`${API_BASE_URL}/auth/admin-login`, {
    data: { email: adminCreds.email, password: adminCreds.password },
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  return body.accessToken as string;
}

async function revert(page: Page, token: string) {
  await page.request.delete(
    `${API_BASE_URL}/admin/content/strings/${encodeURIComponent(KEY)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

// Serial on purpose. Every case here targets the same key and the shared
// `afterEach` reverts it, so run in parallel one test's cleanup deletes what
// another just published — a race in the test, not in the feature.
test.describe.configure({ mode: "serial" });

test.describe("website studio", () => {
  test.skip(
    !hasAdminCreds() || !API_BASE_URL,
    "needs TEST_ADMIN_* credentials and API_BASE_URL",
  );

  test.afterEach(async ({ page }) => {
    await revert(page, await adminToken(page));
  });

  test("an edit reaches the public site in both languages, and revert undoes it", async ({
    page,
  }) => {
    const token = await adminToken(page);
    const auth = { Authorization: `Bearer ${token}` };

    // Baseline: whatever the site ships with.
    await page.goto(`${WEB_BASE_URL}/`);
    const shipped = (await page.locator("h1").first().innerText()).trim();
    expect(shipped).not.toContain(NONCE);

    // Draft, then publish.
    const draft = await page.request.put(
      `${API_BASE_URL}/admin/content/strings/${encodeURIComponent(KEY)}`,
      {
        headers: auth,
        data: {
          en: `${NONCE} <highlight>English</highlight>`,
          es: `${NONCE} <highlight>Español</highlight>`,
        },
      },
    );
    expect(draft.ok()).toBeTruthy();

    // A draft must NOT be public.
    const beforePublish = await page.request.get(
      `${API_BASE_URL}/content/messages`,
    );
    expect(JSON.stringify(await beforePublish.json())).not.toContain(NONCE);

    const published = await page.request.post(
      `${API_BASE_URL}/admin/content/publish`,
      { headers: auth },
    );
    expect(published.ok()).toBeTruthy();

    // English.
    await page.goto(`${WEB_BASE_URL}/?lang=en`);
    await expect(page.locator("h1").first()).toContainText(NONCE);

    // Spanish, via the preview's own mechanism.
    await page.goto(`${WEB_BASE_URL}/?lang=es`);
    await expect(page.locator("h1").first()).toContainText("Español");

    // Revert restores the shipped wording.
    await revert(page, token);
    await page.goto(`${WEB_BASE_URL}/`);
    await expect(page.locator("h1").first()).toHaveText(shipped);
  });

  test("the API refuses an edit that would drop a rich-text tag", async ({
    page,
  }) => {
    const token = await adminToken(page);

    const response = await page.request.put(
      `${API_BASE_URL}/admin/content/strings/${encodeURIComponent(KEY)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { en: "no tag here" },
      },
    );

    expect(response.status()).toBe(400);
    expect(await response.text()).toContain("<highlight>");
  });

  test("the API refuses to edit developer-owned application copy", async ({
    page,
  }) => {
    const token = await adminToken(page);

    const response = await page.request.put(
      `${API_BASE_URL}/admin/content/strings/enrollment.confirmation.declaration`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { en: "tampered" },
      },
    );

    expect(response.status()).toBe(403);
  });

  test("the studio lists editable copy and links the four tabs", async ({
    page,
  }) => {
    await page.goto(`${ADMIN_BASE_URL}/login`);
    await page.getByRole("textbox", { name: /email/i }).or(page.getByPlaceholder(/email/i)).first().fill(adminCreds.email as string);
    await page.locator('input[type="password"]').first().fill(adminCreds.password as string);
    await page.getByRole("button", { name: /sign in|log ?in|continue/i }).click();
    await page.waitForURL((url) => !/\/login$/.test(url.toString()));

    await page.goto(`${ADMIN_BASE_URL}/website`);

    for (const tab of ["Pages", "Yukayeke", "Media", "History"]) {
      await expect(page.getByRole("link", { name: tab })).toBeVisible();
    }

    await expect(page.getByLabel("English").first()).toBeVisible();
    await expect(page.getByLabel("Español").first()).toBeVisible();
  });
});
