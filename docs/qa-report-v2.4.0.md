# Post-Deploy QA Report (v2.4.0 / P5)

## Environment

- **Branch:** `p4-sprint` → tagged `v2.4.0`
- **Build:** 340 modules, 4 chunks (vendor 48kB, admin 29kB, cms 13kB, app 294kB)
- **Tests:** `npx vitest run` — **187/187 passing**

---

## GraphQL Optimization

- [x] Response cache returns cached data with `cached: true` flag within TTL window
- [x] `invalidateCache()` clears all entries; `invalidateCachePattern()` targets specific queries
- [x] Cache evicts oldest entries when exceeding `MAX_CACHE_SIZE` (100)
- [x] Persisted queries register hash IDs via `registerPersistedQuery()`
- [x] `DataLoader.load()` batches concurrent calls within the same microtask tick

## A/B Testing Dashboard

- [x] Three experiments render with correct status badges (draft/running/paused/completed)
- [x] Clicking experiment card shows detail panel with goal event and start date
- [x] Traffic allocation bar renders proportionally (e.g. 40/30/30 split)
- [x] Variant labels with weight percentages display correctly
- [x] Conversion results table highlights winner with highest conversion rate
- [x] `trackExposure()` and `trackConversion()` fire GA4 events with correct parameters

## Loyalty Redemption

- [x] Points balance card renders gradient banner with current tier badge
- [x] Reward grid shows 6 items across Bronze/Silver/Gold/Platinum tiers
- [x] Tier-locked rewards show "Locked" state for users below required tier
- [x] Clicking "Redeem" deducts points from balance and shows "Redeemed ✓"
- [x] Insufficient-points state disables Redeem button
- [x] Points-at-checkout explainer displays conversion rate (500 pts = ₹100)

## ML Recommendations

- [x] `collaborativeRecommendations()` ranks products by co-occurrence frequency
- [x] `contentBasedRecommendations()` scores by note overlap with scent profile
- [x] `hybridRecommendations()` combines both with 60/40 weight split
- [x] `inferProfileFromHistory()` returns profile + confidence % from purchase data
- [x] Returns `null` when confidence ≤ 50% (quiz not skippable)

## Bundle Splitting

- [x] Main bundle reduced from 373kB → 294kB (21% reduction)
- [x] Admin chunk (29kB) loads only on `/admin/*` routes
- [x] CMS chunk (13kB) loads only on `/campaign/*` routes
- [x] Vendor chunk (48kB) shared across all routes
