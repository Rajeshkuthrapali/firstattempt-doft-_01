# Lumière v2.5.0 Roadmap (P6: Real-time Personalization & PWA)

## Overview

With the optimization infrastructure delivered in v2.4.0 (GraphQL caching, ML recommendations, bundle splitting, PostgreSQL readiness), the P6 milestone focuses on **real-time data streaming**, **advanced analytics**, **production database cutover**, and **Progressive Web App** capabilities for mobile-first performance.

## Key Initiatives

### 1. Real-time Personalization with Streaming Data

- **Server-Sent Events (SSE)**: Implement a real-time event stream for live inventory updates, price changes, and flash sale notifications on the storefront.
- **Streaming Recommendations**: Replace batch-scored recommendations with a streaming inference pipeline that recomputes scores as user behavior changes within a session.
- **Live Personalization Context**: Maintain an in-memory user session graph (pages viewed, search queries, hover dwell time) to dynamically re-rank product grids without page reload.
- **WebSocket Admin Feed**: Upgrade AdminLogs from mock data to a live WebSocket feed consuming Sentry/GA4 events in real-time.

### 2. Advanced Analytics Dashboards

- **Experiment Analytics**: Extend AdminExperiments with time-series conversion charts, statistical significance calculations (chi-squared test), and automated winner declaration.
- **Loyalty Analytics**: Build a dedicated Admin Loyalty dashboard showing points distribution, redemption rates, tier progression funnels, and points liability forecasting.
- **Revenue Attribution**: Connect A/B experiment variants to revenue impact — show incremental revenue lift per variant.
- **Cohort Analysis**: Build user cohort views segmented by acquisition source, scent profile, and loyalty tier to track LTV.

### 3. Full Production PostgreSQL Cutover

- **Execute Migration**: Run the validated Phase 1–4 migration plan from `docs/postgresql-migration.md`.
- **Connection Pool Tuning**: Deploy Prisma Accelerate or PgBouncer with auto-scaling connection limits.
- **Full-Text Search**: Leverage PostgreSQL `tsvector` for native full-text product search, replacing the client-side filter.
- **Row-Level Security**: Implement PG RLS policies for multi-tenant data isolation (future B2B wholesale support).

### 4. Progressive Web App (PWA)

- **Service Worker**: Register a service worker for offline catalog browsing and cart persistence.
- **Web App Manifest**: Add `manifest.json` with app icons, theme colors, and standalone display mode.
- **Push Notifications**: Implement web push for abandoned cart reminders, loyalty point expiry, and flash sale alerts.
- **App Shell Architecture**: Pre-cache the layout shell, navigation, and critical CSS for instant repeat visits.
- **Mobile Performance**: Target sub-1s FCP on 3G connections via aggressive pre-caching and resource hints.

### 5. Developer Experience & Infrastructure

- **Monorepo Migration**: Evaluate moving to Turborepo for separating the storefront, admin, and API layers.
- **API Versioning**: Implement `/api/v1/` and `/api/v2/` routing for backwards-compatible API evolution.
- **CI/CD Enhancement**: Add preview deployments per PR, automated Lighthouse regression checks, and bundle size budgets.

## Architectural Considerations

- **Edge Computing**: Evaluate moving personalization scoring to Vercel Edge Functions for sub-10ms response times.
- **Feature Flag Service**: Migrate from local A/B testing to Statsig or LaunchDarkly for enterprise targeting.
- **Event Bus**: Adopt Inngest or Trigger.dev for reliable async event processing (email, webhooks, analytics).
- **Observability**: Graduate to Axiom or Datadog for production log aggregation with alerting rules.
