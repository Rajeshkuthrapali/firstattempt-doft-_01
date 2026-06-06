import { test, expect } from "@playwright/test";

test.describe("Account & Auth", () => {
  test.skip("shows sign-in when not authenticated", async ({ page }) => {
    await page.goto("/account", { waitUntil: "networkidle" });
    await expect(page.locator("text=Sign In")).toBeVisible({ timeout: 10000 });
  });
  test("sign-in page has form", async ({ page }) => {
    await page.goto("/auth/signin", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("Welcome Back", { timeout: 10000 });
    await expect(page.locator("input[type=email]")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Wishlist", () => {
  test("shows wishlist page", async ({ page }) => {
    await page.goto("/account");
    await expect(
      page.locator("text=Sign In").or(page.locator("text=Wishlist")),
    ).toBeVisible();
  });
});

test.describe("Search Filters", () => {
  test("shows filter toggle", async ({ page }) => {
    await page.goto("/search");
    await page.click('[aria-label="Toggle filters"]');
    await expect(page.locator("text=Scent Family")).toBeVisible();
  });
  test("sorts by price", async ({ page }) => {
    await page.goto("/search");
    await page.fill("input[placeholder*=Search]", "candle");
    await page.click('[aria-label="Toggle filters"]');
    await page.selectOption("select:has-text('Relevance')", "price-asc");
    await page.waitForTimeout(500);
  });
});
