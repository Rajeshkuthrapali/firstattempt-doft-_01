import { test, expect } from "@playwright/test";

/**
 * E2E: Navigation — product linking, breadcrumbs, 404 handling,
 * and mobile hamburger menu.
 */

test.describe("Navigation & Routing", () => {
  test("clicking a product card navigates to PDP", async ({ page }) => {
    await page.goto("/");
    await page
      .getByLabel("View Golden Hour details")
      .first()
      .click();

    await expect(page).toHaveURL(/\/product\/golden-hour/);
    await expect(
      page.getByText("Golden Hour").first(),
    ).toBeVisible();
  });

  test("PDP breadcrumb links work", async ({ page }) => {
    await page.goto("/product/golden-hour");

    const breadcrumb = page.getByLabel("Breadcrumb");
    await expect(breadcrumb).toBeVisible();

    // Click Home in breadcrumb
    await breadcrumb.getByText("Home").click();
    await expect(page).toHaveURL("/");
  });

  test("invalid product slug shows 404 page", async ({ page }) => {
    await page.goto("/product/nonexistent-candle");
    await expect(page.getByText("Product Not Found")).toBeVisible();
    await expect(page.getByText("Back to Home")).toBeVisible();

    // Back to Home link works
    await page.getByText("Back to Home").click();
    await expect(page).toHaveURL("/");
  });

  test("'You May Also Like' section shows related products", async ({
    page,
  }) => {
    await page.goto("/product/golden-hour");

    await page.getByText("You May Also Like").scrollIntoViewIfNeeded();
    await expect(page.getByText("You May Also Like")).toBeVisible();

    // Should show other products (not Golden Hour)
    await expect(
      page.getByText("Midnight Oud").first(),
    ).toBeVisible();
  });
});

test.describe("Navigation — Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("hamburger menu opens, shows nav links, and closes on link click", async ({ page }) => {
    await page.goto("/");

    // Nav links should be hidden on mobile
    const hamburger = page.locator("#nav-toggle");
    await expect(hamburger).toBeVisible();

    // Open mobile menu
    await hamburger.click();

    // Now the nav links should be visible
    await expect(page.getByRole("menuitem", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Shop" })).toBeVisible();

    // Click a link — menu should close
    await page.getByRole("menuitem", { name: "Home" }).click();

    // Hamburger should show "Open menu" (menu closed)
    await expect(page.locator("#nav-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
