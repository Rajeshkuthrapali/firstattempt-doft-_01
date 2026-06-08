## ADDED Requirements

### Requirement: API client fetches CSRF token before mutating requests
The frontend API client SHALL fetch a CSRF token from GET /api/csrf-token at initialization and include it in the x-csrf-token header on all mutating requests (POST, PUT, PATCH, DELETE).

#### Scenario: CSRF token fetched on app load
- **WHEN** the frontend application initializes
- **THEN** the API client makes a GET request to /api/csrf-token and stores the returned token

#### Scenario: CSRF token included in mutation requests
- **WHEN** a POST, PUT, PATCH, or DELETE request is made through the API client
- **THEN** the stored CSRF token is included as the x-csrf-token header

#### Scenario: CSRF token refresh on 403
- **WHEN** a request returns status 403 with a CSRF-related error
- **THEN** the API client automatically re-fetches the CSRF token and retries the request once

### Requirement: API client intercepts 401 responses and attempts token refresh
The frontend API client SHALL detect 401 responses, attempt to refresh the access token using the stored refresh token, and retry the original request.

#### Scenario: Expired access token triggers refresh
- **WHEN** a request returns status 401
- **THEN** the API client sends a POST request to /api/auth/refresh with the stored refresh token
- **AND** if refresh succeeds, the new access token is stored and the original request is retried
- **AND** if refresh fails, the user is logged out and redirected to /auth

#### Scenario: Multiple concurrent 401s coalesce into one refresh
- **WHEN** multiple simultaneous requests all return 401
- **THEN** only one refresh request is sent, and all queued requests retry with the new token
