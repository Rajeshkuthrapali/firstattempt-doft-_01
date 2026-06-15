## ADDED Requirements

### Requirement: Colour token system
The design system SHALL define a complete colour token palette with the following categories and values:

**Surface colours:**
- `--color-warm-ivory`: #fefcf5 (primary page background)
- `--color-soft-cream`: #faf7f4 (secondary surface)
- `--color-warm-sand`: #f5f0ea (tertiary surface, testimonial background)
- `--color-deep-charcoal`: #1a1a1a (hero sections, footer background)
- `--color-almost-black`: #0d0d0d (extreme contrast sections)

**Text colours:**
- `--color-ink`: #1a1a1a (primary text)
- `--color-dark`: #333333 (secondary text)
- `--color-muted`: #666666 (body text)
- `--color-light`: #999999 (placeholder, disabled)

**Accent colours:**
- `--color-brass-gold`: #c9a96e (primary accent — badges, dividers, hover states)
- `--color-pale-gold`: #e8d5b5 (subtle accent — backgrounds, highlights)
- `--color-dusty-rose`: #c4a093 (secondary accent — sparing use only)
- `--color-deep-rose`: #a8877b (accent hover state)

**Border colours:**
- `--color-hairline`: #e5ddd4 (thin borders, dividers)
- `--color-soft-border`: #d9cfc4 (card borders)

**Semantic colours:**
- `--color-success`: #7d9b6e (in stock, free shipping indicators)
- `--color-error`: #c96b6b (error states, sold out)
- `--color-warning`: #d9a05b (low stock)

#### Scenario: Colour tokens are defined in @theme block
- **WHEN** the CSS file is loaded
- **THEN** all colour tokens SHALL be defined in the `@theme` block as `--color-*` custom properties
- **AND** they SHALL be immediately available as Tailwind utility classes (e.g., `bg-warm-ivory`, `text-ink`, `border-hairline`)

#### Scenario: Colour tokens have TypeScript constants
- **WHEN** a developer imports from `design/tokens.ts`
- **THEN** all colour values SHALL be exported as typed constants matching the CSS custom properties
- **AND** the TypeScript types SHALL be generated from the token definitions

### Requirement: Spacing token system
The design system SHALL define a spacing scale for vertical rhythm and component padding:

- `--spacing-section`: 96px (between major page sections)
- `--spacing-subsection`: 64px (between related sections)
- `--spacing-component`: 40px (between blocks within a section)
- `--spacing-element`: 24px (between related elements)
- `--spacing-tight`: 16px (between small elements)
- `--spacing-compact`: 8px (between micro elements)
- `--spacing-card-padding`: 32px (card inner padding)
- `--spacing-button-padding-x`: 24px (button horizontal padding)
- `--spacing-button-padding-y`: 12px (button vertical padding)
- `--spacing-page-gutter`: clamp(1rem, 4vw, 3rem) (page edge padding)

#### Scenario: Spacing tokens exist in @theme
- **WHEN** the CSS file is loaded
- **THEN** spacing tokens SHALL be defined in the `@theme` block
- **AND** they SHALL be available as Tailwind spacing utilities

### Requirement: Border radius convention
All UI elements SHALL use either 0px radius (sharp corners — identity) or 4px radius (subtle softness for cards only). No other radius values are permitted.

- Cards: 0px (sharp corners following Aesop/Loewe convention) OR 4px (if warmth is preferred)
- Buttons: 0px
- Inputs: 0px
- Modals: 0px
- Badges: 0px
- Images: 0px

#### Scenario: Border radius values are constrained
- **WHEN** any UI element renders
- **THEN** its border-radius SHALL be either 0px or 4px
- **AND** no element SHALL use rounded-lg, rounded-xl, or rounded-full

### Requirement: Shadow system
Shadows SHALL be minimal and sophisticated:

- `--shadow-card`: 0 2px 16px rgba(26, 26, 26, 0.04) (default card state)
- `--shadow-card-hover`: 0 8px 32px rgba(26, 26, 26, 0.08) (hover state)
- `--shadow-elevated`: 0 12px 40px rgba(26, 26, 26, 0.10) (modals, dropdowns)
- `--shadow-none`: none (all other elements — shadows are the exception, not the rule)

#### Scenario: Shadows are used sparingly
- **WHEN** a card or modal renders
- **THEN** it SHALL use one of the defined shadow tokens
- **AND** buttons, inputs, nav, and text elements SHALL NOT have shadows
