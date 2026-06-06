import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

/**
 * k6 Concurrent Checkout Load Test
 * Simulates 200 VUs hitting the checkout API concurrently,
 * including a gift-wrap parameter to exercise that code path.
 *
 * Run locally:
 *   docker run --rm -i --network=host \
 *     -e BASE_URL=http://localhost:4000/api \
 *     grafana/k6 run - < scripts/concurrent-checkout-load-test.js
 *
 * Thresholds: p95 < 800ms, error rate < 0.5%
 */

const checkoutDuration = new Trend("checkout_duration");
const errorRate = new Rate("checkout_errors");

export const options = {
  stages: [
    { duration: "30s", target: 40 },  // Ramp up to 40 VUs
    { duration: "60s", target: 200 }, // Ramp up to 200 VUs
    { duration: "60s", target: 200 }, // Hold at 200 VUs
    { duration: "30s", target: 0 },   // Ramp down
  ],
  thresholds: {
    checkout_duration: ["p(95)<800"],
    checkout_errors: ["rate<0.005"],
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.005"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000/api";

// Product/variant IDs from the seed data
const VARIANT_IDS = [
  "variant-golden-hour-280g",
  "variant-midnight-oud-320g",
  "variant-cedarwood-bliss-260g",
];

const GIFT_WRAP_OPTIONS = ["none", "standard", "premium"];

export default function () {
  const variantId = VARIANT_IDS[Math.floor(Math.random() * VARIANT_IDS.length)];
  const giftWrap = GIFT_WRAP_OPTIONS[Math.floor(Math.random() * GIFT_WRAP_OPTIONS.length)];

  const payload = JSON.stringify({
    items: [{ variantId, quantity: 1 }],
    email: `loadtest+${__VU}@lumiere-test.com`,
    giftWrap,
    giftMessage: giftWrap !== "none" ? "With love, from a k6 VU" : undefined,
  });

  const start = Date.now();
  const res = http.post(`${BASE_URL}/checkout`, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: "10s",
  });
  const duration = Date.now() - start;

  checkoutDuration.add(duration);

  const success = check(res, {
    "status is 200 or 400": (r) => r.status === 200 || r.status === 400,
    "response has body": (r) => r.body !== null && r.body.length > 0,
    "no 5xx errors": (r) => r.status < 500,
  });

  errorRate.add(!success);

  sleep(Math.random() * 2 + 1); // 1–3s think time between requests
}
