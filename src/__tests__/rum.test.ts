import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock web-vitals BEFORE importing rum ──────────────────────────────────────
vi.mock("web-vitals", () => ({
  onLCP: vi.fn(),
  onINP: vi.fn(),
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onTTFB: vi.fn(),
}));

import { onLCP, onINP, onCLS, onFCP, onTTFB } from "web-vitals";
import { initRUM } from "../lib/rum";

// ── Shared gtag spy ───────────────────────────────────────────────────────────
const gtagSpy = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).gtag = gtagSpy;
});

// ─────────────────────────────────────────────────────────────────────────────
describe("initRUM()", () => {
  it("registers observers for all five Core Web Vitals", () => {
    initRUM();
    expect(onLCP).toHaveBeenCalledOnce();
    expect(onINP).toHaveBeenCalledOnce();
    expect(onCLS).toHaveBeenCalledOnce();
    expect(onFCP).toHaveBeenCalledOnce();
    expect(onTTFB).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("sendToGA4 (called by web-vitals observers)", () => {
  /**
   * Capture the callback that initRUM() passes to onLCP/onINP/etc,
   * then invoke it directly to test sendToGA4 behaviour.
   */
  function captureCallback(mockFn: ReturnType<typeof vi.fn>) {
    return (mockFn as ReturnType<typeof vi.fn>).mock.calls[0][0] as (
      m: Record<string, unknown>,
    ) => void;
  }

  it("fires gtag web_vital event with correct shape for LCP", () => {
    initRUM();
    const cb = captureCallback(onLCP as ReturnType<typeof vi.fn>);
    cb({ id: "v3-lcp", name: "LCP", value: 1234.5, rating: "good" });

    expect(gtagSpy).toHaveBeenCalledWith("event", "web_vital", {
      event_category: "Web Vitals",
      event_label: "v3-lcp",
      value: 1235, // Math.round(1234.5)
      metric_name: "LCP",
      metric_rating: "good",
      non_interaction: true,
    });
  });

  it("scales CLS value ×1000 before rounding", () => {
    initRUM();
    const cb = captureCallback(onCLS as ReturnType<typeof vi.fn>);
    cb({ id: "v3-cls", name: "CLS", value: 0.123, rating: "good" });

    expect(gtagSpy).toHaveBeenCalledWith(
      "event",
      "web_vital",
      expect.objectContaining({
        metric_name: "CLS",
        value: 123, // Math.round(0.123 * 1000)
      }),
    );
  });

  it("fires gtag web_vital event for INP (v3 metric)", () => {
    initRUM();
    const cb = captureCallback(onINP as ReturnType<typeof vi.fn>);
    cb({ id: "v3-inp", name: "INP", value: 180, rating: "good" });

    expect(gtagSpy).toHaveBeenCalledWith(
      "event",
      "web_vital",
      expect.objectContaining({
        metric_name: "INP",
        value: 180,
        metric_rating: "good",
      }),
    );
  });

  it("no-ops when window.gtag is absent", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).gtag;
    initRUM();
    const cb = captureCallback(onLCP as ReturnType<typeof vi.fn>);
    cb({ id: "v3-lcp", name: "LCP", value: 500, rating: "good" });
    expect(gtagSpy).not.toHaveBeenCalled();
  });
});
