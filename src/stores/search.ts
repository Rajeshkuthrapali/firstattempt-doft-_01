import { create } from "zustand";
import { api } from "../lib/api/client";
import type { ProductSummary, PaginatedResponse } from "../types/catalog";

/** Single autocomplete suggestion. */
export interface SearchHit {
  product: ProductSummary;
  /** Matched field: title, tagline, scentNotes, collection */
  matchedOn: string;
}

interface SearchState {
  query: string;
  hits: SearchHit[];
  isOpen: boolean;
  products: ProductSummary[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
  lastFetched: number | null;

  setQuery: (q: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  fetchProducts: () => Promise<void>;
}

/** Naive client-side search over the fetched product catalogue. */
function searchProducts(q: string, products: ProductSummary[]): SearchHit[] {
  if (!q.trim()) return [];
  const lower = q.toLowerCase();
  return products
    .filter((p) => p.inStock)
    .flatMap((p) => {
      if (p.title.toLowerCase().includes(lower))
        return [{ product: p, matchedOn: "title" }];
      if (p.tagline?.toLowerCase().includes(lower))
        return [{ product: p, matchedOn: "tagline" }];
      if (p.scentNotes.some((n) => n.toLowerCase().includes(lower)))
        return [{ product: p, matchedOn: "scentNotes" }];
      if (p.collectionSlugs.some((s) => s.toLowerCase().includes(lower)))
        return [{ product: p, matchedOn: "collection" }];
      return [];
    })
    .slice(0, 6);
}

/**
 * Zustand search store.
 * Fetches products from the API on first use, then filters locally.
 */
const STALE_MS = 5 * 60 * 1000; // 5 minutes

export const useSearchStore = create<SearchState>()((set, get) => ({
  query: "",
  hits: [],
  isOpen: false,
  products: [],
  loading: false,
  error: null,
  fetched: false,
  lastFetched: null,

  setQuery: (q) => {
    const state = get();
    const hits = state.products.length > 0 ? searchProducts(q, state.products) : [];
    set({ query: q, hits, isOpen: q.length > 0 });
  },

  clear: () => set({ query: "", hits: [], isOpen: false }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  fetchProducts: async () => {
    const { fetched, lastFetched } = get();
    const isFresh = fetched && lastFetched !== null && Date.now() - lastFetched < STALE_MS;
    if (isFresh) return;
    set({ loading: true });
    try {
      const res = await api.get<PaginatedResponse<ProductSummary>>("/api/products?limit=100");
      set({ products: res.data, loading: false, fetched: true, lastFetched: Date.now() });
    } catch {
      set({ loading: false, error: "Failed to load products. Please try again." });
    }
  },
}));
