## 1. Stale File Removal

- [x] 1.1 Delete all 13 stale `.txt` output files from project root (tsc_errors.txt, tsc-errors.txt, ts_errors.txt, tsc_final.txt, test-pure.txt, test-output.txt, full-test.txt, cart-test.txt, home-test.txt, layout-test.txt, nav-err.txt, eslint_errors.txt, lhci_output.txt)
- [x] 1.2 Delete all 7 stale `.json` result files from project root (test-result.json, test-results.json, final-results.json, eslint_errors.json, eslint_final.json, eslint_final3.json, e2e-report.json)
- [x] 1.3 Delete generated/cache directories (playwright-report/, test-results/, .lighthouseci/)
- [x] 1.4 Delete broken script check-db.ts from project root
- [x] 1.5 Delete orphaned config .hintrc from project root
- [x] 1.6 Delete stale infrastructure scripts from scripts/ (backup-now.sh, drill-db-failover.sh, pitr-restore-test.sh, smoke-prod.sh, run-k6-mock.ps1)
- [x] 1.7 Verify remaining scripts/ contents (load tests + webhook-harness.ts are preserved)

## 2. Playwright Test Trim

- [x] 2.1 Delete stale E2E tests for deleted pages (e2e/blog.spec.ts, e2e/rum.spec.ts, e2e/content.spec.ts)
- [x] 2.2 Delete stale E2E tests (e2e/seo-regression.spec.ts, e2e/performance.spec.ts)
- [x] 2.3 Verify active E2E tests remain (13 files: smoke, navigation, product-catalog, cart-flow, checkout, quick-view, storefront, accessibility, p1-features, account-wishlist, payment-razorpay, payment-stripe, checkout-payment)
- [x] 2.4 Verify payment tests are preserved (payment-razorpay, payment-stripe, checkout-payment)

## 3. Lighthouse Removal

- [x] 3.1 Remove the entire `lighthouse:` job block from `.github/workflows/ci.yml`
- [x] 3.2 Remove `lighthouse` from the `needs:` array of `deploy-staging:` and `deploy-production:` jobs in ci.yml
- [x] 3.3 Verify remaining CI jobs are intact (unit-tests, e2e-tests, validate-artifacts, build, load-tests, deploy-staging, deploy-production, rollback)

## 4. OpenSpec Changes Cleanup

- [x] 4.1 Archive `architecture-standardization` change via `/opsx-archive`
- [x] 4.2 Delete superseded `catalog-migration` change directory (openspec/changes/catalog-migration/)
- [x] 4.3 Delete superseded `production-ready-overhaul` change directory (openspec/changes/production-ready-overhaul/)
- [x] 4.4 Delete empty `archive/` directory if archive step moved architecture-standardization elsewhere (openspec/changes/archive/)

## 5. Final Verification

- [x] 5.1 Run `npx tsc --noEmit` from project root (0 errors)
- [x] 5.2 Run `npx vite build` from project root (successful build)
- [x] 5.3 Run `cd server && npx tsc --noEmit` (0 errors)
- [x] 5.4 Verify project root has ~28 entries (down from ~53)
- [ ] 5.5 Commit all changes with a descriptive message
