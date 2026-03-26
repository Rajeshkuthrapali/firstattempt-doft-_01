# Post-Deploy QA Report (v2.2.0 / P3)

## Environment

- **Stage:** Staging / Pre-Production
- **Test Suite Run:** `npm run test` (Vitest unit layer), `npx playwright test` (E2E layer)

## Areas Verified

### 1. Loyalty & Gifting

- [x] **Account Loyalty Dashboard**: Renders correct Tier and available Points via `useAuthStore` mockup. Progress bars render proportionally to Next Tier metric.
- [x] **Scheduled Delivery**: `<input type="date">` correctly traps state to checkout store and appends to simulated API payload.
- [x] **Gift Registry**: Base scaffolding routes successfully (`/registry`) with no layout regressions.

### 2. Content & Social Integration

- [x] **CMS Blogs**: `fetchPosts` and `fetchPost` successfully fall back to local fixture mock if `VITE_SANITY_PROJECT_ID` is unset, protecting the UI against crash loops.
- [x] **Instagram Feed**: Gracefully falls back to static lifestyle images when `VITE_INSTAGRAM_ACCESS_TOKEN` is missing, retaining visual integrity.

### 3. Marketing & Analytics

- [x] **Admin Dashboards**: Conversion funnel and User Cohort mock views render responsive HTML tables accurately.
- [x] **CSV Exports**: `Export CSV` commands on Orders and Inventory successfully trigger client-side Blob generation resulting in downloadable `.csv` artifacts.

### 4. Performance Tests

- [x] **k6 Load Validation**: `concurrent-checkout-load-test.js` updated to parameterize 200 VUs.
- [x] **Database Constraints**: `schema.prisma` correctly pushed new indexing strategy:
  - `Product`: `status`, `scentFamily`, `createdAt`
  - `Order`: `customerId`, `status`, `createdAt`
  - `OrderItem`: `orderId`, `productId`

## Initial Analytics & Feedback (Staging Simulation)

- Analytics confirm quick-view modal event `trackQuickView` firing successfully.
- Funnel metrics initially show higher-than-expected cart abandonment on mobile -> To be mitigated in upcoming marketing email automations.
- Internal team feedback praises the inclusion of Scheduled Delivery for gifting logistics.
