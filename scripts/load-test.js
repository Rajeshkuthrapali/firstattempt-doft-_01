/**
 * k6 Load Test — Lumière Candles Payment APIs
 *
 * Tests the payment server under concurrent load to verify
 * it can handle expected traffic without degradation.
 *
 * Install: https://k6.io/docs/get-started/installation/
 * Run:     k6 run scripts/load-test.js
 *
 * Thresholds:
 *   - p95 response time < 500ms
 *   - Error rate < 1%
 *   - Throughput > 50 req/s
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Trend } from "k6/metrics";

// Custom metrics
const orderCreationTime = new Trend("order_creation_time", true);
const paymentInitTime = new Trend("payment_init_time", true);
const errorCount = new Counter("error_count");

const BASE_URL = __ENV.API_BASE_URL || "http://localhost:4000/api";

export const options = {
  stages: [
    { duration: "15s", target: 10 }, // Ramp up to 10 users
    { duration: "30s", target: 30 }, // Ramp up to 30 users
    { duration: "60s", target: 50 }, // Sustained 50 users
    { duration: "15s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests < 500ms
    http_req_failed: ["rate<0.01"], // Error rate < 1%
    order_creation_time: ["p(95)<300"],
    payment_init_time: ["p(95)<400"],
  },
};

export default function () {
  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    "health: status 200": (r) => r.status === 200,
  });

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

  const orderRes = http.post(`${BASE_URL}/orders`, orderPayload, {
    headers: { "Content-Type": "application/json" },
  });

  orderCreationTime.add(orderRes.timings.duration);

  const orderOk = check(orderRes, {
    "order: status 200/201": (r) => r.status === 200 || r.status === 201,
    "order: has id": (r) => {
      try {
        return JSON.parse(r.body).data.id !== undefined;
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
    { headers: { "Content-Type": "application/json" } },
  );

  paymentInitTime.add(payRes.timings.duration);

  check(payRes, {
    "payment: status 200": (r) => r.status === 200,
    "payment: has razorpayOrderId": (r) => {
      try {
        return JSON.parse(r.body).data.razorpayOrderId !== undefined;
      } catch {
        return false;
      }
    },
  });

  // 4. Get order status
  const statusRes = http.get(`${BASE_URL}/orders/${orderId}`);
  check(statusRes, {
    "status: status 200": (r) => r.status === 200,
  });

  sleep(1);
}
