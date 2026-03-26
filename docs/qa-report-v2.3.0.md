# Post-Deploy QA Report (v2.3.0 / P4)

## Environment

- **Branch:** `p4-sprint` → tagged `v2.3.0`
- **Build:** `vite build` — 337 modules, 373 kB JS (111 kB gzip)
- **Tests:** `npx vitest run` — **187/187 passing** across 17 test files

---

## Personalization Flows

### Scent-Match Quiz (`/scent-match`)

- [x] Three-step quiz renders correctly with keyboard navigation and focus rings
- [x] Selecting options advances steps, progress indicators update visually
- [x] Final answer computes dominant profile via majority voting algorithm
- [x] Results page displays 3 product recommendations scored by note overlap
- [x] "Browse All" CTA navigates to `/collections?scent=[profile]` with pre-filled filter
- [x] "Retake Quiz" resets state cleanly
- [x] GA4 `scent_match_completed` event fires with `scent_profile` parameter

### Collections Integration

- [x] `?scent=` URL parameter auto-populates the search/filter input
- [x] Products matching scent keyword appear in filtered results

---

## CMS Campaign Pages

### Dynamic Rendering (`/campaign/:slug`)

- [x] Fetches block layout from Sanity (or static fallback when unconfigured)
- [x] `HeroBlock` renders full-viewport overlay with CTA link
- [x] `GridBlock` renders responsive image cards with hover animations
- [x] `SignUpBlock` captures email input and shows confirmation state
- [x] Loading spinner displayed during async fetch
- [x] 404-style message shown for unknown slugs

### Sanity Queries

- [x] `campaignBySlug` GROQ query resolves nested blocks and image assets
- [x] `allCollections` query scaffolded for future CMS-managed catalog pages
- [x] Fallback data (`FALLBACK_CAMPAIGN`) ensures dev environments render cleanly

---

## Email Automation

### Provider Abstraction (`email.ts`)

- [x] `sendEmail()` routes to Resend, SendGrid, or console based on env config
- [x] `abandonedCartTemplate()` generates valid HTML with item list and CTA
- [x] `loyaltyUnlockTemplate()` generates tier-specific congratulatory email
- [x] `quizRecommendationTemplate()` generates profile-based product links
- [x] Console fallback logs subject and body preview in dev mode

### Marketing Triggers

- [x] `triggerQuizRecommendationEmail()` dispatches scent profile
- [x] `triggerLoyaltyUnlockEmail()` dispatches tier ascension notification

---

## Observability

- [x] AdminLogs dashboard renders 4 summary metric cards with thresholds
- [x] Type-based filter bar (Error/Latency/DB/Security/Info) works correctly
- [x] Severity dots (critical=red, warning=amber, info=blue) display inline
- [x] Web Vitals (CLS/INP/LCP/FCP/TTFB) dispatch to GA4 via `trackEvent`

---

## Architecture

- [x] `graphql.ts` — typed `gqlQuery<T>()` wrapper compiles cleanly
- [x] `ab-testing.ts` — `assignVariant()` deterministic hash produces stable bucketing
- [x] GA4 `experiment_exposure` event wired for tracking
