## Context

Lumière is an Indian luxury candle brand. The current frontend (React 19, TypeScript, Tailwind CSS v4, shadcn/ui, GSAP, Zustand) is technically functional but visually undifferentiated. It uses a warm cream palette with dusty rose accents, Cormorant Garamond headings with Inter body text, and GSAP scroll animations — but lacks the restraint, typographic hierarchy, spacing discipline, and editorial quality that define genuine luxury digital experiences.

The existing `design/tokens.ts` captures some colour and spacing values but is incomplete: there is no systematic type scale, no motion framework, no component standards, and many values are hardcoded as inline Tailwind classes. The redesign must establish a complete design foundation before touching any page implementation.

The proposal identifies 8 new capabilities (design-tokens, typography-system, motion-system, skeleton-system, toast-system, about-page, journal-section, not-found-page) plus modifications to every existing page component.

## Goals / Non-Goals

**Goals:**
- Establish a comprehensive, internally-consistent luxury design system (tokens, typography, spacing, motion, component standards)
- Replace the current scattered styling approach with a centralised token system
- Create deliberate typographic tension between Cormorant Garamond (serif, expressive, editorial) and Inter/Geist (sans, neutral, functional)
- Implement generous whitespace (96px+ section spacing) as the primary rhythm mechanism
- Reduce the dusty rose accent (#c4a093) from dominant to sparing; introduce brass gold (#c9a96e) as the primary accent; add deep charcoal (#1a1a1a) for contrast sections
- Redesign Home page to 7-section editorial layout (Hero, Brand Philosophy, Featured Collection, Best Sellers, Craftsmanship, Testimonials, Newsletter)
- Redesign Product page as the highest priority — gallery, scent storytelling, specifications hierarchy, add-to-cart, cross-sell
- Implement skeleton loading screens across all data-fetching pages
- Implement toast notification system for cart/wishlist feedback
- Create About page, Journal section (3 seed articles), and 404 page
- Remove WhatsApp FAB, dark mode dead code, and unused placeholder pages (GiftRegistry, Rewards, AccountLoyalty)
- Fix all dead navigation links

**Non-Goals:**
- No new backend features or API changes
- No breaking changes to Zustand store interfaces
- No subscription, loyalty, gift registry, scent quiz, or other growth features
- No multi-language support
- No user review system
- No SEO overhaul (existing meta tags are adequate for now)
- No server-side rendering migration (stays as Vite SPA)
- No changes to the admin panel (out of scope)

## Decisions

### Decision 1: Token-first implementation order
Tokens → Typography → Spacing → Motion → Components → Pages
**Rationale**: Every design decision flows from the token system. Implementing tokens first means every subsequent decision references the same source of truth. This prevents the current problem of scattered hardcoded values.

### Decision 2: CSS custom properties over runtime tokens
Design tokens will be implemented as CSS custom properties in the `@theme` block in `index.css`, with TypeScript constants in `design/tokens.ts` for programmatic access (JS animations, conditional styles).
**Rationale**: CSS variables are natively supported by Tailwind v4's `@theme` directive, zero runtime overhead, and automatically available in all utility classes. The TypeScript file provides type safety for programmatic use without duplicating values.
**Alternatives considered**: Runtime token object passed through React context — rejected because Tailwind integration would require a plugin. Pure Tailwind config — rejected because some tokens need JS access.

### Decision 3: Colour palette evolution (not revolution)
**Rationale**: The existing warm cream (#faf7f4) and dark brown (#2d2926) foundation is sound and brand-appropriate. The changes are:
- Shift warm cream to warm ivory (#fefcf5) for slightly more editorial warmth
- Keep the existing #faf7f4 as a secondary surface
- Introduce deep charcoal (#1a1a1a) for hero sections and footer (contrast with warm ivory)
- Reduce dusty rose (#c4a093) from dominant accent to sparing use (selected nav state, small dots, hero CTA)
- Introduce brass gold (#c9a96e) as new primary accent for badges, divider ornaments, hover states
- Keep secondary text (#6b5e54) and muted text (#9a8d82) as-is
- Keep #e8e0d8 and #f0ebe5 as border colours

### Decision 4: Typography as the primary luxury signal
**Rationale**: The refrence brands (Aesop, Byredo, Loewe) all treat typography as their strongest brand asset. The existing pairing of Cormorant Garamond (serif) and Inter (sans) is good but needs systematic treatment:
- Cormorant Garamond is reserved exclusively for headlines (h1-h6, hero text, section titles, quotes)
- Inter is used for ALL body text, navigation, buttons, labels, captions — never mix
- No decorative typefaces (no script, no display fonts)
- Type scale expanded: Hero (64px), XL (48px), L (36px), M (28px), S (22px), XS (18px)
- Body scale: Large (16px), Body (15px), Small (14px), Caption (13px), Micro (11px), Tiny (10px)
- Letter-spacing increases with size for headlines; body text has normal tracking
- Line height: 1.1 for display, 1.2-1.35 for headings, 1.6-1.7 for body
- Max line length: 60-75 characters for body text

### Decision 5: GSAP scope reduction
Keep the existing GSAP + ScrollTrigger setup but strip it to only:

```
Allowed:
├── Hero reveal (800ms, staggered: headline → subtext → CTA)
├── Image clip reveals (700ms, clip-path from right)
├── Section fade-ins (600ms, scroll-triggered)
├── Product grid stagger (600ms, 100ms per card)
└── Cart toast feedback (400ms slide-in)

Removed:
├── Parallax effects
├── Cursor followers
├── Particle systems
├── Magnetic buttons
├── Marquees / scrolling text
├── Apple-style pin-scroll sections
├── Auto-playing carousels
└── Any "showcase" animation
```

**Rationale**: The current animations.ts already has most of these functions. The change is mostly removing the ScrollTrigger initialiser's over-broad selectors and adding the hero reveal timeline. No new GSAP plugins needed.

### Decision 6: Skeleton system as shared components, not per-page
Create reusable `<PageSkeleton>`, `<ProductCardSkeleton>`, and `<ProductGridSkeleton>` components that accept width/height props. Each data-fetching page wraps its loading state with the appropriate skeleton.
**Rationale**: Reduces duplication across 6+ pages that show "Loading..." text. Consistent shimmer animation in brand colours.

### Decision 7: Toast system as Zustand store + portal
A lightweight `toast.ts` store (similar to existing ui.ts) manages a queue of toast messages. A `<ToastContainer>` portal renders them fixed at the top-right. Each toast auto-dismisses after 3 seconds with a slide-out animation.
**Rationale**: Zustand is already in the project. No need for react-hot-toast or another dependency. The pattern matches the existing store architecture.

### Decision 8: Nav link restructure
- Remove "Our Story" link (no page exists yet — will be added in About phase)
- Replace footer dead links ("Shop All", "Bestsellers", "New Arrivals", "Gift Sets") with working links or remove them
- "Shop" in nav links to `/collections`
- Collections page filter pills remain as-is
- WhatsApp FAB removed from CartDrawer.tsx

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Token system changes could break existing component styles | Visual regression across the site | Implement tokens in a feature branch. Use Tailwind's `@theme` — existing inline values will still work. Audit visually after token migration before touching component markup |
| Reducing dusty rose accent could make the site feel less distinctive | Brand identity dilution | Test the brass gold accent as a replacement in key interaction points (hover states, badges). Keep dusty rose in the palette but at 10-20% of current usage |
| Removing WhatsApp FAB could reduce customer enquiries | Loss of a communication channel | Replace with a subtle "Contact" link in the footer. The Contact page already exists and has a form |
| Removing dark mode could disappoint users who prefer dark interfaces | Accessibility concern | Dark mode was never activated — no toggle exists, no `.dark` class is ever applied. Removing dead CSS is net positive |
| Skeleton system adds development time | Slower initial implementation | Reusable skeleton components reduce per-page effort. Prioritise for pages with network requests (Home, Product, Collections, Account, Search) |

## Migration Plan

The redesign is implemented in phases. Each phase produces a deployable state:

1. **Phase 1: Design Foundation** — Update `design/tokens.ts`, `index.css` with new colour tokens, typography scale, spacing system, animation rules. No visual changes yet — just the foundation.

2. **Phase 2: Core Components** — Update shared components (Nav, LayoutShell, ProductCard, CartDrawer, QuickViewModal, shadcn/ui components) to use new design tokens. Implement skeleton components and toast system.

3. **Phase 3: Home Page** — Restructure Home.tsx to 7-section editorial layout. Implement hero reveal animation.

4. **Phase 4: Product Page** — Rich gallery, scent storytelling, specs, add-to-cart, cross-sell. Highest visual investment.

5. **Phase 5: Supporting Pages** — Collections, Checkout, Search, Auth, Account, Policy, Contact — visual pass to align with design system.

6. **Phase 6: New Pages** — About page, Journal section (3 articles), 404 page.

7. **Phase 7: Cleanup** — Remove WhatsApp FAB, dark mode CSS, GiftRegistry/Rewards/AccountLoyalty dead pages. Fix dead nav links.

Each phase can be deployed independently. Rollback is per-phase via git revert.

## Open Questions

- Should the journal section use markdown files for articles (client-side rendering) or a lightweight CMS? Current inclination: markdown for the 3 seed articles, CMS later.
- Should the 404 page be a route in App.tsx or handled at the router level? Current inclination: catch-all route in React Router.
- The brass gold accent (#c9a96e) — should it be warm (toward brass) or pale (toward champagne)? Current inclination: warm brass #c9a96e for contrast against warm ivory.
- Should the toast system support undo actions (e.g., "Item removed — Undo")? Current inclination: yes for cart actions, no for wishlist/form.
