import { test, expect } from "@playwright/test";

test.describe("Content Pages", () => {
  test.skip("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("h1")).toContainText("Our Story");
  });
  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toContainText("Contact");
  });
  test("policies load", async ({ page }) => {
    await page.goto("/policy/shipping");
    await expect(page.locator("h1")).toContainText("Shipping Policy");
  });
  test("newsletter form exists", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Subscribe")).toBeVisible();
  });
});
