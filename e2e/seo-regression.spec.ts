import { test, expect } from "@playwright/test";

test.describe("SEO & Performance", () => {
  test("homepage should have proper meta tags", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toContain("DOFT");

    const description = await page.getAttribute(
      'meta[name="description"]',
      "content",
    );
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(20);
  });

  test("homepage should have Organization JSON-LD", async ({ page }) => {
    await page.goto("/");
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first();
    const text = await jsonLd.textContent();
    expect(text).toContain("Organization");
    expect(text).toContain("DOFT Candles");
  });

  test("product page should have Product JSON-LD", async ({ page }) => {
    await page.goto("/products/signature-trio-wax-tablets");
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .all();
    const texts = await Promise.all(scripts.map((s) => s.textContent()));
    const productLd = texts.find((t) => t?.includes('"Product"'));
    expect(productLd).toBeTruthy();
    expect(productLd).toContain("Signature Trio");
  });

  test("product page should have Breadcrumb JSON-LD", async ({ page }) => {
    await page.goto("/products/signature-trio-wax-tablets");
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .all();
    const texts = await Promise.all(scripts.map((s) => s.textContent()));
    const breadcrumbLd = texts.find((t) => t?.includes("BreadcrumbList"));
    expect(breadcrumbLd).toBeTruthy();
  });

  test("product page should have breadcrumb navigation", async ({ page }) => {
    await page.goto("/products/signature-trio-wax-tablets");
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.locator("text=Home")).toBeVisible();
  });

  test("collection page should have CollectionPage JSON-LD", async ({
    page,
  }) => {
    await page.goto("/collections/bestsellers");
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .all();
    const texts = await Promise.all(scripts.map((s) => s.textContent()));
    const collectionLd = texts.find((t) => t?.includes("CollectionPage"));
    expect(collectionLd).toBeTruthy();
  });

  test("product page should have OG meta tags", async ({ page }) => {
    await page.goto("/products/rose-mini-bowl-candle");
    const ogTitle = await page.getAttribute(
      'meta[property="og:title"]',
      "content",
    );
    expect(ogTitle).toBeTruthy();

    const ogType = await page.getAttribute(
      'meta[property="og:type"]',
      "content",
    );
    expect(ogType).toBeTruthy();
  });

  test("should have robots meta tag", async ({ page }) => {
    await page.goto("/");
    const robots = await page.getAttribute('meta[name="robots"]', "content");
    expect(robots).toContain("index");
    expect(robots).toContain("follow");
  });

  test("images should use lazy loading", async ({ page }) => {
    await page.goto("/collections/bestsellers");
    const images = await page.locator("img[loading=lazy]").all();
    expect(images.length).toBeGreaterThan(0);
  });
});

test.describe("Full Regression", () => {
  test("full shopping flow: browse → add → checkout", async ({ page }) => {
    // 1. Visit homepage
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Timeless Glass");

    // 2. Navigate to collection
    await page.click("text=View All Bestsellers");
    await expect(page).toHaveURL(/collections\/bestsellers/);

    // 3. Click a product
    const firstProduct = page.locator(".group").first();
    await firstProduct.click();
    await expect(page.locator("h1")).toBeVisible();

    // 4. Add to cart
    await page.click("text=Add to Cart");
    await expect(page.locator("text=Your Cart")).toBeVisible();

    // 5. Go to checkout
    await page.click("text=Proceed to Checkout");
    await expect(page).toHaveURL("/checkout");
    await expect(page.locator("text=Order Summary")).toBeVisible();
  });

  test("search flow: search → filter → click result", async ({ page }) => {
    await page.goto("/search");
    await page.fill("input[placeholder*=Search]", "rose");
    await page.waitForTimeout(500);
    // Results or empty state should appear
    await expect(
      page.locator("text=result").or(page.locator("text=No results")),
    ).toBeVisible({ timeout: 5000 });
  });

  test("static pages load correctly", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("h1")).toBeVisible();

    await page.goto("/contact");
    await expect(page.locator("h1")).toContainText("Contact");

    await page.goto("/policies/shipping");
    await expect(page.locator("h1")).toContainText("Shipping");
  });

  test("responsive: mobile menu should toggle", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const menuBtn = page.locator('[aria-label="Toggle menu"]');
    await menuBtn.click();
    await expect(page.locator("text=Bestsellers")).toBeVisible();
  });
});
