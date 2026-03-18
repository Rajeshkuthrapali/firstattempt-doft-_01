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
    await expect(hero.locator("h1")).toContainText("signature");
    await expect(hero.locator("h1")).toContainText("Scented Collection");
  });

  test("announcement bar shows free shipping text", async ({ page }) => {
    await expect(
      page.getByText(/free shipping on orders above/i).first(),
    ).toBeVisible();
  });

  test("brand wordmark and navigation links are visible on desktop", async ({ page }) => {
    await expect(page.getByText("LUMIÈRE").first()).toBeVisible();
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

  test("value props and footer section render correctly", async ({ page }) => {
    const valueProps = page.locator("[aria-label='Brand values']");
    await valueProps.scrollIntoViewIfNeeded();
    await expect(valueProps.getByRole("heading", { name: "Hand-Poured" })).toBeVisible();
    await expect(valueProps.getByRole("heading", { name: "100% Natural Soy" })).toBeVisible();
    await expect(valueProps.getByRole("heading", { name: "Gift-Ready" })).toBeVisible();

    await page.getByRole("heading", { name: "Stay in Touch" }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "Stay in Touch" })).toBeVisible();
    await expect(page.getByPlaceholder("Your email")).toBeVisible();
  });
});
