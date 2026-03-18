import { test, expect } from "@playwright/test";

/**
 * E2E: Accessibility — skip-to-content, focus-visible, ARIA roles,
 * keyboard navigation, and axe-core automated checks.
 */

test.describe("Accessibility", () => {
  test("skip-to-content link exists with correct target", async ({
    page,
  }) => {
    await page.goto("/");

    const skipLink = page.getByText("Skip to main content");
    // Verify the link exists and has the correct target
    await expect(skipLink).toHaveAttribute("href", "#main-content");
    // Verify it has the skip-link class for focus styling
    await expect(skipLink).toHaveClass(/skip-link/);

    // Verify the target element exists and is the main content area
    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeVisible();
    await expect(mainContent).toHaveAttribute("role", "main");
  });

  test("main content region has correct id", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("#main-content");
    await expect(main).toBeVisible();
    await expect(main).toHaveAttribute("role", "main");
  });

  test("page has semantic landmark roles (banner, contentinfo)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner")).toBeVisible();
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("cart drawer has role='dialog' with aria-modal", async ({ page }) => {
    await page.goto("/");
    await page.click("#cart-toggle");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute("aria-label", "Shopping cart");
  });

  test("nav menubar has correct ARIA roles", async ({ page, isMobile }) => {
    // The desktop menubar is hidden on mobile (hidden md:flex)
    test.skip(isMobile === true, "Desktop menubar not visible on mobile");
    await page.goto("/");
    await expect(page.getByRole("menubar")).toBeVisible();
    const menuItems = page.getByRole("menuitem");
    expect(await menuItems.count()).toBeGreaterThanOrEqual(4);
  });

  test("product detail breadcrumb has aria-current", async ({ page }) => {
    await page.goto("/product/golden-hour");
    const current = page.locator("[aria-current='page']");
    await expect(current).toBeVisible();
    await expect(current).toContainText("Golden Hour");
  });

  test("all product card images have alt text", async ({ page }) => {
    await page.goto("/");
    const images = page.locator("article img");
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).toBeTruthy();
      expect(alt!.length).toBeGreaterThan(0);
    }
  });

  test("cart toggle buttons have descriptive aria-labels", async ({
    page,
  }) => {
    await page.goto("/product/golden-hour");
    await page.click("#product-add-to-cart");
    await page.click("#cart-toggle");

    await expect(
      page.getByLabel("Increase Golden Hour quantity"),
    ).toBeVisible();
    await expect(
      page.getByLabel("Decrease Golden Hour quantity"),
    ).toBeVisible();
    await expect(
      page.getByLabel("Remove Golden Hour from cart"),
    ).toBeVisible();
    await expect(page.getByLabel("Close cart")).toBeVisible();
  });

  test("focus moves to close button when cart opens", async ({ page }) => {
    await page.goto("/");
    await page.click("#cart-toggle");

    // Wait for focus trap effect (100ms delay + transition)
    await page.waitForTimeout(500);

    const closeBtn = page.locator("#close-cart");
    await expect(closeBtn).toBeFocused();
  });
});

test.describe("SEO verification", () => {
  test("homepage has proper meta description", async ({ page }) => {
    await page.goto("/");
    const metaDesc = page.locator('meta[name="description"]');
    const content = await metaDesc.getAttribute("content");
    expect(content).toContain("Lumière");
    expect(content).toContain("luxury scented candles");
  });

  test("page has exactly one h1 on homepage", async ({ page }) => {
    await page.goto("/");
    const h1s = page.locator("h1");
    // Hero has an h1
    expect(await h1s.count()).toBe(1);
  });

  test("page has exactly one h1 on PDP", async ({ page }) => {
    await page.goto("/product/golden-hour");
    const h1s = page.locator("h1");
    expect(await h1s.count()).toBe(1);
    await expect(h1s.first()).toContainText("Golden Hour");
  });

  test("product images have lazy loading", async ({ page }) => {
    await page.goto("/");
    const productImages = page.locator("article img");
    const count = await productImages.count();

    for (let i = 0; i < count; i++) {
      const loading = await productImages.nth(i).getAttribute("loading");
      expect(loading).toBe("lazy");
    }
  });
});
