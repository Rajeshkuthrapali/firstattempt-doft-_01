# Lumière v2.4.0 Roadmap (P5: Optimization & Growth)

## Overview

With the intelligent storefront foundation delivered in v2.3.0 (personalization, CMS campaigns, email automation, A/B testing), the P5 milestone shifts focus to **performance optimization**, **data-driven growth**, and **revenue amplification** through loyalty redemption and ML-powered recommendations.

## Key Initiatives

### 1. GraphQL Query Optimization & Caching

- **Response Caching**: Implement Apollo Server response cache with TTL-based invalidation keyed to Sanity webhooks.
- **Persisted Queries**: Reduce payload overhead by registering query hashes on the server, sending only IDs from the client.
- **DataLoader Batching**: Introduce DataLoader pattern for N+1 query elimination across product/order resolvers.
- **Edge Caching**: Integrate Vercel KV or Upstash Redis for sub-50ms cached GraphQL responses at the edge.

### 2. Multi-Variant A/B Testing Expansion

- **Server-Side Assignment**: Migrate from client-side hash bucketing to edge-middleware evaluation via Vercel Edge Config.
- **Multi-Variant Support**: Extend the framework beyond binary A/B to support 3+ variants with weighted allocation.
- **Conversion Tracking**: Instrument `experiment_conversion` GA4 events tied to purchase completion, not just exposure.
- **Dashboard Integration**: Surface active experiments and their conversion rates in the Admin panel.

### 3. Loyalty Reward Redemption

- **Points Checkout Integration**: Allow customers to apply loyalty points as currency during checkout (e.g., 500 pts = ₹100 off).
- **Reward Catalog**: Build a dedicated `/rewards` page showing redeemable items, exclusive products, and tier-locked perks.
- **Expiry Notifications**: Automated email triggers 30 days before points expire, using the `email.ts` provider.
- **Admin Controls**: Add loyalty configuration panel (points-per-rupee ratio, tier thresholds, reward inventory).

### 4. ML-Powered Personalization

- **Collaborative Filtering**: Replace the static note-overlap scorer with a collaborative filtering model trained on purchase/cart co-occurrence data.
- **Real-Time Recommendations API**: Deploy a lightweight ML inference endpoint (e.g., Vercel Edge Function + ONNX runtime) that returns personalized product rankings.
- **Homepage Personalization**: Dynamically rank the hero carousel, "You Might Also Like" grid, and curated sections based on user's scent profile and browse history.
- **Quiz Enhancement**: Add adaptive quiz logic — if a user has purchase history, skip redundant questions and refine recommendations from existing data.

### 5. Performance & Scale

- **Bundle Optimization**: Analyze and code-split large route bundles (admin, campaign) for faster initial load.
- **Image Optimization Pipeline**: Migrate all product images to next-gen formats (AVIF/WebP) via Cloudinary auto-format.
- **Database Migration**: Evaluate PostgreSQL migration from SQLite for production-grade concurrency and connection pooling.
- **CDN Purge Automation**: Wire Sanity webhook → Vercel API to automatically purge edge-cached pages on content updates.

## Architectural Considerations

- **Feature Flags Service**: Consider migrating A/B testing to LaunchDarkly or Statsig for enterprise-grade targeting, segmentation, and rollout controls.
- **Event-Driven Architecture**: Evaluate moving marketing automation triggers from synchronous API calls to an event bus (e.g., Inngest, Trigger.dev) for reliability and retry guarantees.
- **Observability Stack**: Graduate from mock AdminLogs to a real-time log aggregation pipeline (e.g., Axiom, Logflare, or Datadog) with alerting rules.
