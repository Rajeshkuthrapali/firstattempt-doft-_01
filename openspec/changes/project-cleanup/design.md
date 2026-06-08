## Context

The Lumiere project root has accumulated 53+ entries from months of iterative development. Stale output files (`.txt` and `.json` from past TypeScript/ESLint/test runs), generated cache directories (Playwright reports, Lighthouse CI artifacts), broken scripts referencing deleted models, E2E tests for pages removed in Phase 1 of architecture-standardization, and superseded OpenSpec changes all create noise. The project has moved from a Next.js scaffold through a production-ready overhaul to a clean Express+Vite architecture — but the artifacts of that journey remain.

This cleanup is purely subtractive: no runtime code changes, no behavioral modifications. Every file deleted is either dead code, regeneratable output, or superseded documentation.

## Goals / Non-Goals

**Goals:**
- Remove all stale output files (`.txt` dumps, `.json` results) from project root
- Delete generated/cache directories that are recreatable (`playwright-report/`, `test-results/`, `.lighthouseci/`)
- Remove broken scripts (`check-db.ts`, non-applicable infrastructure scripts)
- Trim Playwright E2E tests to only those covering active pages
- Remove Lighthouse CI from CI pipeline and delete all related config/artifacts
- Archive `architecture-standardization` change (completed); delete superseded `catalog-migration` and `production-ready-overhaul` changes
- Reduce project root from ~53 entries to ~28
- Leave core application code (`src/`, `server/`) completely untouched

**Non-Goals:**
- No refactoring, rewriting, or behavioral changes to any application code
- No changes to configuration that affects runtime behavior (vite, tsconfig, eslint, etc.)
- No changes to the OpenSpec system itself (`.opencode/`, `.openspec/`)
- No changes to CI pipeline beyond removing the Lighthouse job
- No changes to test assertions or logic — only deletion of entire stale test files
- No migration of data or schema changes

## Decisions

### 1. Deletion over archiving for output files
Output dumps from past tool runs have zero value — they capture errors that have since been fixed, test runs that have since passed, and analysis of code that no longer exists. Unlike the mock data backup (which preserved source content for tests), these files are unrecoverable tool outputs. **Delete permanently.**

### 2. Playwright test retention criteria
Keep an E2E test if and only if every page/feature it tests corresponds to an active route in the current application. Tests that reference deleted pages (blog, RUM instrumentation, CMS content) are deleted entirely. Tests that partially reference active pages but contain stale assertions get their stale scenarios removed. Payment tests (`payment-razorpay.spec.ts`, `payment-stripe.spec.ts`) are marked for review since the payment integration is currently scaffold-only without real gateway keys.

### 3. Lighthouse removal
The Lighthouse CI pipeline was configured during the Next.js era and has never produced actionable results for the current Express+Vite architecture. The `lighthouserc.json` config file doesn't exist (it was likely deleted already), leaving a reference to it in CI that would fail. Rather than fix the config, remove the job — Lighthouse audits are better run ad-hoc during design reviews, not in CI on every push. The `.lighthouseci/` cached results are build artifacts.

### 4. Superseded OpenSpec changes — delete, don't archive
The `catalog-migration` and `production-ready-overhaul` changes are fully superseded by the completed `architecture-standardization` change. Archiving them would preserve historical proposals that describe problems already solved. Since OpenSpec archives are for completed work worthy of reference, and these changes were never completed (they were superseded mid-flight), **delete them entirely.** The `archive/` directory is empty and can be removed.

### 5. Infrastructure scripts — keep load tests, delete backup/failover
The k6 load test scripts (`load-test.js`, `storefront-load-test.js`, `checkout-load-test.js`, `concurrent-checkout-load-test.js`) are referenced by the CI pipeline and serve a purpose. The backup/failover scripts (`backup-now.sh`, `drill-db-failover.sh`, `pitr-restore-test.sh`, `smoke-prod.sh`) reference deployed infrastructure that doesn't exist yet — they were written speculatively. Delete them; they can be recreated when the infrastructure exists.

## Risks / Trade-offs

- **Deleted test files are gone** — if blog or RUM features are reintroduced, their Playwright tests would need to be rewritten. Acceptable since those features have no current plans for resurrection.
- **Lighthouse removal from CI** — performance regressions won't be caught automatically. Mitigation: run Lighthouse manually before tagged releases via `npx lhci autorun`.
- **OpenSpec change deletion** — if someone wants to see the original scope of the production-ready overhaul, they'd need git history. Acceptable since the completed `architecture-standardization` is the authoritative record of what was done.
