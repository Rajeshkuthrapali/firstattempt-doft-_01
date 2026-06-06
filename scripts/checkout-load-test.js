/**
 * k6 Checkout Flow Load Test — Lumière Candles
 *
 * Tests the full order + payment initiation flow under concurrent load.
 *
 * Run via Docker (no local k6 install needed):
 *
 *   # Windows / Mac (Docker Desktop):
 *   docker run --rm -i grafana/k6 run - \
 *     -e BASE_URL=http://host.docker.internal:4000/api \
 *     < scripts/checkout-load-test.js
 *
 *   # Linux / GitHub Actions (--network=host):
 *   docker run --rm -i --network=host grafana/k6 run - \
 *     -e BASE_URL=http://localhost:4000/api \
 *     < scripts/checkout-load-test.js
 *
 * Thresholds:
 *   p95 overall    < 800ms
 *   Order creation < 300ms (p95)
 *   Payment init   < 400ms (p95)
 *   Error rate     < 0.5%
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Trend } from "k6/metrics";

const orderCreationTime = new Trend("order_creation_time", true);
const paymentInitTime = new Trend("payment_init_time", true);
const errorCount = new Counter("checkout_errors");

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000/api";

export const options = {
  stages: [
    { duration: "15s", target: 10 }, // ramp up
    { duration: "60s", target: 30 }, // sustained load
    { duration: "15s", target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<800"], // 95th percentile < 800ms
    http_req_failed: ["rate<0.005"], // error rate < 0.5%
    order_creation_time: ["p(95)<300"],
    payment_init_time: ["p(95)<400"],
  },
};

export default function () {
  const headers = { "Content-Type": "application/json" };

  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, { "health: 200": (r) => r.status === 200 });

  // 2. Create order
  const orderPayload = JSON.stringify({
    items: [{ productId: "golden-hour", variantId: "gh-default", quantity: 1 }],
    shippingAddress: {
      name: `Load Test User ${__VU}`,
      line1: "123 Load Test Street",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "IN",
      phone: "+919876543210",
    },
  });

  const orderRes = http.post(`${BASE_URL}/orders`, orderPayload, { headers });
  orderCreationTime.add(orderRes.timings.duration);

  const orderOk = check(orderRes, {
    "order: 200/201": (r) => r.status === 200 || r.status === 201,
    "order: has id": (r) => {
      try {
        return !!JSON.parse(r.body).data.id;
      } catch {
        return false;
      }
    },
  });

  if (!orderOk) {
    errorCount.add(1);
    return;
  }

  const orderId = JSON.parse(orderRes.body).data.id;

  // 3. Initiate payment
  const payRes = http.post(
    `${BASE_URL}/payments/initiate`,
    JSON.stringify({ orderId, gateway: "razorpay" }),
    { headers },
  );
  paymentInitTime.add(payRes.timings.duration);
  check(payRes, {
    "payment: 200": (r) => r.status === 200,
    "payment: has razorpayOrderId": (r) => {
      try {
        return !!JSON.parse(r.body).data.razorpayOrderId;
      } catch {
        return false;
      }
    },
  });

  // 4. Poll order status
  const statusRes = http.get(`${BASE_URL}/orders/${orderId}`);
  check(statusRes, { "status: 200": (r) => r.status === 200 });

  sleep(1);
}
