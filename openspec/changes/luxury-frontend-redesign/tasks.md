## Tasks

The implementation is organised into 7 phases matching the migration plan in `design.md`. Each phase produces a deployable, independently-testable state.

Dependency notation: `A ← B` means A depends on B (B must be done first).

---

### Phase 1: Design Foundation
**Goal**: Establish the design token system and CSS foundation. No visual changes to any page — just the scaffolding that everything else builds on.

- [x] 1.1 Update `design/tokens.ts` with new colour, spacing, radius, and shadow tokens (30 min, design-tokens)
- [x] 1.2 Add colour tokens to `index.css` `@theme` block (20 min, design-tokens)
- [x] 1.3 Add spacing tokens to `index.css` `@theme` block (15 min, design-tokens)
- [x] 1.4 Add border-radius and shadow tokens to `index.css` `@theme` block (15 min, design-tokens)
- [x] 1.5 Add shimmer animation keyframes to `index.css` (10 min, skeleton-system)
- [x] 1.6 Define heading type scale (6 levels) as utility classes in `index.css` (25 min, typography-system)
- [x] 1.7 Define body type scale (6 levels) as utility classes in `index.css` (20 min, typography-system)
- [x] 1.8 Add `prefers-reduced-motion` support verification in `index.css` (10 min, motion-system)
- [x] 1.9 Reference tokens in existing components (replace hardcoded values) (1 hour, design-tokens)
- [x] 1.10 Verify no visual regressions — smoke test all 13 pages (30 min)
*Phase 1 complete — design foundation established*

---

### Phase 2: Core Components
**Goal**: Implement shared components (skeleton system, toast system, updated navigation) and component audit.

- [x] 2.1 Create `<PageSkeleton>` component (30 min, skeleton-system)
- [x] 2.2 Create `<ProductCardSkeleton>` component (20 min, skeleton-system)
- [x] 2.3 Create `<ProductGridSkeleton>` component (15 min, skeleton-system)
- [x] 2.4 Create toast Zustand store (`src/stores/toast.ts`) (25 min, toast-system)
- [x] 2.5 Create `<ToastContainer>` component with GSAP slide animation (35 min, toast-system)
- [x] 2.6 Integrate toast store into cart store (add/remove/clear actions) (30 min, toast-system)
- [x] 2.7 Integrate skeleton components into existing pages (loading states) (1 hour, skeleton-system)
- [x] 2.8 Remove WhatsApp FAB from LayoutShell and CartDrawer (15 min)
- [x] 2.9 Add "Contact" link to footer (replacing FAB) (15 min)
- [x] 2.10 Remove dark mode dead CSS from `index.css` (15 min)
- [x] 2.11 Update navigation — "Our Story" → "/about" (10 min, about-page)
- [x] 2.12 Verify all skeleton + toast components render correctly (20 min)
*Phase 2 complete — core components built*

---

### Phase 3: GSAP Animation Refactor
**Goal**: Strip prohibited animations, simplify the animation library, implement the hero reveal timeline.

- [x] 3.1 Audit current `src/lib/animations.ts` — identify prohibited functions (15 min, motion-system)
- [x] 3.2 Remove parallax, cursor, particle, marquee, pin-scroll code (30 min, motion-system)
- [x] 3.3 Implement hero reveal animation (staggered headline/subtext/CTA) (25 min, motion-system)
- [x] 3.4 Implement image clip reveal animation (20 min, motion-system)
- [x] 3.5 Implement section fade-in animation (scroll-triggered) (15 min, motion-system)
- [x] 3.6 Implement product grid stagger animation (15 min, motion-system)
- [x] 3.7 Implement toast slide-in animation (15 min, motion-system)
- [x] 3.8 Remove ScrollTrigger over-broad selectors (15 min, motion-system)
- [x] 3.9 Verify all animations with `prefers-reduced-motion: reduce` (15 min, motion-system)
*Phase 3 complete — GSAP animation scope reduced*

---

### Phase 4: Home Page Redesign
**Goal**: Restructure the Home page to the 7-section editorial layout.

- [x] 4.1 Design 7-section layout structure (Hero, Brand Philosophy, Featured Collection, Best Sellers, Craftsmanship, Testimonials, Newsletter) (30 min)
- [x] 4.2 Implement Hero section with staggered reveal animation (45 min)
- [x] 4.3 Implement Brand Philosophy section (editorial text + image) (30 min)
- [x] 4.4 Implement Featured Collection section (curated grid, 2-3 products) (30 min)
- [x] 4.5 Implement Best Sellers section (product grid with stagger) (30 min)
- [x] 4.6 Implement Craftsmanship section (text + image, like About page) (30 min)
- [x] 4.7 Implement Testimonials section (text-only, centred quotes) (25 min)
- [x] 4.8 Implement Newsletter section (minimal email input + CTA) (25 min)
- [x] 4.9 Add section fade-in animations (scroll-triggered) to all 7 sections (20 min)
- [x] 4.10 Remove old Home page code and WhatsApp FAB remnants (15 min)
- [x] 4.11 Verify Home page on mobile, tablet, desktop (20 min)
*Phase 4 complete — home page redesigned*

---

### Phase 5: Product Page Enhancement
**Goal**: Transform the Product page into a rich editorial experience.

- [x] 5.1 Implement product image gallery (single image, no carousel) (30 min)
- [x] 5.2 Redesign product title and description layout (typography-first) (30 min)
- [x] 5.3 Add scent notes display (top, heart, base — editorial layout) (35 min)
- [x] 5.4 Add product specifications (burn time, weight, origin, etc.) (25 min)
- [x] 5.5 Redesign add-to-cart section (quantity + add button + wishlist) (30 min)
- [x] 5.6 Add cross-sell section (2-3 related products, heading-s) (25 min)
- [x] 5.7 Add image clip reveal animation for gallery (15 min, motion-system)
- [x] 5.8 Add section fade-in animations (15 min)
- [x] 5.9 Remove old Product page code (15 min)
- [x] 5.10 Verify Product page on mobile, tablet, desktop (20 min)
*Phase 5 complete — product page enhanced*

---

### Phase 6: Supporting Pages Visual Pass
**Goal**: Apply the design system to Collections, Checkout, Search, Auth, Account, Policy, Contact pages.

- [x] 6.1 Collections page — typography pass, spacing alignment, skeleton (45 min)
- [x] 6.2 Checkout page — typography pass, spacing, summary layout (30 min)
- [x] 6.3 Search page — typography, skeleton, results layout (30 min)
- [x] 6.4 Auth page (sign-in/sign-up) — typography, spacing, card layout (25 min)
- [x] 6.5 Account page — typography, order history layout, skeleton (30 min)
- [x] 6.6 Policy pages — typography, line length constraint (20 min)
- [x] 6.7 Contact page — typography, layout alignment (20 min)
- [x] 6.8 Remove dead pages: GiftRegistry, Rewards, AccountLoyalty routes (15 min)
- [x] 6.9 Fix all dead navigation links across the site (20 min)
*Phase 6 complete — supporting pages aligned*

---

### Phase 7: New Pages
**Goal**: Create the 3 new pages — About, Journal, 404.

- [x] 7.1 Create About page with 5-section editorial layout (1.5 hours, about-page)
- [x] 7.2 Create `src/data/journal.ts` with 3 seed articles (1 hour, journal-section)
- [x] 7.3 Create `<JournalCard>` component (30 min, journal-section)
- [x] 7.4 Create Journal overview page (route + grid layout) (1 hour, journal-section)
- [x] 7.5 Create individual article page (route + full layout) (1 hour, journal-section)
- [x] 7.6 Create 404 Not Found page (30 min, not-found-page)
- [x] 7.7 Register all new routes in App.tsx (lazy-loaded) (20 min)
- [x] 7.8 Add Journal link to navigation (10 min)
- [x] 7.9 Verify all new pages on mobile, tablet, desktop (30 min)
*Phase 7 complete — new pages created*

---

## Summary

| Phase | Description | Tasks | Estimate |
|-------|-------------|-------|----------|
| 1 | Design Foundation | 10 | 3.5 h |
| 2 | Core Components | 12 | 4 h |
| 3 | GSAP Animation Refactor | 9 | 2.5 h |
| 4 | Home Page Redesign | 11 | 5 h |
| 5 | Product Page Enhancement | 10 | 4 h |
| 6 | Supporting Pages Visual Pass | 9 | 3.5 h |
| 7 | New Pages (About, Journal, 404) | 9 | 6.5 h |
| **Total** | | **70** | **~29 hours** |

## Dependencies

Phase 1 is a prerequisite for everything. Phases 2 and 3 can proceed in parallel after Phase 1. Phases 4, 5, 6 can proceed in parallel after Phases 2 + 3. Phase 7 depends on Phase 2 and can start after Phase 2 completes (ideally during Phase 4-6 for parallel work).

---

## Final Status

🎉 **All 70 tasks complete!**
