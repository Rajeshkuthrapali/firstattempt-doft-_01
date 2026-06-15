## ADDED Requirements

### Requirement: Font pairing
The design system SHALL use exactly two typefaces:
- **Cormorant Garamond** (serif) — for all headlines, display text, hero copy, and pull quotes only
- **Inter** (sans-serif) — for all body text, navigation, buttons, labels, captions, and UI elements

Geist Variable (currently in package.json as @fontsource-variable/geist) MAY substitute for Inter as the sans-serif choice, but the pairing pattern (serif headline + sans UI) SHALL remain consistent.

Cormorant Garamond SHALL NOT be used for body text, navigation, buttons, or any UI element.
Inter SHALL NOT be used for display headlines, hero text, or pull quotes.

#### Scenario: Typefaces are loaded correctly
- **WHEN** the page loads
- **THEN** Cormorant Garamond SHALL be loaded from Google Fonts via the existing `<link>` in index.html
- **AND** Inter SHALL be loaded from Google Fonts (or Geist from @fontsource-variable/geist npm package)
- **AND** both fonts SHALL render without FOIT (flash of invisible text)

#### Scenario: Font pairing is enforced in component usage
- **WHEN** a component renders a headline (h1-h6, hero text, section title)
- **THEN** it SHALL use `font-['Cormorant_Garamond',serif]`
- **WHEN** a component renders body text, nav link, button, label, caption, or any UI element
- **THEN** it SHALL use `font-sans` (Inter or Geist)

### Requirement: Heading type scale
The design system SHALL define the following heading sizes using Cormorant Garamond:

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|-------|------|-------------|--------|----------------|-------|
| hero-display | 64px | 1.1 | 300 (light) italic | -0.02em | Hero headlines only |
| heading-xl | 48px | 1.15 | 400 (normal) | -0.01em | Major section titles |
| heading-l | 36px | 1.2 | 500 (medium) | 0em | Page titles |
| heading-m | 28px | 1.25 | 500 (medium) | 0.01em | Section subtitles |
| heading-s | 22px | 1.3 | 500 (medium) | 0.02em | Card titles, product names |
| heading-xs | 18px | 1.35 | 600 (semibold) | 0.03em | Small headings |

#### Scenario: Heading scale is available as utility classes
- **WHEN** a heading component renders
- **THEN** each heading level SHALL have a corresponding class or token that sets the correct font-family, size, line-height, weight, and letter-spacing
- **AND** the values SHALL match the table above

### Requirement: Body type scale
The design system SHALL define the following body text sizes using Inter:

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|-------|------|-------------|--------|----------------|-------|
| body-large | 16px | 1.7 | 400 | normal | Product descriptions, long-form text |
| body | 15px | 1.7 | 400 | normal | Standard paragraphs |
| body-small | 14px | 1.6 | 400 | normal | Secondary text, metadata |
| caption | 13px | 1.5 | 500 | 0.02em | Labels, timestamps |
| micro | 11px | 1.4 | 600 | 0.08em | Badges, small labels |
| tiny | 10px | 1.3 | 600 | 0.1em | Legal, fine print |

#### Scenario: Body scale is available as utility classes
- **WHEN** body text renders
- **THEN** each size SHALL have a corresponding class or token

### Requirement: Line length constraint
Body text SHALL have a maximum line length of 60-75 characters. This SHALL be achieved by constraining the container width, not by limiting characters.

- Standard editorial text: max-w-2xl (672px)
- Product descriptions: max-w-lg (512px) or max-w-xl (576px)
- Hero text: constrained by layout, not width

#### Scenario: Body text line length is limited
- **WHEN** body text is rendered in an editorial context
- **THEN** its container SHALL NOT exceed the max-w-2xl breakpoint (672px)

### Requirement: Heading letter-spacing rhythm
Heading letter-spacing SHALL increase inversely with size:
- Largest headings: tighter tracking (-0.02em to 0em)
- Medium headings: normal tracking (0em to 0.02em)
- Smallest headings: wider tracking (0.02em to 0.03em)

This creates a deliberate rhythm where large display text feels compressed and authoritative, while smaller headings feel spacious and refined.

#### Scenario: Heading letter-spacing follows the scale
- **WHEN** a heading renders
- **THEN** its letter-spacing SHALL match the values in the heading type scale table
