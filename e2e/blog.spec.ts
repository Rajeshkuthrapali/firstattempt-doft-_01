import { test, expect } from "@playwright/test";

test.describe("Blog — Journal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
  });

  test("blog listing page loads and shows posts", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /stories of scent/i })).toBeVisible();
    // At least one post card link should be present
    const postLinks = page.getByRole("link").filter({ hasText: /read|view|art of slow/i });
    await expect(postLinks.first()).toBeVisible();
  });

  test("clicking a post navigates to article page", async ({ page }) => {
    // Click the first post link that goes to /blog/
    const blogLinks = page.locator('a[href*="/blog/"]');
    await blogLinks.first().click();
    await expect(page.url()).toContain("/blog/");
    // Article page should render a heading
    await expect(page.getByRole("article")).toBeVisible();
  });

  test("article page has BlogPosting JSON-LD script", async ({ page }) => {
    await page.goto("/blog/the-art-of-slow-living");
    const jsonLd = page.locator('script[type="application/ld+json"]#blog-posting-jsonld');
    await expect(jsonLd).toBeAttached();
    const content = await jsonLd.textContent();
    const parsed = JSON.parse(content ?? "{}");
    expect(parsed["@type"]).toBe("BlogPosting");
    expect(parsed.headline).toBeTruthy();
  });

  test("article page shows breadcrumb navigation", async ({ page }) => {
    await page.goto("/blog/the-art-of-slow-living");
    const breadcrumb = page.getByRole("navigation", { name: /breadcrumb/i });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("Journal")).toBeVisible();
  });

  test("non-existent article shows 404 message", async ({ page }) => {
    await page.goto("/blog/this-post-does-not-exist");
    await expect(page.getByText(/article not found/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /back to journal/i })).toBeVisible();
  });
});
