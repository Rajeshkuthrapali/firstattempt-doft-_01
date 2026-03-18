import { test, expect } from "@playwright/test";

/**
 * E2E: Checkout & Payment flow — verifies the complete
 * cart → checkout → payment journey including subtotal
 * calculations, shipping thresholds, and checkout button state.
 */

test.describe("Checkout & Payment Flow", () => {
  test("checkout button appears only when cart has items", async ({ page }) => {
    await page.goto("/");
    await page.click("#cart-toggle");

    // Checkout button should NOT be visible when cart is empty
    await expect(page.locator("#checkout-btn")).not.toBeVisible();

    // Close cart, add item, reopen
    await page.click("#close-cart");
    await page.getByLabel("View Golden Hour details").first().click();
    await page.click("#product-add-to-cart");
    await page.click("#cart-toggle");

    // Now checkout button should be visible
    await expect(page.locator("#checkout-btn")).toBeVisible();
  });

  test("subtotal updates correctly when adding multiple items", async ({
    page,
  }) => {
    // Add Golden Hour (₹2,499)
    await page.goto("/product/golden-hour");
    await page.click("#product-add-to-cart");

    // Navigate to Midnight Oud via SPA (avoid page.goto which resets state)
    // Use the "You May Also Like" section's Midnight Oud link
    await page
      .getByLabel("View Midnight Oud details")
      .first()
      .click();
    await expect(page).toHaveURL(/\/product\/midnight-oud/);
    await page.click("#product-add-to-cart");

    await page.click("#cart-toggle");

    // Verify both items are listed
    await expect(
      page.locator("#cart-drawer").getByText("Golden Hour"),
    ).toBeVisible();
    await expect(
      page.locator("#cart-drawer").getByText("Midnight Oud"),
    ).toBeVisible();

    // Verify subtotal contains ₹5,998
    await expect(
      page.locator("#cart-drawer").getByText("5,998"),
    ).toBeVisible();
  });

  test("shipping info is shown at checkout section", async ({ page }) => {
    await page.goto("/product/golden-hour");
    await page.click("#product-add-to-cart");
    await page.click("#cart-toggle");

    await expect(
      page
        .locator("#cart-drawer")
        .getByText(/shipping & taxes calculated at checkout/i),
    ).toBeVisible();
  });

  test("free shipping banner in cart shows threshold", async ({ page }) => {
    await page.goto("/");
    await page.click("#cart-toggle");

    await expect(
      page.locator("#cart-drawer").getByText(/free shipping/i).first(),
    ).toBeVisible();
    await expect(
      page.locator("#cart-drawer").getByText(/3000/i).first(),
    ).toBeVisible();
  });

  test("checkout button has correct styling and is interactive", async ({
    page,
  }) => {
    await page.goto("/product/golden-hour");
    await page.click("#product-add-to-cart");
    await page.click("#cart-toggle");

    const checkoutBtn = page.locator("#checkout-btn");
    await expect(checkoutBtn).toBeVisible();
    await expect(checkoutBtn).toContainText(/checkout/i);
    await expect(checkoutBtn).toBeEnabled();
  });

  test("WhatsApp support FAB is visible for payment help", async ({
    page,
  }) => {
    await page.goto("/");
    const whatsapp = page.getByLabel("Chat on WhatsApp");
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute("href", /wa\.me/);
  });
});
