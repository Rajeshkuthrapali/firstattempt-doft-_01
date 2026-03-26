import type { Metric } from "web-vitals";
import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";
import { trackEvent } from "./analytics";

/**
 * Reports Real User Monitoring (RUM) performance metrics.
 * Pipes all Core Web Vitals into GA4 as custom events.
 */
export function reportWebVitals(onPerfEntry?: (metric: Metric) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
}

/**
 * Sends web-vitals data to GA4 as a custom event.
 * Event name: `web_vitals`, parameters include the metric name, value,
 * rating (good/needs-improvement/poor), and navigation type.
 */
export function sendToGA4(metric: Metric): void {
  trackEvent("web_vitals", {
    metric_name: metric.name,
    metric_value: Math.round(metric.value),
    metric_rating: metric.rating,
    metric_delta: Math.round(metric.delta),
    metric_id: metric.id,
    navigation_type: metric.navigationType,
  });
}

/**
 * Console logger for local development.
 * In production, use `sendToGA4` instead.
 */
export function sendToConsole(metric: Metric): void {
  const color =
    metric.rating === "good" ? "green" : metric.rating === "needs-improvement" ? "orange" : "red";
  console.log(
    `%c[Web Vitals] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`,
    `color: ${color}; font-weight: bold`,
  );
}

/**
 * Combined dispatcher — logs to console in dev, sends to GA4 in production.
 */
export function sendToAnalytics(metric: Metric): void {
  sendToConsole(metric);
  sendToGA4(metric);
}
