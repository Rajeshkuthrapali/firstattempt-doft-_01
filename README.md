# Lumière Candles 🕯️

A luxury candle e-commerce storefront built with React 19, Vite, TypeScript, Tailwind CSS 4, and Prisma.

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env        # then fill in values

# Push the SQLite schema
npm run db:push             # creates prisma/dev.db

# Start dev server
npm run dev                 # http://localhost:5173
```

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-locked. Tagged `v2.0.0`. No direct commits. |
| `feature/p1-enhancements` | Active P1 sprint branch — all new features land here |

All CI jobs triggered by `feature/p1-enhancements` and `main` (see `.github/workflows/ci.yml`).

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test          # watch mode
npm run test:run      # single run (CI mode)
```

Covers: components, stores, RUM instrumentation, SEO JSON-LD, cart logic.

### E2E Tests (Playwright)

```bash
npm run test:e2e      # runs all specs in /e2e against localhost:5173
```

Critical paths covered: navigation, cart flow, checkout, accessibility, SEO regression, **RUM web_vital events** (`rum.spec.ts`).

---

## Real User Monitoring (RUM)

`src/lib/rum.ts` uses [`web-vitals@^3.5.2`](https://github.com/GoogleChrome/web-vitals) to capture all five Core Web Vitals and pipe them into GA4 as `web_vital` custom events:

| Metric | Description |
|---|---|
| **LCP** | Largest Contentful Paint |
| **INP** | Interaction to Next Paint *(v3 — replaces FID)* |
| **CLS** | Cumulative Layout Shift |
| **FCP** | First Contentful Paint |
| **TTFB** | Time to First Byte |

Set `VITE_GA4_MEASUREMENT_ID=G-XXXX` in `.env.local` to activate. Events appear in GA4 under **Events → web_vital**.

**Smoke test:** `npm run dev` → Chrome DevTools → Network → filter `gtag` → confirm `metric_name=LCP/INP/CLS/FCP/TTFB`.

---

## Load Testing (Docker k6 — no local install needed)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) running.

### Storefront (homepage, catalog, PDP)

```bash
# Windows / Mac (Docker Desktop):
npm run k6:storefront

# Linux / CI (--network=host):
docker run --rm -i --network=host grafana/k6 run - \
  -e BASE_URL=http://localhost:5173 \
  < scripts/storefront-load-test.js
```

**Thresholds:** p95 < 600ms · error rate < 0.5%

### Checkout + Payment Flow

```bash
# Windows / Mac (Docker Desktop):
npm run k6:checkout

# Linux / CI (--network=host):
docker run --rm -i --network=host grafana/k6 run - \
  -e BASE_URL=http://localhost:4000/api \
  < scripts/checkout-load-test.js
```

**Thresholds:** p95 < 800ms · order creation p95 < 300ms · payment init p95 < 400ms · error rate < 0.5%

> **Linux / CI note:** `--network=host` lets the container reach `localhost` directly. On Docker Desktop (Windows/Mac) use `host.docker.internal` instead — the npm scripts do this automatically.

### Staging

Override `BASE_URL` for staging:
```bash
docker run --rm -i grafana/k6 run - \
  -e BASE_URL=https://your-staging-url.vercel.app \
  < scripts/storefront-load-test.js
```

---

## CI Pipeline (`.github/workflows/ci.yml`)

| Job | Trigger | Purpose |
|---|---|---|
| 🧪 `unit-tests` | all pushes | Lint + Vitest (uploads `vitest-report.json`) |
| 🎭 `e2e-tests` | after unit-tests | Playwright desktop + mobile (uploads HTML + JSON reports) |
| ✅ `validate-artifacts` | after unit + e2e | `jq` parses Vitest, Playwright, **and Lighthouse** JSON — fails pipeline if any test failed or score < 0.90 |
| 🏗️ `build` | after unit-tests | Vite production build (uploads `dist/`) |
| 🔦 `lighthouse` | after build | LHCI audit — **hard fails if any category < 90** — uploads HTML + JSON reports |
| 🐳 `load-tests` | `feature/p1-enhancements` + tags | Docker `grafana/k6` — `--network=host` on ubuntu-latest, `BASE_URL` parameterised via `vars.*` |
| 🚀 `deploy-staging` | `main` push | Vercel preview deploy |
| 🏷️ `deploy-production` | `v*` tag | Vercel production deploy |
| ⏪ `rollback` | manual dispatch | `vercel rollback` |

### Lighthouse Thresholds

All four categories must score **≥ 0.90** or the pipeline fails:

| Category | Threshold |
|---|---|
| Performance | ≥ 90 (error) |
| Accessibility | ≥ 90 (error) |
| SEO | ≥ 90 (error) |
| Best Practices | ≥ 90 (error) |

Download the `lighthouse-html-report` artifact from any CI run for a full visual breakdown.

---

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | SQLite: `file:./dev.db` · PostgreSQL: connection string |
| `VITE_GA4_MEASUREMENT_ID` | Optional | GA4 property ID — activates RUM + analytics |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry DSN — activates error monitoring |
| `VITE_API_BASE_URL` | Optional | Payment API base (default: `http://localhost:4000/api`) |

---

## Releases

| Tag | Description |
|---|---|
| `v2.0.0` | P0 complete — all features, unit + E2E tests, CI pipeline |
| `v2.0-core-commerce` | Earlier stable milestone |
