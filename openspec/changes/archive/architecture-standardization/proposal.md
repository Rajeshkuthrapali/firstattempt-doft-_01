## Why

The Lumiere project has undergone significant cleanup (Phase 0) and production hardening (auth, payments, security middleware), but the architecture still carries forward design debt from its origins as an aspirational multi-platform prototype. The project needs a single, consistent architecture that follows standard production practices across every layer — frontend, backend, database, security, and payments.

The current problems:
- **24 stub files** remain in `src/lib/` — empty shells for removed systems (Sentry, Sanity, GraphQL, LTV/fraud, A/B testing, RUM, web vitals, support, search, shipping, Cloudinary, Prisma, NextAuth, env) that confuse developers and create false expectations
- **Dual store directories** — `src/stores/` and `src/lib/store/` contain overlapping state (auth appears in both), with no clear ownership rule
- **No catalog API** — frontend imports mock data because the backend has no product endpoints
- **Inconsistent error handling** — no standardized API response envelope, no universal frontend error boundary pattern
- **Legacy tech references** — `src/lib/env.ts` still references `NEXTAUTH_URL`/`NEXTAUTH_SECRET`
- **No shared types** between frontend and backend
- **Test files scattered** across `src/__tests__/`, `src/lib/`, `server/tests/` with no consistent pattern
- **Checkout page is 367 lines** — violates single-responsibility, mixes data fetching, business logic, and rendering

The project needs a single pass that standardizes every layer, removes all dead code, establishes consistent patterns, and sets up the architecture for the remaining feature work (catalog API, admin CRUD, cart sync).

## What Changes

### Project Structure
- Delete all 24 stub files from `src/lib/` (sentry.ts, sanity.ts, graphql.ts, vitals.ts, rum.ts, ltv-fraud.ts, ab-testing.ts, support.ts, env.ts, auth.ts, prisma.ts, integrations.ts, email.ts, cloudinary-images.ts, shipping.ts, search.ts, cloudinary-images.test.ts, wishlist.test.ts, sanity/client.ts, and all associated test stubs)
- Consolidate stores: one canonical store directory (`src/stores/`) with no `src/lib/store/` duplication
- Standardize component directory structure under `src/components/`
- Remove `src/data/` directory from runtime (products.ts, posts.ts)

### Frontend Architecture
- Adopt standard React 19 patterns — `use()` for promises, `useActionState()` for forms, proper Suspense boundaries
- Use shadcn/ui + Tailwind CSS v4 as the sole UI framework (no Chakra UI — shadcn is already installed, lighter, and the modern standard)
- Standardize data fetching pattern: custom hooks or `react-query`-style pattern for all API calls
- Standardize error boundaries — one per route group, not one global one
- Standardize loading states — consistent `LoadingSpinner` usage with Suspense
- Split fat components: Checkout page (367 lines → 3-4 focused components)
- GSAP animations: standardize on `data-animate` attribute pattern already in use
- Consistent API client: add CSRF token fetching, refresh token interception, retry logic

### Backend Architecture
- Standard API response envelope: `{ success: boolean, data?: T, meta?: {}, error?: string }` on all endpoints
- Standardize error handling: domain error classes with HTTP status codes (OrderError pattern → every service)
- Add Zod validation to all existing endpoints that lack it
- Add catalog API routes (GET /api/products, GET /api/products/:slug, GET /api/products/search)
- Consistent middleware ordering documented and enforced

### Database
- Fresh Prisma migration reset — clean slate with proper schema
- Verify all indexes are present
- Standardize on `priceCents` convention (integer paise, no floats)
- Seed with structured test data (user will replace catalog content later)

### Security
- Verify Helmet, CSRF, rate limiting apply to all routes
- Verify webhook raw body parsing is correct
- Standardize security event logging pattern
- Add per-route rate limiting for sensitive endpoints (auth, payment)
- CSP review — ensure all third-party domains needed are listed

### Payments
- Razorpay integration follows standard flow: frontend creates order → server validates → payment gateway → webhook confirms
- Server-authoritative pricing: order service always recalculates from Prisma
- Verify idempotency on all webhooks
- Add proper error recovery for failed payments

## Capabilities

### New Capabilities
- `product-catalog`: Product listing, detail, and search endpoints with Zod validation and proper response envelope
- `api-consistency`: Standardized API response envelope across all endpoints, consistent error handling

### Modified Capabilities
- `user-auth`: Add CSRF token integration to frontend API client, add refresh token interception
- `payment-processing`: Add server-authoritative pricing verification, verify idempotency on all webhook paths
- `order-management`: Verify all totals are recalculated server-side, add Zod validation where missing
- `infrastructure-tooling`: Standardize project structure — consolidate stores, remove stubs, standardize test layout

## Impact

- **src/lib/**: 24 files deleted, 4 files kept (api/client.ts, format.ts, utils.ts, animations.ts)
- **src/stores/**: 5 stores consolidated, src/lib/store/auth.ts merged into stores/auth.ts
- **src/pages/**: Checkout.tsx split, all pages standardized on API calls
- **server/src/**: New catalog controller/service/routes, consistent error handling across all existing endpoints
- **Database**: Fresh migration reset, schema unchanged but cleaner
- **Dependencies**: No new packages needed (shadcn, Tailwind, GSAP, Zustand, zod already installed)
