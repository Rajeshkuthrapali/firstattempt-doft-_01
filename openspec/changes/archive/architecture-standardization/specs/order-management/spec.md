## ADDED Requirements

### Requirement: Order totals are always recalculated server-side from Prisma
The order creation endpoint SHALL ignore any price or total fields sent by the frontend and recalculate everything from the current Prisma variant data.

#### Scenario: Server recalculates totals from variant priceCents
- **WHEN** a POST request to /api/orders includes variant IDs and quantities
- **THEN** the system loads current priceCents from Prisma for each variant and calculates subtotalCents, discountCents, shippingCents, and totalCents server-side
- **AND** any price fields sent by the frontend in the request body are ignored

#### Scenario: Variant not found returns error
- **WHEN** a POST request to /api/orders includes a variantId that does not exist in the database
- **THEN** the system returns status 404 with an error identifying the missing variant

#### Scenario: Variant price discrepancy logged
- **WHEN** the server-recalculated total differs from a submitted total by more than 1%
- **THEN** the system logs a security event with the discrepancy details

### Requirement: Order creation validates all inputs with Zod
The order creation endpoint SHALL use Zod schema validation for all request body fields including variantIds (UUID format), quantities (positive integers), shipping address (valid structure), and promo codes.

#### Scenario: Invalid variantId format rejected
- **WHEN** a POST request to /api/orders includes a variantId that is not a valid UUID
- **THEN** the system returns status 400 with a validation error

#### Scenario: Zero quantity rejected
- **WHEN** a POST request to /api/orders includes an item with quantity 0
- **THEN** the system returns status 400 with a validation error

#### Scenario: Empty items array rejected
- **WHEN** a POST request to /api/orders includes an empty items array
- **THEN** the system returns status 400 with a validation error
