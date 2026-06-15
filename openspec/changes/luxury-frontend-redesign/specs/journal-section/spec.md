## ADDED Requirements

### Requirement: Journal overview page
A new route at `/journal` SHALL resolve to an overview page listing all journal articles. The route SHALL be registered in `src/App.tsx` with lazy loading.

The journal overview page SHALL display:
- A heading "Journal" (Cormorant Garamond, heading-xl)
- A subtitle (Inter, body, muted colour): "Stories, craft, and the art of fragrance"
- A grid of article cards (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- Each article card SHALL show:
  - A square (1:1) editorial image
  - Article title (heading-s)
  - Article category tag (micro text, uppercase, letter-spaced)
  - A short excerpt (body-small, 2 lines max)
  - Reading time (caption, muted)
- Pagination: show 6 articles per page (with "Older Posts" / "Newer Posts" navigation)

#### Scenario: Journal route resolves
- **WHEN** a user navigates to `/journal`
- **THEN** the Journal overview page SHALL render
- **AND** the route SHALL be lazy-loaded

#### Scenario: Article cards render in grid
- **WHEN** the Journal overview page loads
- **THEN** article cards SHALL be displayed in a responsive grid
- **AND** each card SHALL show the title, category, excerpt, and reading time

### Requirement: Individual article page
A new route at `/journal/:slug` SHALL resolve to an individual article page.

The article page SHALL display:
- A hero image (full-width, aspect ratio 21:9)
- Article title (heading-xl, Cormorant Garamond)
- Publish date and reading time (Inter, caption, muted)
- Category tag (micro, uppercase, letter-spaced, brass gold)
- Body content (Inter, body token, max-w-2xl)
- Pull quotes where appropriate
- A "Back to Journal" link at the top

#### Scenario: Article page shows full content
- **WHEN** a user navigates to `/journal/art-of-candle-making`
- **THEN** the full article SHALL display with hero image, title, metadata, and body content

### Requirement: Journal data source
Articles SHALL be stored as a JavaScript module at `src/data/journal.ts` exporting an array of article objects:

```typescript
interface JournalArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML string
  category: string;
  image: string;
  publishedAt: string; // ISO date
  readingTime: number; // minutes
}
```

For the initial launch, a minimum of 3 seed articles SHALL be provided:

1. **"The Art of Candle Making"** — Category: Craft, ~5 min read
   - About the hand-poured process, selection of waxes, wick types, and the patience required
   - Content: 600+ words of HTML body
   - Image: `/journal/candle-making.jpg` (fallback to golden-hour.png)

2. **"Notes on Fragrance: A Beginner's Guide"** — Category: Fragrance, ~4 min read
   - About fragrance families (floral, woody, oriental, fresh), how to read notes, layering
   - Content: 500+ words
   - Image: `/journal/fragrance-guide.jpg` (fallback to midnight-oud.png)

3. **"Creating Atmosphere: Light + Scent"** — Category: Lifestyle, ~3 min read
   - About how candlelight and fragrance work together to create mood
   - Content: 400+ words
   - Image: `/journal/creating-atmosphere.jpg` (fallback to hero-candle.png)

#### Scenario: Journal data module exports articles
- **WHEN** `src/data/journal.ts` is imported
- **THEN** it SHALL export an array of at least 3 article objects
- **AND** each object SHALL have all required fields matching the JournalArticle interface

### Requirement: Journal article card component
A `<JournalCard>` component SHALL be created at `src/components/JournalCard.tsx`. It SHALL:
- Accept a `JournalArticle` object as a prop
- Link to `/journal/${slug}`
- Display the article image (square 1:1, object-cover)
- Show category, title, excerpt, and reading time in the specified typography
- Have no border, shadow, or rounded corners
- Use the standard card padding (32px) around content below the image
- On hover: subtly lift with the card-hover shadow token
- Add a GSAP stagger entrance animation when the grid scrolls into view

#### Scenario: JournalCard hover effect
- **WHEN** a user hovers over a `<JournalCard>`
- **THEN** the card SHALL lift slightly (box-shadow changes from card to card-hover)
- **AND** no scaling, colour change, or other effect SHALL occur

### Requirement: Journal page skeleton
The journal overview page SHALL use the `<PageSkeleton>` component during lazy loading. The article page SHALL use `<PageSkeleton>` during lazy loading.

#### Scenario: Journal pages show skeleton during load
- **WHEN** the journal overview or article page is loading
- **THEN** the `<PageSkeleton>` component SHALL display
- **AND** it SHALL be replaced by content once loaded
