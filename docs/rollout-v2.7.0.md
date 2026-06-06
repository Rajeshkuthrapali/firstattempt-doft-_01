# Lumière v2.7.0 Roadmap & Rollout Documentation

## Release Summary

v2.7.0 delivers **enterprise readiness and global expansion** capabilities:

| Feature Area | Key Deliverables |
| --- | --- |
| Personalization | 6-locale i18n, cross-device sync, localized recommendations |
| Analytics | Churn prediction (logistic model), geography/device cohort drill-down |
| PostgreSQL | Citus sharding, WAL backup, PITR, disaster recovery runbook |
| PWA | IndexedDB offline admin, background sync, connectivity monitoring |
| Payments | PayPal, Apple Pay, unified router, cross-brand loyalty redemption |

## Environment Variables (New)

```env
# Global Payments
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# Marketing
VITE_MARKETING_PROVIDER=klaviyo|hubspot|console
VITE_KLAVIYO_API_KEY=your_klaviyo_key
VITE_HUBSPOT_API_KEY=your_hubspot_key

# Push Notifications
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

## Rollout Checklist

### Pre-Deploy
- [ ] Run full Vitest suite (`npx vitest run`) — expect 187+ tests passing
- [ ] Run production build (`npm run build`) — verify chunk splitting
- [ ] Configure new env vars in Vercel/deployment platform
- [ ] Run PostgreSQL migration dry-run in staging

### Staging Validation
- [ ] Verify multilingual hero content for all 6 locales
- [ ] Test PayPal payment flow end-to-end in sandbox
- [ ] Validate Apple Pay on iOS Safari (test device required)
- [ ] Confirm offline admin dashboard loads from IndexedDB cache
- [ ] Verify background sync queue processes on reconnect
- [ ] Run churn prediction on test user set, validate risk classification

### Production Deploy
- [ ] Deploy to production via CI/CD pipeline
- [ ] Enable WAL archiving and verify S3 upload
- [ ] Validate Citus coordinator routes queries to correct shard
- [ ] Monitor GA4 for experiment_revenue and loyalty_redemption events
- [ ] Check Sentry for any new error patterns

### Post-Deploy
- [ ] Tag `v2.7.0` in Git
- [ ] Announce release to team with feature highlights
- [ ] Collect feedback on churn predictions and localized recommendations
- [ ] Schedule PostgreSQL sharding review for week 2 post-deploy
