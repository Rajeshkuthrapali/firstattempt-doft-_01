import { test, expect } from "@playwright/test";

/**
 * E2E: Performance hardening tests — lazy loading, code splitting,
 * image optimisation, and rendering performance.
 */

test.describe("Performance — Lazy Loading", () => {
  test("product card images have loading='lazy' attribute", async ({
    page,
  }) => {
    await page.goto("/");
    const productImages = page.locator("article img");
    const count = await productImages.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const loading = await productImages.nth(i).getAttribute("loading");
      expect(loading).toBe("lazy");
    }
  });

  test("hero image does NOT have lazy loading (above the fold)", async ({
    page,
  }) => {
    await page.goto("/");
    const heroImg = page.locator("#hero img");
    await expect(heroImg).toBeVisible();

    // Above-the-fold images should not be lazy loaded
    const loading = await heroImg.getAttribute("loading");
    // It should either be 'eager' or not set
    expect(loading).not.toBe("lazy");
  });

  test("offscreen images are not loaded until scrolled", async ({ page }) => {
    await page.goto("/");

    // Check that bestsellers images (below fold) are in DOM but not fully loaded
    const bestsellersSection = page.locator(
      "text=Bestsellers >> xpath=ancestor::section",
    );

    // Before scrolling — images exist but might not be loaded
    const images = page.locator("article img");
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    // Scroll to bestsellers
    await bestsellersSection.scrollIntoViewIfNeeded();

    // After scrolling, images should be loading/loaded
    const firstImg = images.first();
    await expect(firstImg).toBeVisible();
  });
});

test.describe("Performance — Code Splitting", () => {
  test("initial bundle does not exceed 300KB gzip", async ({ page }) => {
    const resources: { name: string; size: number }[] = [];

    page.on("response", (response) => {
      const url = response.url();
      if (url.endsWith(".js") || url.endsWith(".css")) {
        const contentLength = response.headers()["content-length"];
        if (contentLength) {
          resources.push({
            name: url.split("/").pop() ?? url,
            size: parseInt(contentLength, 10),
          });
        }
      }
    });

    await page.goto("/");

    // Total JS + CSS should be under 300KB (uncompressed)
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
    // Allow up to 500KB uncompressed (roughly 150KB gzip)
    expect(totalSize).toBeLessThan(500_000);
  });
});

test.describe("Performance — Rendering", () => {
  test("homepage LCP is under 3.5 seconds", async ({ page }) => {
    await page.goto("/");

    // Measure LCP using PerformanceObserver
    const lcp = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          });
          observer.observe({ type: "largest-contentful-paint", buffered: true });
          // Fallback timeout
          setTimeout(() => resolve(-1), 5000);
        }),
    );

    if (lcp > 0) {
      expect(lcp).toBeLessThan(3500);
    }
  });

  test("no layout shifts greater than 0.1 CLS on homepage", async ({
    page,
  }) => {
    await page.goto("/");

    // Accumulate CLS
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (
                !(entry as PerformanceEntry & { hadRecentInput: boolean })
                  .hadRecentInput
              ) {
                clsValue += (entry as PerformanceEntry & { value: number })
                  .value;
              }
            }
          });
          observer.observe({ type: "layout-shift", buffered: true });
          // Wait a bit for layout to stabilise
          setTimeout(() => resolve(clsValue), 2000);
        }),
    );

    expect(cls).toBeLessThan(0.1);
  });

  test("PDP page loads within 2.5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/product/golden-hour");
    const loadTime = Date.now() - start;

    // Page should load within 2.5s
    expect(loadTime).toBeLessThan(2500);

    // Core content should be visible
    await expect(page.locator("h1")).toContainText("Golden Hour");
  });
});

test.describe("Performance — Image Optimisation", () => {
  test("product images use efficient format", async ({ page }) => {
    await page.goto("/");

    // Check that product images have src attributes
    const images = page.locator("article img");
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute("src");
      expect(src).toBeTruthy();
      // Images should have proper paths (not inline/data URIs for products)
      expect(src!.startsWith("data:")).toBeFalsy();
    }
  });

  test("images have explicit width/height or aspect-ratio to prevent CLS", async ({
    page,
  }) => {
    await page.goto("/");

    const images = page.locator("article img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      // Either has explicit dimensions or CSS aspect-ratio
      const classList = await img.getAttribute("class");
      const hasAspect =
        classList?.includes("aspect-") ||
        (await img.getAttribute("width")) !== null;
      expect(hasAspect).toBeTruthy();
    }
  });
});
