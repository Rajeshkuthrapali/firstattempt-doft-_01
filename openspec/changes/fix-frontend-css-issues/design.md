## Context

The luxury frontend redesign introduced a comprehensive design system with new colour tokens, typography scale, and brand accents. However, the implementation has several CSS-level bugs that prevent the new design from rendering correctly:

1. **Missing utility classes** — The type scale utility classes (`heading-hero-display`, `heading-xl`, etc.) were never added to `index.css` despite being referenced across all new pages.
2. **Wrong font token** — `--font-heading` points to `--font-sans` (Geist) instead of Cormorant Garamond.
3. **Tailwind `@apply` overrides** — Body and universal selectors use `@apply` directives that resolve to old shadcn OKLCH tokens, overriding the new custom properties.
4. **Wrong accent colour** — Nav component uses `dusty-rose` instead of `brass-gold` as primary accent.
5. **Orphaned footer** — `Footer.tsx` is unused by `LayoutShell.tsx`.

The approach is surgical CSS and markup fixes — no re-implementation of pages or restructuring of the design system.

## Goals / Non-Goals

**Goals:**
- Add all missing type scale CSS utility classes to `src/index.css`
- Fix `--font-heading` to resolve to Cormorant Garamond serif font
- Remove body `@apply bg-background text-foreground` that overrides new colour tokens
- Remove `* { @apply border-border outline-ring/50 }` that overrides new border tokens
- Replace dusty-rose with brass-gold as primary accent in Nav component
- Simplify heading base font-family to remove Playfair Display fallback
- Remove orphaned `Footer.tsx` component (not used by LayoutShell)
- Verify build passes and visual changes render correctly

**Non-Goals:**
- No changes to the design token values (colours, spacing, shadows, etc.)
- No restructuring of page components or layout
- No changes to other components beyond Nav.tsx
- No JavaScript logic changes
- No adding new features or capabilities

## Decisions

### Decision 1: Plain CSS utility classes (not Tailwind components)
The type scale classes will be added as plain CSS utility classes inside `@layer utilities` in `index.css`, not as Tailwind `@apply` component classes. This keeps them consistent with the existing animation utility classes (`animate-fade-in-up`, `.delay-0`, etc.) and avoids any Tailwind resolution ordering issues.
**Rationale**: Plain CSS classes have predictable specificity and no build-time dependency. They are also more portable and easier to maintain independently of Tailwind's configuration.

### Decision 2: Hardcode the font stack for `--font-heading`
Instead of `--font-heading: var(--font-sans)`, use `--font-heading: "Cormorant Garamond", serif`. This directly references the Google Font loaded via `index.html` rather than chaining through another variable.
**Rationale**: Direct assignment is more explicit and avoids accidental breakage if `--font-sans` changes. The font is already loaded in the page from `index.html`.

### Decision 3: Remove `@apply` directives rather than reordering
The `@apply bg-background text-foreground` on `body` and `@apply border-border outline-ring/50` on `* { }` will simply be removed. The lines above them that set `background-color: var(--color-soft-cream)` and `color: var(--color-ink)` will remain and take effect.
**Rationale**: The new design tokens are already correctly assigned. The `@apply` directives only exist to satisfy shadcn's default theme requirements, but they actively harm the custom design system. Removing them is cleaner than trying to reassign the OKLCH variables.

### Decision 4: Surgical replacement in Nav.tsx
Replace `dusty-rose` with `brass-gold` in the announcement bar background, active link states, hover states, and cart badge. Keep `dusty-rose` only where it appears as secondary/subtle elements in the `index.css` (focus-visible outline, selection colour).
**Rationale**: The design decision in the original redesign was to reduce dusty-rose from dominant accent to sparing use. The Nav component is the most prominent place where the old accent persists. Other components (LayoutShell footer links, CartDrawer, etc.) retain dusty-rose as a secondary accent, which is acceptable for now.

### Decision 5: Remove orphaned Footer.tsx
Since `LayoutShell.tsx` has its own inline footer and `Footer.tsx` is not imported anywhere, remove `Footer.tsx` to eliminate dead code.
**Rationale**: The LayoutShell footer is already complete with brand info, quick links, support links, newsletter form, social icons, and copyright. The `Footer.tsx` component was from an older version of the layout and references `DOFT` (an older brand name) and `text-gold` (a non-existent Tailwind class). Removing it reduces maintenance burden.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Removing `@apply border-border` may cause missing borders in some shadcn components | Visual regression | The new `--color-hairline` and `--color-soft-border` tokens are explicitly used where borders are needed. shadcn components that relied on `border-border` will need explicit border colour assignments |
| Adding new CSS classes could conflict with existing utilities | Style conflicts | All type scale class names use a distinct naming convention (`heading-*`, `body-*`, `micro`, `tiny`) that is unlikely to conflict with Tailwind generated classes |
| Removing Footer.tsx could break an import we missed | Build error | Verify via grep that Footer.tsx is not imported anywhere else before deleting |

## Open Questions

None — all design decisions are straightforward CSS fixes with clear resolution paths.
