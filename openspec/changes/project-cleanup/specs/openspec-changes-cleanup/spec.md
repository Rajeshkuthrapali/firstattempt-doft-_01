## ADDED Requirements

### Requirement: Archive completed architecture-standardization change
The system SHALL archive the `architecture-standardization` change using the OpenSpec archive workflow (`/opsx-archive` or equivalent). This change is fully completed with all 58 tasks across 10 phases marked as done.

#### Scenario: Archive architecture-standardization
- **WHEN** the archive command is run against `architecture-standardization`
- **THEN** the change SHALL be moved to `openspec/changes/archive/architecture-standardization/`
- **THEN** all artifacts (proposal, design, specs, tasks) SHALL be preserved in the archive

### Requirement: Delete superseded catalog-migration change
The system SHALL delete the `catalog-migration` change from `openspec/changes/catalog-migration/`. This change was a proposal only — its work (schema extension, catalog API, frontend migration) was fully absorbed into and completed by `architecture-standardization` phases 5 and 7. It was never completed as a standalone change and has no reference value as an archive.

#### Scenario: Delete catalog-migration
- **WHEN** the cleanup is performed
- **THEN** `openspec/changes/catalog-migration/` and all its contents SHALL be deleted

### Requirement: Delete superseded production-ready-overhaul change
The system SHALL delete the `production-ready-overhaul` change from `openspec/changes/production-ready-overhaul/`. This change was the original project transformation (Next.js → Express+Vite). It was largely completed (~80%) in prior sessions, and its remaining work was superseded by `architecture-standardization`. It has historical value but that value is preserved in git history, not in the active `openspec/changes/` tree.

#### Scenario: Delete production-ready-overhaul
- **WHEN** the cleanup is performed
- **THEN** `openspec/changes/production-ready-overhaul/` and all its contents SHALL be deleted

### Requirement: Delete empty archive directory
The system SHALL delete the empty `openspec/changes/archive/` directory. After archiving `architecture-standardization`, this directory will contain content, so this requirement only applies if the archive directory is empty after operations.

#### Scenario: Delete empty archive directory
- **WHEN** the cleanup is performed
- **AND IF** `openspec/changes/archive/` is empty
- **THEN** the `openspec/changes/archive/` directory SHALL be deleted
