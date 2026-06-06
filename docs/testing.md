# Testing & CI/CD Documentation

> Lumière Candles — v2.0 Core Commerce

---

## Quick Reference

| Command                    | Description                         |
| -------------------------- | ----------------------------------- |
| `npm test`                 | Run Vitest unit tests               |
| `npm run test:e2e`         | Run all Playwright E2E tests        |
| `npm run test:e2e:p0`      | Run P0 storefront E2E tests only    |
| `npm run test:e2e:payment` | Run Razorpay + Stripe payment tests |
| `npm run test:e2e:perf`    | Run performance E2E tests           |
| `npm run test:ci`          | Run unit + E2E (CI mode)            |
| `npm run lighthouse`       | Run Lighthouse CI audit             |
| `npm run webhook:test`     | Simulate webhook delivery           |

---

## 1. Local Test Setup

### Prerequisites

- Node.js 20+
- Playwright browsers installed: `npx playwright install chromium webkit`
- Server running (for payment tests): `cd server && npm run dev`

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

Tests are in `src/__tests__/` and use `@testing-library/react` + jsdom.

### E2E Tests (Playwright)

```bash
# Run all E2E tests (auto-starts Vite dev server)
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Run only P0 storefront tests
npm run test:e2e:p0

# Run only performance tests
npm run test:e2e:perf

# Debug a single test
npx playwright test --debug -g "hero section"
```

#### Browsers

Tests run against **Desktop Chrome** (1280×720) and **Mobile Safari** (iPhone 13, 390×844).

---

## 2. Payment Gateway Tests

### Setup

1. Copy `server/.env.example` → `server/.env`
2. Set Razorpay test keys:

```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_test_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

3.(Optional) Set Stripe test keys for global payment tests
4.Start the server: `cd server && npm run dev`

### Running

```bash
# Run Razorpay + Stripe E2E tests
npm run test:e2e:payment
```

### Webhook Test Harness

Manually simulate webhook deliveries for debugging:

```bash
# Razorpay: payment captured
npm run webhook:test -- razorpay payment.captured order_xxx

# Razorpay: payment failed
npm run webhook:test -- razorpay payment.failed order_xxx

# Stripe: payment succeeded
npm run webhook:test -- stripe payment_intent.succeeded <uuid>
```

### Test Coverage

| Flow                                     | Tests |
| ---------------------------------------- | ----- |
| Order creation                           | ✅    |
| Payment initiation (Razorpay)            | ✅    |
| Signature verification (valid + invalid) | ✅    |
| payment.captured webhook                 | ✅    |
| payment.failed webhook                   | ✅    |
| refund.created webhook                   | ✅    |
| Webhook idempotency (duplicate handling) | ✅    |
| Stripe PaymentIntent lifecycle           | ✅    |
| Stripe webhook (success + failure)       | ✅    |

---

## 3. CI/CD Pipeline

### Overview

```
Push/PR → Unit Tests → E2E Tests → Build → Lighthouse
                               ↓
                    main push → Deploy Staging
                    v* tag   → Deploy Production
```

### Jobs

| Job                   | Trigger           | Fails pipeline? |
| --------------------- | ----------------- | --------------- |
| **Unit Tests**        | push, PR          | ✅ Yes          |
| **E2E Tests**         | after unit tests  | ✅ Yes          |
| **Build**             | after unit tests  | ✅ Yes          |
| **Lighthouse**        | after build       | ⚠️ Warns only   |
| **Deploy Staging**    | main push only    | ✅ Yes          |
| **Deploy Production** | v\* tag push only | ✅ Yes          |
| **Rollback**          | manual dispatch   | N/A             |

### Artifacts Uploaded

- `vitest-report` — JSON unit test results
- `playwright-html-report` — Interactive HTML E2E report
- `playwright-json-report` — Structured JSON E2E results
- `e2e-failure-screenshots` — Screenshots of failed tests
- `lighthouse-report` — Performance audit results
- `dist` — Production bundle

### Environment Secrets

| Secret                | Environment         | Description               |
| --------------------- | ------------------- | ------------------------- |
| `VERCEL_TOKEN`        | staging, production | Vercel deployment token   |
| `RAZORPAY_KEY_ID`     | staging, production | Razorpay API key          |
| `RAZORPAY_KEY_SECRET` | production          | Razorpay secret           |
| `STRIPE_SECRET_KEY`   | production          | Stripe API key (optional) |

### Rollback

To rollback production to the previous deployment:

1. Go to **Actions** → **CI — Lumière Candles**
2. Click **Run workflow**
3. Check **Rollback production to previous deployment**
4. Click **Run workflow**

---

## 4. Branching Strategy

### Naming Conventions

| Branch Type | Pattern                            | Example                 |
| ----------- | ---------------------------------- | ----------------------- |
| Feature     | `feature/<scope>-<description>`    | `feature/p1-wishlist`   |
| Release     | `release/v<major>.<minor>.<patch>` | `release/v2.1.0`        |
| Hotfix      | `hotfix/<description>`             | `hotfix/fix-cart-crash` |
| Chore       | `chore/<description>`              | `chore/update-deps`     |

### Tagging Rules

- **Format:** `v{major}.{minor}.{patch}` (semver)
- **Patch** (`v2.0.x`): Bug fixes, no new features
- **Minor** (`v2.1.0`): New features, backward compatible
- **Major** (`v3.0.0`): Breaking changes
- Tags starting with `v` auto-trigger the production deploy

### Flow

```
feature/p1-wishlist → PR to main → CI runs → Merge → Auto-deploy staging
                                                    → Tag v2.1.0 → Auto-deploy prod
```

---

## 5. Performance Monitoring

### Lighthouse CI (Synthetic)

Runs in CI against the built static bundle. All four categories are **hard failures** (❌ pipeline blocked) at ≥ 0.90:

| Metric         | Threshold | Action  |
| -------------- | --------- | ------- |
| Performance    | ≥ 90      | ❌ Fail |
| Accessibility  | ≥ 90      | ❌ Fail |
| Best Practices | ≥ 90      | ❌ Fail |
| SEO            | ≥ 90      | ❌ Fail |
| CLS            | < 0.1     | ❌ Fail |
| LCP            | < 3.5s    | ⚠️ Warn |
| TBT            | < 300ms   | ⚠️ Warn |

#### Running Lighthouse CI Locally

```bash
# 1. Build the production bundle
npm run build

# 2. Install LHCI CLI (one-time global install)
npm install -g @lhci/cli@0.14.x

# 3. Run LHCI against the dist/ build (serves it via static server internally)
lhci autorun --config=lighthouserc.json

# 4. Open the HTML report to get a full visual breakdown
#    macOS / Linux:
open .lighthouseci/*.html
#    Windows:
start .lighthouseci\$(Get-ChildItem .lighthouseci\*.html | Select-Object -First 1 -ExpandProperty Name)
```

Expected output on pass:

```

✅  assert.categories:performance = 0.9x >= 0.90
✅  assert.categories:accessibility = 0.9x >= 0.90
✅  assert.categories:best-practices = 0.9x >= 0.90
✅  assert.categories:seo = 0.9x >= 0.90
```

### Load Testing (k6)

```bash
# Install k6: https://k6.io/docs/get-started/installation/
k6 run scripts/load-test.js

# Against staging
k6 run -e API_BASE_URL=https://staging.lumiere-candles.com/api scripts/load-test.js
```

Thresholds: p95 < 500ms, error rate < 1%, 50 concurrent users.

---

## 6. Observability

### GA4 Analytics

Tracked events (when `VITE_GA4_MEASUREMENT_ID` is set):

| Event              | Trigger                 |
| ------------------ | ----------------------- |
| `page_view`        | SPA route change        |
| `view_item`        | PDP page load           |
| `add_to_cart`      | Add to Cart button      |
| `remove_from_cart` | Remove from Cart        |
| `view_cart`        | Cart drawer opened      |
| `begin_checkout`   | Checkout button clicked |
| `purchase`         | Payment success         |
| `payment_error`    | Payment failure         |

### Sentry Error Monitoring

When `VITE_SENTRY_DSN` is set:

- **ErrorBoundary** wraps the entire React tree
- **Breadcrumbs** for checkout steps
- **capturePaymentError()** with gateway/order context tags
- **Browser tracing** + **Session replay** (low sample rate in prod)
