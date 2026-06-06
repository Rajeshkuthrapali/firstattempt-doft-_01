# Lumière v3.0.0 Launch Playbook

> **Target Launch Date:** TBD post-staging sign-off
> **Owner:** Engineering + Growth leads
> **Status:** Draft — pending stakeholder review

---

## Launch Criteria (Go / No-Go)

All items must be ✅ before flipping production traffic.

### Code & Quality
- [ ] All Vitest unit tests passing (≥ 187)
- [ ] Playwright E2E suite green across Chrome, Safari, Firefox
- [ ] Lighthouse CI: Performance ≥ 0.90, Accessibility ≥ 0.90, PWA ≥ 0.90
- [ ] No open P0/P1 Sentry errors in staging for 48h
- [ ] Bundle size within targets: app chunk ≤ 350kB gzip

### Catalog & Content
- [ ] All products live with real images, prices, scent notes, and HSN codes
- [ ] All 6 locale translations reviewed and approved (en, hi, fr, de, ja, ar)
- [ ] Blog posts published and CMS webhooks validated
- [ ] Campaign landing pages reviewed

### Payments & Checkout
- [ ] Stripe live keys configured and tested end-to-end
- [ ] Razorpay (India) live keys tested
- [ ] PayPal production credentials verified
- [ ] Apple Pay merchant validation certificate installed
- [ ] Google Pay merchant ID registered
- [ ] Regional wallets tested in production sandbox (Paytm, PhonePe, GrabPay)

### Logistics & Fulfillment
- [ ] Shiprocket live API keys configured
- [ ] Delhivery account activated with pickup address registered
- [ ] FedEx international account connected
- [ ] Warehouse pickup slots confirmed with fulfillment partner
- [ ] Packaging and labeling supplies stocked

### Taxes & Compliance
- [ ] GST registration verified; GSTIN embedded in invoices
- [ ] EU VAT handling tested for UK, DE, FR checkouts
- [ ] GDPR cookie consent banner tested across EU locales
- [ ] CCPA opt-out flow tested for US/CA visitors
- [ ] Privacy Policy, Terms, Refund Policy, Cookie Policy pages live
- [ ] PCI DSS SAQ-A compliance confirmed (no card data stored)

### Marketing & CRM
- [ ] Klaviyo welcome series activated and tested
- [ ] Abandoned cart trigger tested (4h delay → email)
- [ ] Loyalty tier-change email templates reviewed
- [ ] GA4 production property connected with all events verified
- [ ] Meta Pixel and conversion events configured

### Monitoring & Observability
- [ ] Sentry DSN pointing to production project
- [ ] PagerDuty alerting configured (P0: 5min, P1: 15min, P2: 1h)
- [ ] Uptime monitoring (Better Uptime / Checkly) polling every 60s
- [ ] DB replication lag alert threshold set (> 30s = critical)
- [ ] k6 baseline load test run against production (100 VUs, p95 < 800ms)

### Support
- [ ] Freshdesk/Intercom live chat active
- [ ] Support widget deployed and tested on all pages
- [ ] `support@lumiere.in` email routing verified
- [ ] Customer service team briefed on refund and escalation policy
- [ ] FAQ / Help Center articles reviewed and published

---

## Launch Day Runbook

### T-24h: Final Staging Validation
1. Run full Playwright E2E suite against staging
2. Place a real test order through each payment method
3. Trigger a refund and verify processing time
4. Verify Lighthouse PWA audit ≥ 0.90 on staging URL
5. Confirm all monitoring dashboards show baseline metrics

### T-4h: Production Configuration
1. Rotate all staging API keys to production equivalents
2. Update `DATABASE_URL` to production PostgreSQL primary
3. Confirm CDN cache rules (5min for `/api`, 1y for `/assets`)
4. Enable WAL archiving and verify first S3 backup completes

### T-0h: Flip Traffic
1. Update DNS records (TTL 60s pre-set)
2. Deploy production build: `npm run build && vercel --prod`
3. Verify Sentry first-event lands in production project
4. Confirm GA4 realtime dashboard shows visitors
5. Place one live smoke-test order per payment method

### T+1h: Stabilization Watch
- Monitor Sentry for new error groups
- Watch k6 latency metrics (p95 < 800ms SLA)
- Check DB connections (PgBouncer pool utilization < 80%)
- Confirm email delivery via Resend/SendGrid dashboard

### T+24h: Post-Launch Review
- Compile error rate, latency, and conversion data
- Review customer support ticket volume and categories
- Identify any UX friction from session recording (PostHog / Hotjar)
- Create P0 bug fix sprint if needed

---

## Rollback Procedure (< 10 minutes)

```bash
# 1. Revert DNS to previous deployment
vercel rollback --yes

# 2. If DB migration was destructive, restore from PITR:
pg_restore --target-time="[pre-launch timestamp]" --target-action=promote

# 3. Notify team:
curl -X POST $SLACK_WEBHOOK -d '{"text":"🔴 Production rollback executed"}'
```

---

## Key Contacts

| Role | Contact | Response SLA |
| --- | --- | --- |
| Engineering lead | eng-lead@lumiere.in | 15 min |
| DevOps / Infra | devops@lumiere.in | 5 min |
| Payment issues | payments@lumiere.in | 30 min |
| Customer support | support@lumiere.in | 2 hours |
| Legal / Compliance | legal@lumiere.in | 4 hours |
