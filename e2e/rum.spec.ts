import { test, expect } from "@playwright/test";

/**
 * Playwright E2E integration test for RUM instrumentation.
 *
 * Stubs window.gtag before page load so web-vitals callbacks write into
 * window.__rumEvents instead of hitting real GA4. Asserts that LCP, INP,
 * and CLS all fire as `web_vital` events after a brief user interaction.
 */

// Extend Window type for the test stub
declare global {
  interface Window {
    __rumEvents: unknown[][];
  }
}

test.describe("RUM – web_vital GA4 events", () => {
  test("fires LCP, INP, and CLS web_vital events", async ({ page }) => {
    // Inject gtag stub BEFORE any scripts run
    await page.addInitScript(() => {
      window.__rumEvents = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag = (...args: unknown[]) => {
        window.__rumEvents.push(args);
      };
    });

    await page.goto("/");

    // Trigger a user interaction to help flush INP
    await page.click("body");
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);

    // web-vitals emits on page lifecycle — wait for metrics to flush
    await page.waitForTimeout(3500);

    // Collect all web_vital events recorded by the stub
    const rumEvents = await page.evaluate(() =>
      window.__rumEvents.filter(
        (e) => e[0] === "event" && e[1] === "web_vital",
      ),
    );

    const metricNames = rumEvents.map((e) => {
      const payload = e[2] as Record<string, unknown>;
      return payload.metric_name as string;
    });

    // LCP must fire on every page load
    expect(metricNames).toContain("LCP");

    // CLS must fire (layout shifts during load)
    expect(metricNames).toContain("CLS");

    // INP fires after user interaction (the click above)
    expect(metricNames).toContain("INP");

    // Validate event shape for the first LCP event
    const lcpEvent = rumEvents.find(
      (e) => (e[2] as Record<string, unknown>).metric_name === "LCP",
    );
    expect(lcpEvent).toBeDefined();
    const lcpPayload = lcpEvent![2] as Record<string, unknown>;
    expect(lcpPayload.event_category).toBe("Web Vitals");
    expect(lcpPayload.non_interaction).toBe(true);
    expect(["good", "needs-improvement", "poor"]).toContain(lcpPayload.metric_rating);
    expect(typeof lcpPayload.value).toBe("number");
  });
});
