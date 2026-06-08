## 1. Clean Up Stubs and Consolidate Structure

- [x] 1.1 Audit all imports in src/ to find any active references to stub files (sentry, sanity, graphql, vitals, rum, ltv-fraud, ab-testing, support, env, auth, prisma, search, shipping, cloudinary-images)
- [x] 1.2 Delete the following stub files from src/lib/: sentry.ts, sanity.ts, graphql.ts, vitals.ts, rum.ts, ltv-fraud.ts, ab-testing.ts, support.ts, env.ts, auth.ts, prisma.ts, search.ts, shipping.ts, cloudinary-images.ts, integrations.ts, email.ts
- [x] 1.3 Delete src/lib/sanity/ directory and src/lib/sanity/client.ts
- [x] 1.4 Delete stub test files: src/lib/cloudinary-images.test.ts, src/lib/wishlist.test.ts
- [x] 1.5 Verify no broken imports after deletion (tsc --noEmit passes)

## 2. Consolidate Stores to Single Directory

- [x] 2.1 Merge src/lib/store/auth.ts into src/stores/auth.ts (reconcile any differences, keep the version that pages actually use)
- [x] 2.2 Move src/lib/store/cart.ts to src/stores/cart.ts
- [x] 2.3 Update all page imports from src/lib/store/ to src/stores/
- [x] 2.4 Delete src/lib/store/ directory
- [x] 2.5 Verify all imports resolve correctly (tsc --noEmit passes, dev server works)

## 3. Standardize Backend Error Handling

- [x] 3.1 Create shared DomainError base class in server/src/lib/domain-error.ts
- [x] 3.2 Refactor OrderError to extend DomainError
- [x] 3.3 Update auth.controller.ts to use DomainError pattern for all error responses
- [x] 3.4 Update payment.controller.ts to use DomainError pattern
- [x] 3.5 Verify error responses use standard envelope (success: false) across all endpoints

## 4. Standardize API Response Envelope

- [x] 4.1 Create response helper functions in server/src/lib/response.ts (sendSuccess, sendError, sendPaginated)
- [x] 4.2 Update all controllers to use response helpers (auth, order, payment, health)
- [x] 4.3 Ensure errorHandler middleware returns standard envelope format for 500 errors
- [x] 4.4 Verify consistency: curl all endpoints and confirm response shapes match

## 5. Build Catalog API

- [x] 5.1 Create catalog types at server/src/types/catalog.types.ts with Zod validation schemas for query params
- [x] 5.2 Create catalog service at server/src/services/catalog.service.ts with listProducts, getProductBySlug, searchProducts, getFeaturedProducts
- [x] 5.3 Create catalog controller at server/src/controllers/catalog.controller.ts
- [x] 5.4 Create catalog routes at server/src/routes/catalog.routes.ts
- [x] 5.5 Register catalog routes in server/src/index.ts: app.use("/api/products", catalogRoutes)
- [x] 5.6 Verify with curl: GET /api/products, GET /api/products/:slug, GET /api/products/search?q=, GET /api/products/featured

## 6. Frontend API Client Hardening

- [x] 6.1 Add CSRF token fetching to src/lib/api/client.ts (fetch on init, include on mutations, retry on 403)
- [x] 6.2 Add 401 interception and refresh token logic to src/lib/api/client.ts (single refresh, coalesce concurrent requests)
- [x] 6.3 Create useApi hook at src/lib/hooks/useApi.ts (loading, error, data state management)
- [x] 6.4 Verify client handles CSRF and 401 scenarios correctly

## 7. Standardize Frontend Data Fetching

- [x] 7.1 Migrate Home page: replace mock import with GET /api/products/featured and GET /api/products?collection=signature using useApi hook
- [x] 7.2 Migrate Collections page: replace mock import with GET /api/products using useApi hook
- [x] 7.3 Migrate Search page: replace mock import with GET /api/products/search using useApi hook
- [x] 7.4 Migrate Product page: replace getProductBySlug with GET /api/products/:slug using useApi hook
- [x] 7.5 Migrate QuickViewModal: replace products.find(id) with product detail API
- [x] 7.6 Migrate Account page: replace products.filter(id in wishlist) with product detail API
- [x] 7.7 Create frontend type definitions at src/types/catalog.ts (ProductSummary, ProductDetail, VariantInfo)
- [x] 7.8 Update ProductCard to use API type instead of mock Product type
- [x] 7.9 Move src/data/products.ts to backup/06-mock-data/products.ts
- [x] 7.10 Delete src/data/ directory if empty
- [x] 7.11 Verify: npm run build succeeds with no broken imports

## 8. Refactor Checkout Page

- [x] 8.1 Extract order summary section into src/components/checkout/OrderSummary.tsx
- [x] 8.2 Extract gift options section into src/components/checkout/GiftOptions.tsx
- [x] 8.3 Verify Checkout.tsx is under 200 lines after extraction
- [x] 8.4 Verify checkout functionality still works end-to-end

## 9. Database and Security Verification

- [x] 9.1 Run npx prisma migrate reset --force for a fresh database state
- [x] 9.2 Run npx prisma db seed to populate with structured test data
- [x] 9.3 Verify all Prisma indexes are present: check schema for @index annotations on variant.productId, cartItem.cartId, cartItem.variantId, order.userId, order.promoId, payment.gatewayOrderId, payment.gatewayPaymentId, refreshToken.userId, refreshToken.jti, webhookEvent.gateway, webhookEvent.processedAt
- [x] 9.4 Verify Helmet CSP includes all required domains (Razorpay, Stripe, Cloudinary, fonts)
- [x] 9.5 Verify CSRF protection applies to all non-webhook mutation routes
- [x] 9.6 Verify rate limiting applies to /api/ routes (100 req/15 min global, 10 req/15 min auth)
- [x] 9.7 Verify webhook raw body parser (express.raw) runs before express.json() on /api/payments/webhooks

## 10. Final Build Verification

- [x] 10.1 Run cd server && npx prisma validate (schema valid)
- [x] 10.2 Run cd server && npx tsc --noEmit (0 errors server)
- [x] 10.3 Run npx tsc --noEmit (0 errors frontend)
- [x] 10.4 Run npm run build (successful production build)
- [x] 10.5 Start dev server, confirm app loads without console errors
- [x] 10.6 Confirm curl /api/products returns product data
- [x] 10.7 Confirm curl /api/auth/health returns success
