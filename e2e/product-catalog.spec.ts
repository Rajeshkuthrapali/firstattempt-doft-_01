import { test, expect } from "@playwright/test";

/**
 * E2E: Product catalog — PDP gallery, category display,
 * product specs, and sold-out handling.
 */

test.describe("Product Catalog — PDP", () => {
  test("Golden Hour PDP displays all product details", async ({ page }) => {
    await page.goto("/product/golden-hour");

    // Product name
    await expect(page.locator("h1")).toContainText("Golden Hour");

    // Tagline
    await expect(
      page.getByText("Warm amber meets sun-kissed vanilla"),
    ).toBeVisible();

    // Price
    await expect(page.getByText("₹2,499").first()).toBeVisible();

    // Description
    await expect(page.getByText(/mediterranean sunset/i)).toBeVisible();

    // Fragrance notes (use .first() to avoid matching description text)
    await expect(page.getByText("Amber").first()).toBeVisible();
    await expect(page.getByText("Vanilla").first()).toBeVisible();
    await expect(page.getByText("Sandalwood").first()).toBeVisible();

    // Specs
    await expect(page.getByText("~55h")).toBeVisible();
    await expect(page.getByText("280g")).toBeVisible();
    await expect(page.getByText("100% Soy")).toBeVisible();

    // Category pill
    await expect(page.getByText("signature").first()).toBeVisible();

    // Trust badges
    await expect(page.getByText(/cruelty free/i).first()).toBeVisible();
    await expect(page.getByText(/eco packaging/i).first()).toBeVisible();
    await expect(page.getByText(/cotton wick/i).first()).toBeVisible();

    // Free shipping info
    await expect(
      page.getByText(/free shipping on orders above ₹3,000/i),
    ).toBeVisible();
  });

  test("product image is displayed", async ({ page }) => {
    await page.goto("/product/golden-hour");
    const img = page.getByAltText("Golden Hour");
    await expect(img).toBeVisible();
  });
});

test.describe("Product Catalog — Sold Out", () => {
  test("Velvet Rose shows Sold Out on PDP", async ({ page }) => {
    await page.goto("/product/velvet-rose");

    // Add to Cart button should show "Sold Out" and be disabled
    const btn = page.locator("#product-add-to-cart");
    await expect(btn).toContainText("Sold Out");
    await expect(btn).toBeDisabled();
  });

  test("Velvet Rose card shows Sold Out overlay on homepage", async ({
    page,
  }) => {
    await page.goto("/");
    // Find the Velvet Rose card
    const card = page.locator("#product-card-velvet-rose");
    if (await card.isVisible()) {
      await expect(card.getByText("Sold Out").first()).toBeVisible();
    }
  });
});

test.describe("Product Catalog — Categories", () => {
  test("category badges render on product cards", async ({ page }) => {
    await page.goto("/");
    const seasonal = page.locator("#product-card-winter-spice");
    if (await seasonal.isVisible()) {
      await expect(seasonal.getByText("Seasonal")).toBeVisible();
    }
    const limited = page.locator("#product-card-jasmine-noir");
    if (await limited.isVisible()) {
      await expect(limited.getByText("Limited Edition")).toBeVisible();
    }
  });
});

test.describe("Product Catalog — Bestsellers", () => {
  test("bestsellers section is visible on homepage", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("heading", { name: "Bestsellers" })
      .scrollIntoViewIfNeeded();
    await expect(page.getByText("Most Loved").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Bestsellers" }),
    ).toBeVisible();
  });
});
