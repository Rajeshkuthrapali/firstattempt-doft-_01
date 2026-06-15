## Why

The luxury frontend redesign (implemented in `luxury-frontend-redesign`) was implemented with new design tokens, typography utility classes, and brand colours — but critical CSS bugs prevent the new design from rendering correctly. The build passes without errors, but the site shows the old generic styling because CSS classes are missing, font tokens point to the wrong font family, and Tailwind utility overrides cancel out the new design tokens.

## What Changes

- **Add missing type scale CSS utility classes** — `heading-hero-display`, `heading-xl`, `heading-l`, `heading-m`, `heading-s`, `heading-xs`, `body-large`, `body`, `body-small`, `caption`, `micro`, and `tiny` are referenced throughout the new pages (Home, Product, About, Journal, NotFound) but do not exist in `src/index.css`. These need to be added as plain CSS utility classes with the correct font size, line height, letter spacing, and font family for each level.

- **Fix `--font-heading` token** — Currently `--font-heading: var(--font-sans)` resolves to `'Geist Variable', sans-serif`. This should resolve to `"Cormorant Garamond", serif` so all 31+ usages of `font-heading` render headings in the correct serif font.

- **Remove body `@apply` overrides that cancel new colour tokens** — In `src/index.css`, the `body` styles set `background-color: var(--color-soft-cream)` and `color: var(--color-ink)` but then immediately override them with `@apply bg-background text-foreground` (which resolves to OKLCH white/black). These `@apply` directives must be removed.

- **Remove `* { @apply border-border }` universal override** — The universal selector applies `@apply border-border outline-ring/50` which overrides the new `--color-hairline` and `--color-soft-border` tokens with the old shadcn OKLCH-based border colour.

- **Replace dusty-rose with brass-gold as primary accent in Nav component** — The announcement bar, active nav links, hover states, and cart badge all use `dusty-rose` as the primary accent instead of `brass-gold` as specified in the design.

- **Simplify heading base font-family** — `h1-h6 { font-family: "Cormorant Garamond", "Playfair Display", serif; }` should be simplified to `"Cormorant Garamond", serif` to remove the unused fallback.

- **Handle orphaned Footer.tsx** — `src/components/layout/Footer.tsx` is not imported or used by `LayoutShell.tsx` (which has its own inline footer). Either remove the orphaned component or integrate it into the layout.

## Capabilities

### New Capabilities
This is a CSS bug-fix change only. No new capabilities are being introduced.

### Modified Capabilities
No spec-level capability requirements are changing. All fixes are implementation-level corrections to the existing design system established in the `luxury-frontend-redesign` change.

## Impact

- **src/index.css** — Add ~12 type scale utility classes, fix `--font-heading` token, remove `body` `@apply` overrides, remove `* { @apply border-border }`, simplify heading base font-family
- **src/components/Nav.tsx** — Replace `dusty-rose` usage with `brass-gold` as primary accent across announcement bar, active links, hover states, and cart badge
- **src/components/layout/Footer.tsx** — Either integrate into `LayoutShell.tsx` or remove the orphaned file
- **No JavaScript/build logic changes** — CSS-only and markup-only fixes
