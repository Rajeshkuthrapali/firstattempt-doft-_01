## 1. Phase 1: Fix CSS Foundation in index.css

- [x] 1.1 Add missing heading type scale utility classes (`heading-hero-display`, `heading-xl`, `heading-l`, `heading-m`, `heading-s`, `heading-xs`) to `src/index.css` inside `@layer utilities` with correct font-size, line-height, letter-spacing, and font-family for each level
- [x] 1.2 Add missing body type scale utility classes (`body-large`, `body`, `body-small`, `caption`, `micro`, `tiny`) to `src/index.css` inside `@layer utilities` with correct font-size, line-height, letter-spacing, and font-family for each level
- [x] 1.3 Change `--font-heading: var(--font-sans)` to `--font-heading: "Cormorant Garamond", serif` in the `@theme inline` block of `src/index.css`
- [x] 1.4 Remove `@apply bg-background text-foreground` from `body` styles in `src/index.css` so the new colour tokens (`background-color: var(--color-soft-cream)`, `color: var(--color-ink)`) take effect
- [x] 1.5 Remove `@apply border-border outline-ring/50` from the universal selector `* { }` in `src/index.css` so the new border tokens (`--color-hairline`, `--color-soft-border`) are not overridden
- [x] 1.6 Simplify heading base font-family in `h1-h6` rule from `"Cormorant Garamond", "Playfair Display", serif` to `"Cormorant Garamond", serif`

## 2. Phase 2: Fix Nav Component Accent Colours

- [x] 2.1 Replace `bg-dusty-rose` with `bg-brass-gold` on the announcement bar in `src/components/Nav.tsx`
- [x] 2.2 Replace `text-dusty-rose` with `text-brass-gold` on active nav link states (both desktop and mobile) in `src/components/Nav.tsx`
- [x] 2.3 Replace `hover:text-dusty-rose` with `hover:text-brass-gold` on the mobile hamburger toggle in `src/components/Nav.tsx`
- [x] 2.4 Replace `bg-dusty-rose` with `bg-brass-gold` on the cart item count badge in `src/components/Nav.tsx`

## 3. Phase 3: Clean Up Orphaned Footer Component

- [x] 3.1 Verify `Footer.tsx` is not imported anywhere else in the codebase using `grep -r "from.*Footer" src/ --include="*.tsx" --include="*.ts"`
- [x] 3.2 Remove `src/components/layout/Footer.tsx` file and its parent directory if empty

## 4. Phase 4: Verify Build and Visual Inspection

- [x] 4.1 Run `npm run build` and confirm it completes without errors or warnings
- [x] 4.2 Launch dev server and visually verify: headings render in Cormorant Garamond serif, page background is warm ivory, brass-gold appears as the primary accent in nav, proper type scale is applied on Home, Product, About, Journal, and NotFound pages
