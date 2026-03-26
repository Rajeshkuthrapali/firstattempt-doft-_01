# Lumière v2.2.0 Rollout & Roadmap

## 1. Environment & Secrets
Before deploying, ensure production environment variables are updated:
- `VITE_SANITY_PROJECT_ID`: ID from Sanity dashboard.
- `VITE_SANITY_DATASET`: Usually `"production"`.
- `VITE_INSTAGRAM_ACCESS_TOKEN`: Long-lived token from Meta Developer Portal.

## 2. Database Migrations
We have added performance indices and new properties to support Gifting & Loyalty.
Execute Prisma deployment:
```bash
npx prisma generate
npx prisma db push # Or prisma migrate deploy depending on infra
```

## 3. Webhooks & Automations
- Configure **Resend/SendGrid** endpoints to listen to `/api/webhooks/marketing`.
- Configure Sanity on-demand ISR webhooks if deploying to an edge framework like Vercel (so content updates invalidate edge cache immediately).

## 4. Next Milestone Roadmap (v2.3.0 - P4)
With robust features supporting P3 (Loyalty, CMS, Social, Advanced Analytics, Scalability), the next logical enhancements include:
- **Headless GraphQL Layer** mapping UI data to underlying microservices.
- **Global Multi-currency Support**: Stripe localization parameters based on IP geolocation.
- **Progressive Web App (PWA)**: Manifest and Service Workers for offline catalog browsing.
