import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage should load", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });
  test("collection page should load", async ({ page }) => {
    await page.goto("/collections/bestsellers");
    await expect(page.locator("h1")).toContainText("Bestsellers");
  });
  test("search page should load", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("input")).toBeVisible();
  });
  test("about page should load", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("h1")).toContainText("Our Story");
  });
});
