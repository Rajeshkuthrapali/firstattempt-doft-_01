## Context

The Lumiere project started as an aspirational multi-platform prototype with dual frameworks (Next.js + Vite), mock data, stub services, and aspirational features. The Phase 0 cleanup removed the Next.js baggage and dead configs. The `production-ready-overhaul` added real auth, payment integrations, security middleware, and a proper server architecture.

However, the cleanup was incomplete:
- 24 stub files remain in `src/lib/` — empty shells for removed systems
- Stores are split across two directories with no ownership rule
- Frontend imports mock data because no catalog API exists
- Error handling is inconsistent across endpoints
- The Checkout page is 367 lines — a violation of single-responsibility
- Tests are scattered with no consistent pattern
- The API client lacks CSRF and refresh-token interception

The project is at a point where the foundation is solid enough to standardize every layer. This design covers the structural and architectural changes needed, excluding catalog content (which the user will handle separately).

### Current Structure
```
src/
├── __tests__/          ← scattered test files
├── components/         ← 18 component directories (some dead: SocialFeed, SupportWidget, ScentMatchQuiz)
├── data/               ← mock data (products.ts, posts.ts) — should be API-backed
├── lib/
│   ├── api/            ← client.ts (keepers)
│   ├── store/          ← auth.ts, cart.ts (should merge into src/stores/)
│   ├── seo/            ← json-ld.ts (keeper)
│   └── 18 other files  ← most are stubs to delete
├── pages/              ← some fat, some thin — inconsistent patterns
├── stores/             ← 5 Zustand stores (should be canonical)
└── design/             ← brand assets
```

## Goals / Non-Goals

**Goals:**
- Remove all stub/dead code from `src/lib/` (delete 20+ files)
- Consolidate to a single store directory (`src/stores/`)
- Standardize frontend data fetching pattern (API hooks)
- Standardize API response envelope across all endpoints (`{ success, data, meta, error }`)
- Standardize error handling (domain error classes everywhere)
- Add catalog API (GET /api/products, GET /api/products/:slug, GET /api/products/search)
- Split Checkout page into focused components
- Standardize test structure
- Add CSRF token handling to frontend API client
- Add refresh token interception to API client
- Add per-route rate limiting
- Fresh Prisma migration reset
- Verify all security middleware applies correctly

**Non-Goals:**
- Product catalog content (user will populate catalog separately)
- Admin CRUD endpoints (deferred)
- Cart server-side sync (Zustand + localStorage acceptable for MVP)
- Multiple variants per product (single variant for MVP)
- Chakra UI integration (shadcn/ui + Tailwind CSS v4 is already the standard — lighter, faster, no runtime CSS-in-JS)
- GraphQL migration
- CMS integration

## Decisions

### Decision 1: shadcn/ui + Tailwind CSS v4 over Chakra UI

**Chosen:** shadcn/ui + Tailwind CSS v4 (keep existing stack)

**Why:**
- Already installed and working across all components
- Tailwind CSS v4 has zero runtime, smaller bundles, and better DX
- shadcn provides copy-paste primitives (Button, Dialog, Input, etc.) without a heavy dependency
- Chakra UI would require replacing every existing component, rewriting all styling, and adding ~150KB of runtime CSS-in-JS
- The project already has 15+ components built with Tailwind — Chakra would be a full rewrite of the UI layer
- Both Chakra and shadcn serve the same purpose: accessible, composable UI primitives

**Trade-off:** Chakra has more built-in component behaviors (auto-import of hooks, built-in form validation). But the project already uses Zod for validation, making shadcn's lighter approach a better fit.

### Decision 2: Single store directory at `src/stores/`

**Chosen:** Move `src/lib/store/auth.ts` → `src/stores/auth-lib.ts` (or merge into `stores/auth.ts`), move `src/lib/store/cart.ts` → `src/stores/cart.ts`. Delete `src/lib/store/` directory.

**Why:**
- Two store directories with no ownership rule leads to confusion (auth appeared in both)
- One canonical import path: `import { useXStore } from "../stores/x"`
- Simpler mental model — all global state lives in one place

### Decision 3: API response envelope

**Chosen:** All endpoints return `{ success: boolean, data?: T, meta?: {}, error?: string }`

**Pattern:**
```typescript
// Success
{ success: true, data: { ... }, meta: { page, limit, total } }

// Error
{ success: false, error: "Product not found" }
```

**Why:**
- Consistent client-side parsing: always check `res.success`
- The auth endpoints already use this pattern
- Simple, predictable, no ambiguity

### Decision 4: Frontend data fetching pattern

**Chosen:** Custom `useApi` hook pattern wrapping the API client, with loading/error states

**Pattern:**
```typescript
function useApi<T>(fetcher: () => Promise<T>, deps: any[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setLoading(true);
    fetcher()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, deps);
  
  return { data, loading, error };
}

// Usage
const { data: products, loading } = useApi(
  () => api.get<ProductSummary[]>("/api/products"),
  []
);
```

**Why:**
- No additional dependencies (react-query not yet needed for this scale)
- Consistent pattern across all pages
- Easy to extract into a shared hook
- Can be upgraded to react-query or SWR later without changing component logic

### Decision 5: Standardized Express error handling

**Chosen:** Domain error classes with HTTP status codes, caught by centralized error handler

**Pattern (already established by OrderError):**
```typescript
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "DomainError";
  }
}

// Controller catches:
try { ... }
catch (err) {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }
  next(err); // passes to centralized error handler
}
```

**Why:**
- Consistent HTTP status codes per error type
- Clear separation between domain errors (expected) and system errors (unexpected)
- Already partially implemented — just needs to be made universal

### Decision 6: Test structure

**Chosen:**
```
server/tests/
  unit/       ← isolated service/middleware tests
  integration/ ← API endpoint tests with supertest
  fixtures/   ← shared test data

src/__tests__/
  unit/       ← component/store tests
  integration/ ← page-level tests with MSW
```

**Why:**
- Clear separation: unit tests are fast and isolated, integration tests verify real behavior
- Co-located with the code they test (server tests in server/, client tests in src/)
- Standard pattern used by most production codebases

## Risks / Trade-offs

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Deleting stub files breaks imports in components that still reference them | Medium | Audit all imports before deletion. Use `grep -r "from.*lib/(sentry\|sanity\|graphql\|...)" src/` to find active references |
| Consolidating stores breaks running app | Low | Both auth stores exist in parallel temporarily. Migrate import paths one at a time, verify after each |
| API envelope change breaks existing frontend API calls | Low | Only auth uses the API currently, and it already uses the new envelope pattern |
| Removing `src/data/products.ts` breaks pages that haven't been migrated yet | High | This is the last step — only delete after ALL pages have been migrated to catalog API |
| Catalog API without real product content | Low | Acceptable — return seeded test products until user provides catalog content |

## Migration Plan

```
Phase 1: Clean up stubs and consolidate structure
  → Delete 20+ stub files from src/lib/
  → Consolidate stores to src/stores/
  → Standardize component directory structure

Phase 2: Standardize backend patterns
  → Create DomainError base class
  → Update all controllers to use consistent envelope
  → Add Zod validation to all endpoints
  → Add per-route rate limiting

Phase 3: Build catalog API
  → Create product types
  → Create catalog service/controller/routes
  → Register in server

Phase 4: Frontend standardization
  → Add CSRF token handling to API client
  → Add refresh token interception
  → Create useApi hook
  → Migrate pages to API calls
  → Split Checkout page

Phase 5: Database and security verification
  → Fresh Prisma migration reset
  → Verify all indexes
  → Verify security middleware coverage
  → Verify webhook raw body parsing

Phase 6: Remove dead code
  → Delete src/data/products.ts
  → Delete src/data/ directory
  → Final build verification
```
