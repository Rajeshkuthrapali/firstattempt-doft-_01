import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test("should add product to cart from product page", async ({ page }) => {
    await page.goto("/products/signature-trio-wax-tablets");
    await page.click("text=Add to Cart");
    await expect(page.locator("text=Your Cart")).toBeVisible();
  });
  test("should navigate to checkout", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.locator("h1")).toContainText("Checkout");
  });
});
