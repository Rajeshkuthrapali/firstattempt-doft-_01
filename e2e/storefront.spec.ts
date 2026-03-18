import { test, expect } from "@playwright/test";

/**
 * E2E: Storefront — hero, announcement bar, navigation.
 * Verifies the homepage loads correctly with all key visual
 * elements and navigation structure intact.
 */

test.describe("Storefront — Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page has correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Lumière/i);
  });

  test("hero section is visible with headline", async ({ page }) => {
    const hero = page.locator("#hero");
    await expect(hero).toBeVisible();
    await expect(page.getByText("signature")).toBeVisible();
    await expect(page.getByText("Scented Collection")).toBeVisible();
  });

  test("announcement bar shows free shipping text", async ({ page }) => {
    await expect(
      page.getByText(/free shipping on orders above/i).first(),
    ).toBeVisible();
  });

  test("LUMIÈRE brand wordmark is visible in nav", async ({ page }) => {
    await expect(page.getByText("LUMIÈRE").first()).toBeVisible();
  });

  test("navigation links are visible on desktop", async ({ page }) => {
    await expect(page.getByRole("menuitem", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Shop" })).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "Our Story" }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "Contact" }),
    ).toBeVisible();
  });

  test("Shop Now CTA links to collection section", async ({ page }) => {
    const cta = page.getByText("Shop Now");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "#collection");
  });

  test("product cards are rendered in the grid", async ({ page }) => {
    await expect(page.getByText("Signature Fragrances")).toBeVisible();
    await expect(page.getByText("Golden Hour").first()).toBeVisible();
  });

  test("value props section is visible", async ({ page }) => {
    await page.getByText("Hand-Poured").scrollIntoViewIfNeeded();
    await expect(page.getByText("Hand-Poured")).toBeVisible();
    await expect(page.getByText("100% Natural Soy")).toBeVisible();
    await expect(page.getByText("Gift-Ready")).toBeVisible();
  });

  test("footer renders with brand and newsletter", async ({ page }) => {
    await page.getByText("Stay in Touch").scrollIntoViewIfNeeded();
    await expect(page.getByText("Stay in Touch")).toBeVisible();
    await expect(page.getByPlaceholder("Your email")).toBeVisible();
  });
});
