## ADDED Requirements

### Requirement: Payment amounts are validated server-side against Prisma
The system SHALL verify that the payment amount requested by the frontend matches the server-calculated order total before creating a payment intent.

#### Scenario: Payment amount matches server calculation
- **WHEN** a payment initiation request includes an amount that matches the server-recalculated total for the order
- **THEN** the system proceeds with creating the payment intent

#### Scenario: Payment amount mismatch rejected
- **WHEN** a payment initiation request includes an amount that differs from the server-recalculated total
- **THEN** the system returns status 409 with an error and logs a security event

### Requirement: Webhook idempotency covers all webhook event types
The WebhookEvent idempotency table SHALL cover Razorpay and Stripe webhooks for payment.captured, payment.failed, and refund.processed events.

#### Scenario: Razorpay payment.captured is idempotent
- **WHEN** a duplicate Razorpay payment.captured webhook is received
- **THEN** the system returns 200 without re-processing

#### Scenario: Stripe payment.failed is idempotent
- **WHEN** a duplicate Stripe payment.failed webhook is received
- **THEN** the system returns 200 without re-processing

### Requirement: Inventory is verified before payment initiation
The system SHALL check that sufficient stock exists for all order items before creating a payment intent.

#### Scenario: Sufficient stock allows payment
- **WHEN** a payment initiation request is made and all order items have sufficient stock
- **THEN** the system creates the payment intent

#### Scenario: Insufficient stock blocks payment
- **WHEN** a payment initiation request is made and any order item has insufficient stock
- **THEN** the system returns status 409 with an out-of-stock error
