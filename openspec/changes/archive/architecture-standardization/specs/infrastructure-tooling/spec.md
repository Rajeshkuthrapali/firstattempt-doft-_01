## ADDED Requirements

### Requirement: All stub files are removed from src/lib/
The project SHALL NOT contain stub files that are empty shells or no-op implementations for removed systems.

#### Scenario: No stub files remain
- **WHEN** src/lib/ is audited
- **THEN** the following files are NOT present: sentry.ts, sanity.ts, graphql.ts, vitals.ts, rum.ts, ltv-fraud.ts, ab-testing.ts, support.ts, env.ts, auth.ts, prisma.ts, search.ts, shipping.ts, sanity/client.ts, cloudinary-images.ts, cloudinary-images.test.ts, wishlist.test.ts

#### Scenario: All active imports are verified
- **WHEN** grep is run for import paths referencing any stub file
- **THEN** no active import references are found (all stubs have zero imports)

### Requirement: Stores are consolidated to a single directory
All Zustand stores SHALL live under src/stores/ with no store files in src/lib/store/.

#### Scenario: Cart store moved to src/stores/
- **WHEN** src/lib/store/cart.ts is checked
- **THEN** it does not exist (the cart store has been moved to src/stores/cart.ts)

#### Scenario: No duplicate auth store
- **WHEN** src/lib/store/auth.ts is checked
- **THEN** it does not exist (the auth store has been consolidated into src/stores/auth.ts)

#### Scenario: All pages import from src/stores/
- **WHEN** grep is run for from "../stores/" and from "../lib/store/"
- **THEN** no imports reference src/lib/store/ for store imports

### Requirement: Project directories follow a clean structural pattern
The project SHALL have a clean directory layout with clear ownership rules for each directory.

#### Scenario: No dead component directories
- **WHEN** src/components/ is inspected
- **THEN** directories for dead features (SocialFeed, ScentMatchQuiz, SupportWidget, etc.) have been removed or moved to backup

#### Scenario: Components are flat or minimally nested
- **WHEN** src/components/ is inspected
- **THEN** component files are directly in src/components/ or in single-purpose subdirectories (cart/, product/, ui/ layout/) with no deeply nested hierarchies

### Requirement: Test files follow a consistent structure
Test files SHALL be organized in unit/ and integration/ subdirectories within both src/__tests__/ and server/tests/.

#### Scenario: Frontend unit tests in correct location
- **WHEN** test files are checked
- **THEN** all frontend unit tests are in src/__tests__/unit/ or co-located with source files as *.test.ts

#### Scenario: Server tests in correct location
- **WHEN** server test files are checked
- **THEN** all server tests are in server/tests/unit/ or server/tests/integration/

### Requirement: Checkout page is split into focused components
The Checkout page SHALL be refactored from a single 367-line component into smaller, single-responsibility components.

#### Scenario: Checkout has order summary component
- **WHEN** src/pages/Checkout.tsx is inspected
- **THEN** the order summary rendering is extracted into a separate component (e.g., src/components/checkout/OrderSummary.tsx)

#### Scenario: Checkout has gift options component
- **WHEN** src/pages/Checkout.tsx is inspected
- **THEN** the gift wrapping/message section is extracted into a separate component (e.g., src/components/checkout/GiftOptions.tsx)
