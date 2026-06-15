## ADDED Requirements

### Requirement: About page route
A new route at `/about` SHALL resolve to the About page component. The route SHALL be registered in `src/App.tsx` with lazy loading:

```typescript
const About = lazy(() => import('./pages/About'));
```

The navigation "Our Story" link SHALL point to `/about`.

#### Scenario: /about route resolves
- **WHEN** a user navigates to `/about`
- **THEN** the About page component SHALL render
- **AND** the route SHALL be lazy-loaded

### Requirement: About page layout
The About page SHALL follow a 5-section editorial layout:

1. **Hero** — Full-width brand story headline with evocative subtext and optional atmospheric image
2. **Our Story** — Brand founding narrative (750-1000 words) with generous whitespace, pull quotes, and a single editorial image
3. **Craftsmanship** — A 2-column grid with left text (craft philosophy) and right image (candle-making)
4. **Founder's Note** — A centred, restrained quote from the founder with signature
5. **Values** — 3-4 values displayed as a horizontal row of text-only cards (no icons, no imagery)

The page SHALL use the standard section spacing (96px between sections).

#### Scenario: About page layout renders correctly
- **WHEN** the About page loads
- **THEN** it SHALL display all 5 sections in order
- **AND** each section SHALL be separated by 96px of whitespace

### Requirement: Editorial typography
The About page SHALL use Cormorant Garamond for:
- Headline hero text (hero-display token, light italic 300 weight)
- Section headings (heading-l or heading-m tokens)
- Pull quotes within body text (heading-m, italic)
- Founder's note (heading-s, italic)
- Signature line (Cormorant Garamond, 24px, italic)

Inter SHALL be used for all body copy, captions, and labels.

#### Scenario: Editorial typography is applied
- **WHEN** the About page renders
- **THEN** headlines SHALL use Cormorant Garamond
- **AND** body text SHALL use Inter
- **AND** pull quotes SHALL use Cormorant Garamond italic
- **AND** the font pairing SHALL be consistent throughout the page

### Requirement: Atmospheric imagery
The About page SHALL use a single hero image and a single craftsmanship image. Both SHALL be editorial-style product/lifestyle photography, not illustrations or icons.

Current placeholder images to use:
- Hero: `/studio-ambient.jpg` or fallback to `/hero-candle.png`
- Craftsmanship: `/craftsmanship.jpg` or fallback to `/golden-hour.png`

Images SHALL:
- Be full-width in their sections
- Use object-fit: cover
- Have no borders, shadows, or rounded corners
- Have a subtle fade-in GSAP animation on scroll

#### Scenario: Images render without decoration
- **WHEN** images render on the About page
- **THEN** they SHALL have border-radius: 0px
- **AND** they SHALL NOT have shadows or borders
- **AND** they SHALL cover their container with object-fit: cover

### Requirement: Pull quote style
Pull quotes within the story text SHALL be:
- Centred text
- Cormorant Garamond italic (heading-m, 28px)
- Warm ivory (#fefcf5) background
- Top and bottom hairline borders
- 40px vertical padding
- Max width 672px (max-w-2xl)
- Centred with margin auto

#### Scenario: Pull quote renders correctly
- **WHEN** a pull quote appears in the story section
- **THEN** it SHALL be centred
- **AND** it SHALL have hairline borders above and below
- **AND** its width SHALL NOT exceed 672px

### Requirement: Progress indicator
A subtle progress indicator SHALL appear in the hero section showing reading progress. It SHALL be a thin line at the top of the page that fills from left to right as the user scrolls through the About page content.

Implementation: A fixed div at top: 0, height: 2px, background: brass gold (#c9a96e), width tied to scroll position via a scroll listener.

#### Scenario: Progress indicator fills on scroll
- **WHEN** the user is at the top of the About page
- **THEN** the progress indicator width SHALL be 0%
- **WHEN** the user scrolls to the bottom of the About page
- **THEN** the progress indicator width SHALL be 100%
- **AND** the indicator SHALL be 2px tall and brass gold
