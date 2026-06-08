## ADDED Requirements

### Requirement: Remove Lighthouse CI job from CI pipeline
The system SHALL remove the Lighthouse CI audit job from the GitHub Actions CI workflow at `.github/workflows/ci.yml`.

In scope:
- Remove the entire `lighthouse:` job block (lines ~182-239 of ci.yml)
- Remove the `lighthouse` job from the `needs:` array of `deploy-staging:` and `deploy-production:` jobs
- No other CI jobs SHALL be affected

#### Scenario: Remove lighthouse job from CI
- **WHEN** the CI workflow file is edited
- **THEN** the `lighthouse:` job block SHALL be removed
- **THEN** `lighthouse` SHALL be removed from the `needs:` array of deployment jobs
- **THEN** the remaining CI jobs (unit-tests, e2e-tests, validate-artifacts, build, load-tests, deploy-staging, deploy-production, rollback) SHALL be preserved exactly

### Requirement: Delete Lighthouse CI cached artifacts
The system SHALL delete the `.lighthouseci/` directory and all its contents from the project root. These are cached build artifacts from a previous CI run, not configuration files.

#### Scenario: Delete lighthouse ci cache
- **WHEN** the cleanup is performed
- **THEN** the `.lighthouseci/` directory and all its contents SHALL be deleted
