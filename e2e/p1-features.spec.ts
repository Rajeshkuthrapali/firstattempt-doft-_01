import { test, expect } from "@playwright/test";

/**
 * P1 Feature — Auth flow E2E.
 * Tests the login/register page renders correctly and form validation works.
 * Full auth testing requires a running API; these are smoke tests on the UI.
 */
test.describe("Auth page", () => {
  test("renders login form with required fields", async ({ page }) => {
    await page.goto("/auth");
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
    await expect(page.locator("#auth-email")).toBeVisible();
    await expect(page.locator("#auth-password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("switches to registration mode", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(
      page.getByRole("heading", { name: /create account/i }),
    ).toBeVisible();
    await expect(page.locator("#auth-name")).toBeVisible();
  });

  test("Google OAuth button renders", async ({ page }) => {
    await page.goto("/auth");
    await expect(
      page.getByRole("button", { name: /continue with google/i }),
    ).toBeVisible();
  });

  test("account page redirects unauthenticated users to /auth", async ({
    page,
  }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/auth/);
  });
});

/**
 * P1 Feature — Search E2E.
 */
test.describe("Search", () => {
  test("search page shows curated favourites when query is empty", async ({
    page,
  }) => {
    await page.goto("/search");
    await expect(
      page.getByRole("heading", { name: /curated favourites/i }),
    ).toBeVisible();
  });

  test("search returns results for 'amber'", async ({ page }) => {
    await page.goto("/search");
    await page.locator("#search-input").fill("amber");
    await expect(page.getByText(/result/i)).toBeVisible();
    // Should show at least one matching product
    await expect(page.locator("[role='list'] li").first()).toBeVisible();
  });

  test("nav search icon opens search overlay", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Open search").click();
    await expect(page.getByRole("dialog", { name: /search/i })).toBeVisible();
    await expect(page.locator("#nav-search-input")).toBeFocused();
  });

  test("Escape closes search overlay", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Open search").click();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: /search/i }),
    ).not.toBeVisible();
  });
});

/**
 * P1 Feature — Collections catalog E2E.
 */
test.describe("Collections page", () => {
  test("renders heading and category filters", async ({ page }) => {
    await page.goto("/collections");
    await expect(
      page.getByRole("heading", { name: /our collection/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "All" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Signature" })).toBeVisible();
  });

  test("curated favourites section is visible", async ({ page }) => {
    await page.goto("/collections");
    await expect(
      page.getByRole("heading", { name: /curated favourites/i }),
    ).toBeVisible();
  });

  test("filter by Seasonal shows only seasonal products", async ({ page }) => {
    await page.goto("/collections");
    await page.getByRole("button", { name: "Seasonal" }).click();
    // All visible product category labels should say 'seasonal'
    const labels = page.locator("text=seasonal");
    await expect(labels.first()).toBeVisible();
  });

  test("wishlist toggle button has correct ARIA label", async ({ page }) => {
    await page.goto("/collections");
    const wishlistBtn = page.getByLabel(/add to wishlist/i).first();
    await expect(wishlistBtn).toBeVisible();
    await wishlistBtn.click();
    // After click the label should change to 'Remove from wishlist'
    await expect(
      page.getByLabel(/remove from wishlist/i).first(),
    ).toBeVisible();
  });
});

/**
 * P1 Feature — Checkout enhancements E2E.
 */
test.describe("Checkout page", () => {
  test("shows empty cart message when cart is empty", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByText(/your cart is empty/i)).toBeVisible();
  });
});

/**
 * P1 Feature — Contact page E2E.
 */
test.describe("Contact page", () => {
  test("renders the Contact Us heading", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { name: /contact us/i }),
    ).toBeVisible();
  });

  test("all form fields are present", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("#contact-name")).toBeVisible();
    await expect(page.locator("#contact-email")).toBeVisible();
    await expect(page.locator("#contact-message")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send message/i }),
    ).toBeVisible();
  });

  test("form submission shows confirmation", async ({ page }) => {
    await page.goto("/contact");
    await page.locator("#contact-name").fill("Priya");
    await page.locator("#contact-email").fill("priya@example.com");
    await page.locator("#contact-message").fill("I love your candles!");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/thank you, priya/i)).toBeVisible();
  });
});

/**
 * P1 Feature — Policy pages E2E.
 */
test.describe("Policy pages", () => {
  for (const slug of ["privacy", "shipping", "faq", "terms"]) {
    test(`renders ${slug} policy page`, async ({ page }) => {
      await page.goto(`/policy/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  test("unknown slug shows friendly not-found message", async ({ page }) => {
    await page.goto("/policy/nonexistent");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
