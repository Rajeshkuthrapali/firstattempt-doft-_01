/**
 * GraphQL Optimized Layer (P5)
 *
 * Production-ready query client with:
 * - Response caching (in-memory LRU with TTL)
 * - Persisted queries (hash-based lookup)
 * - DataLoader-style batching
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface GqlProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  notes: string[];
}

export interface GqlOrder {
  id: string;
  email: string;
  status: string;
  total: number;
  createdAt: string;
  itemCount: number;
}

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

// ── Response Cache ───────────────────────────────────────────────────────────

const DEFAULT_TTL_MS = 60_000; // 1 minute
const MAX_CACHE_SIZE = 100;
const cache = new Map<string, CacheEntry<unknown>>();

function cacheKey(query: string, variables?: Record<string, unknown>): string {
  return `${query}::${JSON.stringify(variables ?? {})}`;
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  // Evict oldest entries if at capacity
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

/** Invalidates all cached entries (e.g. after a CMS webhook). */
export function invalidateCache(): void {
  cache.clear();
  console.log("[GraphQL] Cache invalidated");
}

/** Invalidates entries matching a query pattern. */
export function invalidateCachePattern(querySubstring: string): void {
  for (const key of cache.keys()) {
    if (key.includes(querySubstring)) cache.delete(key);
  }
}

// ── Persisted Queries ────────────────────────────────────────────────────────

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

const persistedQueryMap = new Map<string, string>();

/**
 * Registers a query for persisted execution.
 * Returns the hash ID used to reference it.
 */
export function registerPersistedQuery(queryString: string): string {
  const id = simpleHash(queryString);
  persistedQueryMap.set(id, queryString);
  return id;
}

// ── DataLoader Batching ──────────────────────────────────────────────────────

type BatchFn<K, V> = (keys: K[]) => Promise<Map<K, V>>;

/**
 * Minimal DataLoader implementation for N+1 query elimination.
 * Batches individual `.load(key)` calls within the same tick.
 */
export class DataLoader<K, V> {
  private batch: K[] = [];
  private resolvers = new Map<K, { resolve: (v: V | undefined) => void }>();
  private scheduled = false;

  constructor(private batchFn: BatchFn<K, V>) {}

  load(key: K): Promise<V | undefined> {
    return new Promise((resolve) => {
      this.batch.push(key);
      this.resolvers.set(key, { resolve });
      if (!this.scheduled) {
        this.scheduled = true;
        queueMicrotask(() => this.dispatch());
      }
    });
  }

  private async dispatch() {
    const keys = [...this.batch];
    const pending = new Map(this.resolvers);
    this.batch = [];
    this.resolvers.clear();
    this.scheduled = false;

    try {
      const results = await this.batchFn(keys);
      for (const [key, { resolve }] of pending) {
        resolve(results.get(key));
      }
    } catch {
      for (const { resolve } of pending.values()) {
        resolve(undefined);
      }
    }
  }
}

// ── Query Client ─────────────────────────────────────────────────────────────

interface QueryOptions {
  /** Cache TTL in milliseconds. Set to 0 to skip cache. */
  ttl?: number;
  /** Use persisted query hash instead of full query string. */
  persisted?: boolean;
}

/**
 * Executes a GraphQL query with optional response caching and persisted query support.
 */
export async function gqlQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
  options: QueryOptions = {},
): Promise<{ data: T | null; errors?: string[]; cached?: boolean }> {
  const { ttl = DEFAULT_TTL_MS, persisted = false } = options;

  // Check cache first
  if (ttl > 0) {
    const key = cacheKey(query, variables);
    const hit = getCached<{ data: T }>(key);
    if (hit) {
      return { data: hit.data, cached: true };
    }
  }

  // Build request body
  const body: Record<string, unknown> = { variables };
  if (persisted) {
    const hash = simpleHash(query);
    body.extensions = { persistedQuery: { version: 1, sha256Hash: hash } };
  } else {
    body.query = query;
  }

  try {
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { data: null, errors: [`HTTP ${res.status}`] };
    }
    const result = await res.json();

    // Cache successful responses
    if (ttl > 0 && result.data && !result.errors?.length) {
      setCache(cacheKey(query, variables), result, ttl);
    }

    return result;
  } catch (err) {
    console.error("[GraphQL] Query failed:", err);
    return { data: null, errors: ["Network error"] };
  }
}

// ── Predefined Queries ───────────────────────────────────────────────────────

export const QUERIES = {
  GET_PRODUCTS: `
    query GetProducts($category: String, $limit: Int) {
      products(category: $category, limit: $limit) {
        id title slug price category image inStock notes
      }
    }
  `,
  GET_ORDERS: `
    query GetOrders($status: String, $limit: Int) {
      orders(status: $status, limit: $limit) {
        id email status total createdAt itemCount
      }
    }
  `,
  GET_RECOMMENDATIONS: `
    query GetRecommendations($scentProfile: String!) {
      recommendations(scentProfile: $scentProfile) {
        id title slug price image notes
      }
    }
  `,
} as const;

// Register all predefined queries for persisted use
Object.values(QUERIES).forEach(registerPersistedQuery);
