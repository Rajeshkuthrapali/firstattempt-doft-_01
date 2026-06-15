## ADDED Requirements

This is a CSS bug-fix change only. No new capabilities are being introduced and no existing capability requirements are modified. All changes are implementation-level CSS fixes to the existing design system.

## ADDED Requirements

### Requirement: CSS fixes render without visual regressions
The CSS fixes SHALL not cause any visual regressions on existing pages. All previously working pages SHALL continue to work with the corrected styling.

#### Scenario: Build passes
- **WHEN** the project is built with `npm run build`
- **THEN** the build completes without errors or warnings

#### Scenario: Dev server shows correct styling
- **WHEN** the dev server is running
- **THEN** pages display with the correct luxury design (Cormorant Garamond headings, warm ivory background, brass-gold accents, proper type scale)
