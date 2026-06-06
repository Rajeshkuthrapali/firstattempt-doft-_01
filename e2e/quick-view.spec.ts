import { test, expect } from "@playwright/test";

test.describe("Quick View Modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Quick View button appears on product card hover", async ({ page }) => {
    const card = page.locator("article").first();
    await card.hover();
    const quickViewBtn = card.locator("button", { hasText: /quick view/i });
    await expect(quickViewBtn).toBeVisible();
  });

  test.skip("clicking Quick View opens the modal", async ({ page }) => {
    const card = page.locator("article").first();
    await card.hover();
    await card.locator("button", { hasText: /quick view/i }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute("aria-modal", "true");
  });

  test("modal displays product name and price", async ({ page }) => {
    await page.locator("article").first().hover();
    await page.locator("article").first().locator("button", { hasText: /quick view/i }).click();
    const modal = page.getByRole("dialog");
    await expect(modal.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(modal.getByText(/₹/)).toBeVisible();
  });

  test.skip("Escape key closes the modal", async ({ page }) => {
    await page.locator("article").first().hover();
    await page.locator("article").first().locator("button", { hasText: /quick view/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });
  });

  test.skip("clicking backdrop closes the modal", async ({ page }) => {
    await page.locator("article").first().hover();
    await page.locator("article").first().locator("button", { hasText: /quick view/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // Click the backdrop (fixed overlay behind the panel)
    await page.locator("[aria-hidden='true']").first().click({ position: { x: 5, y: 5 } });
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test.skip("Add to Cart from modal increments the cart badge", async ({ page }) => {
    await page.locator("article").first().hover();
    await page.locator("article").first().locator("button", { hasText: /quick view/i }).click();
    const addBtn = page.getByRole("dialog").getByRole("button", { name: /add to cart/i });
    await addBtn.click();
    // Modal should close
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });
    // Cart badge should show ≥1
    const badge = page.locator("button[aria-label*='cart'] span");
    await expect(badge).toBeVisible({ timeout: 10000 });
  });
});
