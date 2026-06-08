## Why

The Lumiere project root has accumulated significant clutter from past development sessions: stale output dumps (`.txt` and `.json` files), generated cache directories, broken scripts referencing non-existent models, E2E tests that test deleted pages, Lighthouse CI artifacts for a pipeline that isn't maintained, and superseded OpenSpec changes from earlier iterations. This noise obscures what matters and creates confusion about what's actively maintained versus abandoned. A focused cleanup removes everything that won't carry to production.

## What Changes

- Delete 13 stale `.txt` output files at project root (TypeScript error dumps, test output captures, ESLint output)
- Delete 7 stale `.json` result files at project root (vitest reports, ESLint JSON output, e2e-report.json)
- Delete generated/cache directories (`playwright-report/`, `test-results/`, `.lighthouseci/`)
- Delete `check-db.ts` — broken script referencing non-existent Prisma model
- Delete `.hintrc` — orphaned config for a tool not in use
- Delete or archive stale infrastructure scripts in `scripts/` (backup/failover scripts that reference non-existent deployed infrastructure)
- Trim Playwright E2E tests: remove tests that target deleted pages (blog, RUM, content), review and either keep or remove payment/stale tests
- Remove Lighthouse CI from CI pipeline and delete `.lighthouseci/`
- Archive `architecture-standardization` change (just completed)
- Delete superseded `catalog-migration` change (work absorbed into architecture-standardization)
- Delete superseded `production-ready-overhaul` change (historical, 80% done, superseded)
- Delete empty `archive/` directory

## Capabilities

### New Capabilities
- `stale-file-removal`: Delete all stale output files, result files, generated directories, broken scripts, and orphaned config files at project root
- `playwright-trim`: Remove E2E tests that target deleted or non-existent pages; keep tests for active features
- `lighthouse-removal`: Remove Lighthouse CI configuration and cached artifacts from the project and CI pipeline
- `openspec-changes-cleanup`: Archive the completed architecture-standardization change; delete superseded changes (catalog-migration, production-ready-overhaul); remove empty archive directory

### Modified Capabilities
<!-- No existing capabilities are being modified — this is a removal-only cleanup -->

## Impact

- **Project root**: Reduces from ~53 entries to ~28, eliminating noise
- **CI pipeline**: Lighthouse job removed from `.github/workflows/ci.yml`
- **E2E tests**: 18 files → ~11 files (only tests for active pages remain)
- **OpenSpec changes**: 3 active changes → 1 active (architecture-standardization archived, 2 superseded deleted)
- **No functional code affected**: Core application code (`src/`, `server/`) is untouched; no runtime behavior changes
