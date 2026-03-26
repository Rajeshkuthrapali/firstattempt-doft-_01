# Deployment — Staging & Production Runbook

> Lumière Candles · v2.1.0 Pre-Launch Candidate

---

## Pipeline Overview

```
feature/p1-enhancements
  └─► PR to main
        └─► CI (unit tests → E2E → build → Lighthouse) passes
              └─► Auto-deploy to Staging (Vercel preview)
                    └─► QA sign-off
                          └─► Tag v2.1.0
                                └─► Auto-deploy to Production
```

---

## Environment Differences

| Variable                    | Staging                         | Production                    |
| --------------------------- | ------------------------------- | ----------------------------- |
| `NEXTAUTH_URL`              | `https://staging.lumiere.vercel.app` | `https://lumiere-candles.com` |
| `DATABASE_URL`              | Staging PostgreSQL (Supabase)   | Production PostgreSQL         |
| `STRIPE_SECRET_KEY`         | `sk_test_xxx`                   | `sk_live_xxx`                 |
| `STRIPE_WEBHOOK_SECRET`     | Stripe test mode secret         | Stripe live mode secret       |
| `VITE_GA4_MEASUREMENT_ID`   | Optional / test property        | Production GA4 property       |
| `NEXT_PUBLIC_SENTRY_DSN`    | Staging Sentry environment      | Production Sentry environment |
| `VITE_CLOUDINARY_CLOUD_NAME`| Same cloud, `staging/` folder   | Same cloud, `products/` folder|

---

## Manual Staging Deploy

```bash
# Build
npm run build

# Deploy to Vercel staging (preview URL)
npm install -g vercel@latest
vercel deploy --prebuilt --token=$VERCEL_TOKEN
# Vercel prints the staging URL — share with QA
```

## Manual Production Deploy

```bash
# Tag the release
git tag v2.1.0
git push origin v2.1.0
# CI auto-deploys on v* tag push via ci.yml deploy-production job
```

### Or manually via CLI:

```bash
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

---

## Rollback Procedure

### Option A — GitHub Actions (preferred)

1. Go to **Actions → CI — Lumière Candles**
2. Click **Run workflow**
3. Check **Rollback production to previous deployment**
4. Click **Run workflow**

### Option B — Vercel CLI

```bash
vercel rollback --token=$VERCEL_TOKEN
```

This reverts to the immediately previous production deployment. Vercel retains all historical deployments.

---

## v2.1.0 Release Checklist

### Pre-Tag QA Gate

- [ ] All unit tests pass: `npm run test:run` — 0 failures
- [ ] All E2E tests pass: `npm run test:e2e` — 0 failures
- [ ] TypeScript compiles: `npx tsc --noEmit` — 0 errors
- [ ] Lighthouse CI passes: all 4 categories ≥ 0.90 on `/`, `/product/*`, `/blog`, `/about`
- [ ] k6 load test: p95 < 800ms, error rate < 0.5%

### Manual QA Matrix

| Flow          | Chrome | Safari | Firefox | Edge | Mobile Safari |
| ------------- | ------ | ------ | ------- | ---- | ------------- |
| Home + Social Feed | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quick View Modal | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cart + Checkout | ✅ | ✅ | ✅ | ✅ | ✅ |
| Blog listing + article | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin (products/orders/inventory) | ✅ | ✅ | ✅ | ✅ | N/A |

### Screen-Reader Audit (Pre-Tag)

| Area | Tool | Pass? |
| ---- | ---- | ----- |
| Quick View Modal focus trap | VoiceOver (macOS) | Manual |
| Cart badge aria-live | NVDA (Windows) | Manual |
| Admin table navigation | VoiceOver | Manual |
| Blog breadcrumb | VoiceOver | Manual |
| Skip-to-content link | Keyboard only | Manual |

### Tagging

```bash
# Update CHANGELOG.md with v2.1.0 entries
# Commit the changelog
git add CHANGELOG.md
git commit -m "chore: prepare v2.1.0 release notes"

# Tag and push — triggers CI deploy-production job
git tag -a v2.1.0 -m "Release v2.1.0 — P2 features: quick-view, blog, admin, social feed"
git push origin v2.1.0
```

---

## Post-Deploy Verification

```bash
# Smoke check production URLs
curl -I https://lumiere-candles.com/           # 200
curl -I https://lumiere-candles.com/blog       # 200
curl -I https://lumiere-candles.com/collections # 200

# Run Lighthouse against production
npm install -g @lhci/cli@0.14.x
lhci collect --url=https://lumiere-candles.com
lhci assert --config=lighthouserc.json
```

Monitor Sentry for any error spikes in the first 30 minutes after deploy.
