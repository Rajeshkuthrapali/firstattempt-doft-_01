import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage should load", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });
  test("collection page should load", async ({ page }) => {
    await page.goto("/collections");
    await expect(page.locator("h1")).toContainText("Collection");
  });
  test("search page should load", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("input")).toBeVisible();
  });
  test.skip("blog page should load", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("h1")).toContainText("Journal");
  });
});
