## Why

The current Lumière frontend is technically functional but visually and experientially undifferentiated. The design lacks typographic hierarchy, uses colour without restraint, has inconsistent spacing, and fails to communicate the luxury candle brand positioning. In a market where Aesop, Byredo, Diptyque, Le Labo, Loewe, and Trudon set the digital luxury standard, the current site reads as a generic React storefront rather than a premium Indian candle house.

A complete frontend redesign is needed to establish Lumière as a credible luxury fragrance brand. The redesign must prioritise restraint, typographic quality, editorial composition, and atmosphere over features, animation, or visual gimmicks. The product and photography must become the hero — the interface should disappear.

## What Changes

- **Design system rewrite** — Replace the current ad-hoc colour tokens, typography, spacing, and component styles with a comprehensive, internally-consistent luxury design system
- **Colour palette refinement** — Warm ivory (#fefcf5), deep charcoal (#1a1a1a), brass gold accent (#c9a96e), with dusty rose (#c4a093) reduced from dominant accent to sparing use
- **Typography system overhaul** — Establish Cormorant Garamond (serif) for headlines and Inter/Geist (sans) for body text as a deliberate typographic tension that becomes the primary brand signal
- **Spacing system** — Generous 96px+ section spacing based on luxury editorial standards, with whitespace as the primary separator
- **Animation system** — GSAP retained but reduced to: hero reveals, image clip reveals, section fade-ins, product grid stagger, cart feedback. All other animation removed (parallax, cursor effects, marquees, particle systems)
- **Home page restructured** — 7 sections: Hero, Brand Philosophy, Featured Collection, Best Sellers, Craftsmanship, Testimonials, Newsletter. No Instagram wall, no carousels, no feature bloat
- **Product page redesign** — Highest priority page. Rich image gallery, editorial scent storytelling, specifications hierarchy, improved add-to-cart, refined cross-sell. Must feel like a luxury product catalogue
- **Collections page refinement** — Editorial header, category filter pills, product grid with staggered scroll reveal. No recommended sections or recently viewed clutter
- **Checkout page completion** — Finish payment integration, smooth flow from summary through shipping to payment confirmation
- **Skeleton loading system** — Remove all "Loading..." text placeholders. Implement skeleton screens across all pages that load data
- **Toast notification system** — Add toast for cart add/remove actions with smooth entrance animation
- **404 page** — Atmospheric, brand-appropriate 404 page
- **Fix dead navigation links** — "Shop All", "Bestsellers", "New Arrivals", "Gift Sets" in footer and nav — either link to real pages or remove
- **About / Our Story page** — Editorial brand narrative page
- **Journal / Blog section** — Seed with 3 articles: candle care guide, scent guide, gifting guide
- **WhatsApp FAB removal** — Remove the floating WhatsApp button; replace with subtle "Contact" link in footer
- **Dark mode removal** — Remove unused dark mode CSS variables to reduce dead code
- **Dead page removal** — Remove GiftRegistry.tsx, Rewards.tsx, AccountLoyalty.tsx (unimplemented placeholder pages) from the codebase

## Capabilities

### New Capabilities

- `design-tokens`: Centralised token system for colours, typography, spacing, breakpoints, shadows, and motion. Replaces the current ad-hoc design/tokens.ts and scattered CSS values
- `typography-system`: Deliberate pairing of Cormorant Garamond (headlines) and Inter/Geist (body+UI). Full type scale from Hero (64px) to Tiny (10px) with spacing rhythms
- `motion-system`: GSAP-based animation framework limited to hero reveals, image clip reveals, section fade-ins, product grid stagger, and cart feedback. No parallax, cursor effects, particle systems, or auto-play
- `skeleton-system`: Skeleton screen components for every data-loading page. Replaces "Loading..." text placeholders with brand-consistent shimmer patterns
- `toast-system`: Toast notification system for cart add/remove, wishlist toggle, and form submission feedback
- `about-page`: Editorial brand storytelling page — craft, sourcing, philosophy
- `journal-section`: Blog section with article listing, category filter, and article detail page. Seed with 3 initial articles
- `not-found-page`: Brand-appropriate 404 page with atmospheric visual and elegant messaging

### Modified Capabilities

- *(No existing specs to modify — this is the first major feature change)*

## Impact

- **src/design/tokens.ts** — Complete rewrite of the token system
- **src/index.css** — Significant restructure: new colour tokens, typography scale, spacing utilities, animation keyframes
- **src/lib/animations.ts** — Reduced scope, cleaner API
- **src/components/** — Most components need visual pass to align with new design system
- **src/pages/Home.tsx** — Complete restructure to 7-section editorial layout
- **src/pages/Product.tsx** — Significant enhancement of gallery, storytelling, specs
- **src/pages/Collections.tsx** — Refinement of header, filters, grid
- **src/pages/Checkout.tsx** — Complete payment flow
- **src/pages/Search.tsx** — Visual polish pass
- **src/pages/Auth.tsx** — Visual polish pass
- **src/pages/Account.tsx** — Visual polish pass
- **src/pages/Policy.tsx** — Visual polish pass
- **src/pages/Contact.tsx** — Visual polish pass
- **src/components/Nav.tsx** — Navigation refinement
- **src/components/LayoutShell.tsx** — Footer and layout refinement
- **src/components/CartDrawer.tsx** — Visual polish pass
- **src/components/QuickViewModal.tsx** — Visual polish pass
- **src/components/ProductCard.tsx** — Card design refinement
- **src/components/ui/** — Visual pass on all 6 shadcn components
- **src/stores/** — No breaking changes expected, but toast store may be added
- **package.json** — No new dependencies expected (GSAP, shadcn, Tailwind already present)
- **Removals**: WhatsApp FAB from CartDrawer.tsx; GiftRegistry.tsx, Rewards.tsx, AccountLoyalty.tsx page files; unused dark mode CSS variables
