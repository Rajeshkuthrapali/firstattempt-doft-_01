## ADDED Requirements

### Requirement: 404 catch-all route
A catch-all route at `*` SHALL resolve to the 404 Not Found page component. The route SHALL be registered in `src/App.tsx` as the last route (below all other routes) with lazy loading.

```typescript
const NotFound = lazy(() => import('./pages/NotFound'));

// In router:
{ path: '*', element: <NotFound /> }
```

#### Scenario: Unknown route shows 404
- **WHEN** a user navigates to any route that is not `/`, `/collections`, `/product/:id`, `/cart`, `/checkout`, `/auth`, `/account`, `/about`, `/contact`, `/journal`, or `/journal/:slug`
- **THEN** the 404 Not Found page SHALL render
- **AND** the HTTP status code for crawlers SHALL be 404

### Requirement: 404 page layout
The 404 page SHALL have a minimal, editorial layout with:

1. **Hero section** — Full-viewport-height (min-h-screen) centred content
2. **Error code** — Large, subtle "404" in Cormorant Garamond (hero-display, 64px, brass gold #c9a96e, light weight)
3. **Heading** — "Page not found" in Cormorant Garamond (heading-l)
4. **Body text** — Explanatory copy in Inter (body token, muted colour, max-w-lg centred): "The page you're looking for doesn't exist or has moved. Perhaps try a different path, or browse our collections."
5. **Navigation links** — Two centred links with thin separator:
   - "Browse Collections" → /collections
   - "Return Home" → /
6. **Subtle footer** — Small decorative line (hairline) above the links

#### Scenario: 404 page renders centred
- **WHEN** the 404 page renders
- **THEN** the content SHALL be centred both horizontally and vertically
- **AND** it SHALL fill the full viewport height

### Requirement: Atmospheric design
The 404 page SHALL NOT feel like an error. It SHALL feel like an intentional break in the experience — quiet, atmospheric, and on-brand:

- Background: warm ivory (#fefcf5)
- No images, no illustrations, no icons
- The 404 number SHALL be the only visual focal point
- A thin hairline divider (1px, hairline colour) SHALL separate the heading from the navigation links
- Spacing between elements SHALL be generous (48px-64px gaps)

#### Scenario: 404 page has no imagery
- **WHEN** the 404 page renders
- **THEN** it SHALL NOT contain any images, illustrations, or icons
- **AND** the only visual element SHALL be typography and a hairline divider

### Requirement: Navigation links styling
The two navigation links SHALL:
- Use Inter, body token, uppercase
- Letter-spacing: 0.08em (micro token spacing)
- Colour: ink (#1a1a1a)
- No underline by default
- Underline on hover (not bold or colour change)
- Separated by a thin dot or pipe (·)

#### Scenario: Nav links have hover effect
- **WHEN** a user hovers over a navigation link on the 404 page
- **THEN** the link SHALL underline (text-decoration: underline)
- **AND** no colour change SHALL occur

### Requirement: Skeleton loading
The 404 page SHALL use the `<PageSkeleton>` component during lazy loading.

#### Scenario: 404 shows skeleton during load
- **WHEN** the 404 page is lazy-loading
- **THEN** the `<PageSkeleton>` component SHALL display
- **AND** it SHALL be replaced by the error content once loaded
