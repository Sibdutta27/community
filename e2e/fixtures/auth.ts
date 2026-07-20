import { Page, expect } from "@playwright/test";

/**
 * UI login helpers. Selectors use accessible roles/labels (works with the
 * react-hook-form + shadcn / MUI forms). Adjust the name patterns here if the real
 * labels differ — this is the single place to keep them in sync.
 */

export const memberCreds = {
  email: process.env.TEST_MEMBER_EMAIL,
  password: process.env.TEST_MEMBER_PASSWORD,
};

export const adminCreds = {
  email: process.env.TEST_ADMIN_EMAIL,
  password: process.env.TEST_ADMIN_PASSWORD,
};

export function hasMemberCreds() {
  return Boolean(memberCreds.email && memberCreds.password);
}

export function hasAdminCreds() {
  return Boolean(adminCreds.email && adminCreds.password);
}

/**
 * Textbox-role locators keep this working across both login forms: the member
 * form's "Show password" toggle also matches getByLabel(/password/i) (strict-
 * mode violation), and the redesigned admin form labels fields via placeholder
 * text instead of <label> elements.
 */
function emailField(page: Page) {
  return page.getByRole("textbox", { name: /email/i }).or(
    page.getByPlaceholder(/email/i),
  ).first();
}

function passwordField(page: Page) {
  return page
    .locator('input[type="password"]')
    .first();
}

async function fillCredentials(page: Page, email: string, password: string) {
  await emailField(page).fill(email);
  await passwordField(page).fill(password);
  await page.getByRole("button", { name: /sign in|log ?in|continue/i }).click();
}

export { emailField, passwordField };

/** Sign in to the member frontend; lands on the dashboard. */
export async function loginMember(page: Page) {
  await page.goto("/sign-in");
  await fillCredentials(page, memberCreds.email!, memberCreds.password!);
  await expect(page).toHaveURL(/\/dashboard|\/my-profile|\/profile/);
}

/** Sign in to the admin panel; lands on an authenticated admin route. */
export async function loginAdmin(page: Page) {
  await page.goto("/login");
  await fillCredentials(page, adminCreds.email!, adminCreds.password!);
  await expect(page).not.toHaveURL(/\/login$/);
}
