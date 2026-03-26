/**
 * k6 Storefront Load Test — Lumière Candles
 *
 * Simulates real user browsing: homepage → product catalog → product detail.
 *
 * Run via Docker (no local k6 install needed):
 *
 *   # Windows / Mac (Docker Desktop):
 *   docker run --rm -i grafana/k6 run - \
 *     -e BASE_URL=http://host.docker.internal:5173 \
 *     < scripts/storefront-load-test.js
 *
 *   # Linux / GitHub Actions (--network=host):
 *   docker run --rm -i --network=host grafana/k6 run - \
 *     -e BASE_URL=http://localhost:5173 \
 *     < scripts/storefront-load-test.js
 *
 * Thresholds:
 *   p95 response time < 600ms
 *   Error rate        < 0.5%
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const pageLoadTime = new Trend("page_load_time", true);
const errorRate = new Rate("storefront_errors");

const BASE_URL = __ENV.BASE_URL || "http://localhost:5173";

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // ramp to 20 VUs
    { duration: "60s", target: 50 }, // hold at 50 VUs
    { duration: "30s", target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<600"], // 95th percentile < 600ms
    http_req_failed: ["rate<0.005"], // error rate < 0.5%
    page_load_time: ["p(95)<600"],
    storefront_errors: ["rate<0.005"],
  },
};

export default function () {
  // 1. Homepage
  const homeRes = http.get(`${BASE_URL}/`);
  pageLoadTime.add(homeRes.timings.duration);
  const homeOk = check(homeRes, {
    "homepage: status 200": (r) => r.status === 200,
    "homepage: content-type HTML": (r) =>
      r.headers["Content-Type"]?.includes("text/html") ?? false,
  });
  errorRate.add(!homeOk);

  sleep(1);

  // 2. Product catalog
  const catalogRes = http.get(`${BASE_URL}/products`);
  pageLoadTime.add(catalogRes.timings.duration);
  const catalogOk = check(catalogRes, {
    "catalog: status 200": (r) => r.status === 200,
  });
  errorRate.add(!catalogOk);

  sleep(1);

  // 3. Product detail (golden-hour is a known slug)
  const pdpRes = http.get(`${BASE_URL}/product/golden-hour`);
  pageLoadTime.add(pdpRes.timings.duration);
  const pdpOk = check(pdpRes, {
    "pdp: status 200": (r) => r.status === 200,
  });
  errorRate.add(!pdpOk);

  sleep(1);
}
