## ADDED Requirements

### Requirement: All API responses use a standard envelope
Every API endpoint SHALL respond with a consistent JSON envelope structure containing success status and optionally data, meta, or error fields.

#### Scenario: Successful response format
- **WHEN** any API request succeeds
- **THEN** the response body SHALL have the shape { "success": true, "data": <response_data> }
- **AND** for paginated endpoints, the response SHALL also include "meta": { "page": number, "limit": number, "total": number, "totalPages": number }

#### Scenario: Error response format
- **WHEN** any API request fails with a client or server error
- **THEN** the response body SHALL have the shape { "success": false, "error": "<error_message>" }
- **AND** for validation errors, the response SHALL also include "details": [{ "path": "<field_path>", "message": "<error_message>" }]

#### Scenario: Unhandled server error
- **WHEN** an unexpected error occurs during request processing
- **THEN** the system returns status 500 with { "success": false, "error": "Internal server error" }
- **AND** the error details are logged server-side but NOT exposed to the client

### Requirement: Validation errors use a consistent structure
All Zod validation failures across all endpoints SHALL return the same error format with field-level details.

#### Scenario: Field validation failure
- **WHEN** a request body fails Zod schema validation
- **THEN** the system returns status 400 with "success": false, "error": "Validation failed", and "details": [{ "path": "fieldName", "message": "Expected type X, received Y" }]

#### Scenario: Missing required field
- **WHEN** a required field is omitted from a request body
- **THEN** the system returns status 400 with a detail entry for the missing field
