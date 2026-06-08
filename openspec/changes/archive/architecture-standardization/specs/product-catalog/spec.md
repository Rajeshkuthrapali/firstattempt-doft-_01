## ADDED Requirements

### Requirement: Products are listable with filtering and pagination
The system SHALL expose a GET endpoint that returns a paginated, filterable list of products from the database.

#### Scenario: List all products
- **WHEN** a GET request is made to `/api/products`
- **THEN** the system returns status 200 with a paginated list of products including id, title, slug, tagline, priceCents, image, inStock, fragranceFamily, scentNotes, and giftEligible

#### Scenario: Filter by fragrance family
- **WHEN** a GET request is made to `/api/products?fragranceFamily=woody`
- **THEN** the system returns only products with the matching fragranceFamily field

#### Scenario: Pagination parameters
- **WHEN** a GET request is made to `/api/products?page=2&limit=5`
- **THEN** the system returns at most 5 products starting from the 6th result, with meta containing page, limit, total, and totalPages

#### Scenario: Invalid pagination values use defaults
- **WHEN** a GET request is made to `/api/products?page=-1&limit=1000`
- **THEN** the system uses page=1 and limit=50 (capped) and returns a valid response

### Requirement: Product detail is accessible by slug
The system SHALL return a single product with full details including variants, collections, and related products by its slug.

#### Scenario: Product found by slug
- **WHEN** a GET request is made to `/api/products/golden-hour`
- **THEN** the system returns status 200 with the full product detail including id, title, slug, tagline, description, images, fragranceFamily, scentNotes, burnTime, weight, hsnCode, waxType, ingredients, giftEligible, variants (with id, sku, priceCents, stock, size), and collections

#### Scenario: Product not found
- **WHEN** a GET request is made to `/api/products/non-existent-slug`
- **THEN** the system returns status 404 with { success: false, error: "Product not found" }

### Requirement: Products are searchable by text query
The system SHALL expose a search endpoint that matches products by title, tagline, description, or scent notes.

#### Scenario: Search by product name
- **WHEN** a GET request is made to `/api/products/search?q=golden`
- **THEN** the system returns products whose title, tagline, description, or scentNotes contain "golden"

#### Scenario: Search by scent note
- **WHEN** a GET request is made to `/api/products/search?q=amber`
- **THEN** the system returns products whose scentNotes array contains "amber" (case-insensitive)

#### Scenario: Search with no results
- **WHEN** a GET request is made to `/api/products/search?q=zzzznotfound`
- **THEN** the system returns status 200 with an empty data array

#### Scenario: Search query too short
- **WHEN** a GET request is made to `/api/products/search?q=a`
- **THEN** the system returns status 400 with a validation error

### Requirement: Featured products are available
The system SHALL expose an endpoint returning a curated subset of products for the home page.

#### Scenario: Featured products returned
- **WHEN** a GET request is made to `/api/products/featured`
- **THEN** the system returns status 200 with an array of 4-6 products suitable for home page display
