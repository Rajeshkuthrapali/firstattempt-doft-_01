## ADDED Requirements

### Requirement: Page skeleton component
A `<PageSkeleton>` component SHALL be created at `src/components/PageSkeleton.tsx`. It SHALL render a full-page placeholder with a shimmer animation to indicate content loading.

The component SHALL accept the following props:
- `className?: string` — additional CSS classes
- `children?: ReactNode` — optional content to render inside the skeleton (for custom layouts)

The default layout SHALL be a single column with:
- A large rectangular block at the top (hero placeholder, height: 480px)
- Two medium blocks below (content placeholders, height: 240px each)
- A grid of 4 smaller blocks (card placeholders, height: 320px each)

#### Scenario: Page skeleton renders on initial load
- **WHEN** a page component is in its loading state (e.g., data is being fetched)
- **THEN** the `<PageSkeleton>` component SHALL render instead of the actual content
- **AND** it SHALL fill the full viewport width with the warm-ivory background

### Requirement: Product card skeleton component
A `<ProductCardSkeleton>` component SHALL be created at `src/components/ProductCardSkeleton.tsx`. It SHALL mimic the dimensions and layout of a real `<ProductCard>` but with shimmer placeholders instead of actual content.

The component SHALL render:
- A rectangular image placeholder (aspect ratio 3:4, width 100%)
- A text line placeholder (width 70%, height 16px)
- A shorter text line placeholder (width 40%, height 14px)
- A price placeholder (width 30%, height 16px)

#### Scenario: Product card skeleton matches card dimensions
- **WHEN** `<ProductCardSkeleton>` renders
- **THEN** its layout SHALL match the `<ProductCard>` component's layout
- **AND** its aspect ratio SHALL be 3:4 for the image area

### Requirement: Product grid skeleton component
A `<ProductGridSkeleton>` component SHALL be created at `src/components/ProductGridSkeleton.tsx`. It SHALL accept a `count` prop (default: 8) and render that many `<ProductCardSkeleton>` instances in a responsive grid matching the product grid layout.

The component SHALL accept:
- `count?: number` — number of skeleton cards (default: 8)
- `className?: string` — additional CSS classes

#### Scenario: Product grid skeleton renders correct count
- **WHEN** `<ProductGridSkeleton count={12} />` renders
- **THEN** it SHALL render exactly 12 `<ProductCardSkeleton>` components
- **AND** they SHALL be laid out in a responsive grid with the same columns as the product grid

### Requirement: Shimmer animation
All skeleton components SHALL use a CSS shimmer animation defined in `index.css`:

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(90deg, #f5f0ea 25%, #ede6dc 50%, #f5f0ea 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

The shimmer SHALL animate from left to right across the placeholder element.

#### Scenario: Shimmer animation loops
- **WHEN** a skeleton component renders
- **THEN** the placeholder elements SHALL have the `skeleton-shimmer` class
- **AND** the shimmer animation SHALL play continuously until the skeleton is replaced

### Requirement: Accessibility
All skeleton components SHALL be wrapped in a container with `role="status"` and `aria-label="Loading content"`. The skeleton areas SHALL have `aria-hidden="true"` to prevent screen readers from announcing the placeholder content.

#### Scenario: Skeleton components are accessible
- **WHEN** a screen reader encounters a skeleton component
- **THEN** it SHALL announce "Loading content"
- **AND** it SHALL NOT read the placeholder shapes
