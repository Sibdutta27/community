import { test, expect } from "@playwright/test";
import { hasMemberCreds, loginMember } from "../../fixtures/auth";

/**
 * Yucayeke territory map: profile "Your Yucayeke" card + the interactive
 * /yucayeke page. Own-territory assertions are conditional on the test
 * member actually having a declared yucayeke, so the suite stays green for
 * unassigned accounts too.
 */
test.describe("yucayeke map", () => {
  test("redirects unauthenticated visitors to sign-in", async ({ page }) => {
    await page.goto("/yucayeke");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test.describe("authenticated", () => {
    test.skip(
      !hasMemberCreds(),
      "Set TEST_MEMBER_EMAIL / TEST_MEMBER_PASSWORD to run yucayeke map flows.",
    );

    test.beforeEach(async ({ page }) => {
      await loginMember(page);
    });

    test("profile yucayeke tab shows the Your Yucayeke card linking to the map", async ({
      page,
    }) => {
      await page.goto("/my-profile");
      await page.getByRole("tab", { name: /yucayeke/i }).click();

      const card = page.getByTestId("your-yucayeke-card");
      await expect(card).toBeVisible();

      await card.getByRole("link", { name: /explore the territories/i }).click();
      await expect(page).toHaveURL(/\/yucayeke\/map/);
    });

    test("map page renders all territories and supports reading about them", async ({
      page,
    }) => {
      await page.goto("/yucayeke");

      // 19 mapped territory shapes (Bieque's nine islands merged into one).
      await expect(page.locator("path[data-territory]")).toHaveCount(19);

      // Interpretive-boundaries disclaimer is always visible near the map.
      await expect(
        page.getByText(/interpretive reconstructions/i),
      ).toBeVisible();

      // Select Turabo from the focusable list; the info card follows.
      await page.locator('[data-territory-slug="turabo"]').click();
      await expect(page.getByTestId("territory-info-card")).toContainText(
        "Turabo",
      );
      await expect(page.getByTestId("territory-info-card")).toContainText(
        "Cacique Caguax",
      );
      await expect(page.getByTestId("territory-info-card")).toContainText(
        "Caguas",
      );

      // Guajataca is drawn but unconfirmed — oral-tradition badge shows.
      await page.locator('[data-territory-slug="guajataca"]').click();
      await expect(page.getByTestId("territory-info-card")).toContainText(
        "Oral tradition",
      );
    });

    test("declared yucayeke highlights on the map when assigned", async ({
      page,
    }) => {
      await page.goto("/yucayeke");

      const chip = page.getByText(/^Your yucayeke: /);
      if ((await chip.count()) === 0) {
        test.skip(true, "Test member has no declared yucayeke.");
      }

      const highlighted = page.locator("path[data-highlighted]");
      await expect(highlighted).toHaveCount(1);
      await expect(page.getByTestId("territory-info-card")).toContainText(
        "Your yucayeke",
      );
    });
  });
});
