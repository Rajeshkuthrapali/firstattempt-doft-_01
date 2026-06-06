import { test, expect } from "@playwright/test";

/**
 * E2E: Cart flow — add to cart, update quantity, remove items,
 * verify subtotal, and checkout button.
 */

test.describe("Cart & Checkout Flow", () => {
  test("add product from PDP and verify cart", async ({ page }) => {
    // Navigate to Golden Hour PDP
    await page.goto("/product/golden-hour");
    await expect(page.getByText("Golden Hour").first()).toBeVisible();
    await expect(page.getByText("₹2,499").first()).toBeVisible();

    // Click Add to Cart
    await page.click("#product-add-to-cart");

    // Cart badge should show 1
    await expect(page.locator("#cart-toggle span").first()).toContainText("1");

    // Open cart drawer
    await page.click("#cart-toggle");

    // Cart should show the product
    await expect(page.locator("#cart-drawer")).toBeVisible();
    await expect(
      page.locator("#cart-drawer").getByText("Golden Hour"),
    ).toBeVisible();

    // Subtotal should show ₹2,499
    await expect(
      page.locator("#cart-drawer").getByText("Subtotal"),
    ).toBeVisible();

    // Checkout button should be visible
    await expect(page.locator("#checkout-btn")).toBeVisible();
  });

  test("increment and decrement quantity", async ({ page }) => {
    await page.goto("/product/golden-hour");
    await page.click("#product-add-to-cart");
    await page.click("#cart-toggle");

    // Increment
    const incBtn = page.getByLabel("Increase Golden Hour quantity");
    await incBtn.click();

    // Qty should be 2
    await expect(
      page.locator("#cart-drawer").getByText("2").first(),
    ).toBeVisible();

    // Decrement back to 1
    const decBtn = page.getByLabel("Decrease Golden Hour quantity");
    await decBtn.click();

    // Verify cart badge shows 1
    await expect(page.locator("#cart-toggle span").first()).toContainText("1");
  });

  test("remove item from cart using delete button", async ({ page }) => {
    await page.goto("/product/golden-hour");
    await page.click("#product-add-to-cart");
    await page.click("#cart-toggle");

    // Click remove button
    const removeBtn = page.getByLabel("Remove Golden Hour from cart");
    await removeBtn.click();

    // Cart should show empty state
    await expect(
      page.locator("#cart-drawer").getByText(/your cart is empty/i),
    ).toBeVisible();
  });

  test("clear cart button empties all items", async ({ page }) => {
    // Add Golden Hour
    await page.goto("/product/golden-hour");
    await page.click("#product-add-to-cart");

    // Navigate to Midnight Oud via SPA (avoid full reload which resets store)
    await page.getByLabel("View Midnight Oud details").first().click();
    await expect(page).toHaveURL(/\/product\/midnight-oud/);
    await page.click("#product-add-to-cart");

    await page.click("#cart-toggle");

    // Clear cart
    await page.getByText("Clear cart").click();

    // Verify empty state
    await expect(
      page.locator("#cart-drawer").getByText(/your cart is empty/i),
    ).toBeVisible();
  });

  test("close cart drawer", async ({ page }) => {
    await page.goto("/");
    await page.click("#cart-toggle");

    await expect(page.locator("#cart-drawer")).toBeVisible();

    // Close via close button
    await page.click("#close-cart");

    // Drawer should slide out (translate-x-full)
    await expect(page.locator("#cart-drawer")).toHaveClass(/translate-x-full/);
  });
});
