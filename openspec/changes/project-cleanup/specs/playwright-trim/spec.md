## ADDED Requirements

### Requirement: Delete E2E tests for deleted pages
The system SHALL delete Playwright E2E test files that test pages, features, or components that have been removed from the application.

In scope (delete entirely):
- `e2e/blog.spec.ts` — tests Blog page (deleted in architecture-standardization Phase 1)
- `e2e/rum.spec.ts` — tests RUM instrumentation (stubs deleted in architecture-standardization Phase 1)
- `e2e/content.spec.ts` — tests About/Contact pages that don't exist as routes

#### Scenario: Delete blog e2e test
- **WHEN** the cleanup is performed
- **THEN** `e2e/blog.spec.ts` SHALL be deleted

#### Scenario: Delete rum e2e test
- **WHEN** the cleanup is performed
- **THEN** `e2e/rum.spec.ts` SHALL be deleted

#### Scenario: Delete content e2e test
- **WHEN** the cleanup is performed
- **THEN** `e2e/content.spec.ts` SHALL be deleted

### Requirement: Review and clean partially-stale E2E tests
The system SHALL review E2E tests that may contain stale scenarios alongside active ones, and remove or update only the stale portions.

In scope (review):
- `e2e/seo-regression.spec.ts` — 146 lines, mostly `test.skip`, references old brand name "DOFT". Delete entire file; SEO concerns are covered by `accessibility.spec.ts` and smoke tests.
- `e2e/performance.spec.ts` — Performance tests that depend on deleted infrastructure. Delete entire file.
- `e2e/payment-razorpay.spec.ts` — Tests Razorpay integration that is currently scaffold-only. Keep for future but verify it doesn't reference deleted code.
- `e2e/payment-stripe.spec.ts` — Same as above for Stripe. Keep.
- `e2e/checkout-payment.spec.ts` — Tests payment step in checkout. Keep.

#### Scenario: Delete stale seo-regression test
- **WHEN** the review is performed
- **THEN** `e2e/seo-regression.spec.ts` SHALL be deleted

#### Scenario: Delete stale performance test
- **WHEN** the review is performed
- **THEN** `e2e/performance.spec.ts` SHALL be deleted

#### Scenario: Keep payment tests
- **WHEN** the review is performed
- **THEN** `e2e/payment-razorpay.spec.ts`, `e2e/payment-stripe.spec.ts`, and `e2e/checkout-payment.spec.ts` SHALL be preserved

### Requirement: Keep active E2E tests
The following E2E tests SHALL be preserved unchanged:
- `e2e/smoke.spec.ts` — Homepage loads
- `e2e/navigation.spec.ts` — Navigation links
- `e2e/product-catalog.spec.ts` — Collections/catalog page
- `e2e/cart-flow.spec.ts` — Cart operations
- `e2e/checkout.spec.ts` — Checkout flow
- `e2e/quick-view.spec.ts` — QuickViewModal
- `e2e/storefront.spec.ts` — General storefront
- `e2e/accessibility.spec.ts` — a11y checks
- `e2e/p1-features.spec.ts` — Auth pages
- `e2e/account-wishlist.spec.ts` — Account/wishlist

#### Scenario: Active tests remain
- **WHEN** the cleanup is performed
- **THEN** the 10 active test files listed above SHALL remain untouched in `e2e/`
