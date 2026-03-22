import { onLCP, onINP, onCLS, onFCP, onTTFB, type Metric } from "web-vitals";

/**
 * Sends a web-vitals metric to GA4 as a `web_vital` custom event.
 * No-ops if `window.gtag` is unavailable (e.g. GA4 not configured, SSR).
 * CLS is scaled ×1000 so all values are integer-friendly for GA4.
 */
function sendToGA4(metric: Metric): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "web_vital", {
    event_category: "Web Vitals",
    event_label: metric.id,
    value: Math.round(
      metric.name === "CLS" ? metric.value * 1000 : metric.value,
    ),
    metric_name: metric.name,
    metric_rating: metric.rating, // "good" | "needs-improvement" | "poor"
    non_interaction: true,
  });
}

/**
 * Initialises Real User Monitoring (RUM) via the web-vitals library.
 *
 * Registers observers for all five Core Web Vitals:
 * - LCP  — Largest Contentful Paint
 * - INP  — Interaction to Next Paint  (v3 replacement for FID)
 * - CLS  — Cumulative Layout Shift
 * - FCP  — First Contentful Paint
 * - TTFB — Time to First Byte
 *
 * Each metric is forwarded to GA4 as a `web_vital` event.
 * Call once in `main.tsx` after `initGA4()`.
 */
export function initRUM(): void {
  onLCP(sendToGA4);
  onINP(sendToGA4);
  onCLS(sendToGA4);
  onFCP(sendToGA4);
  onTTFB(sendToGA4);
}
