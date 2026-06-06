import { create } from "zustand";
import { products, type Product } from "../data/products";

/** Single autocomplete suggestion. */
export interface SearchHit {
  product: Product;
  /** Matched field: name, tagline, notes */
  matchedOn: string;
}

interface SearchState {
  query: string;
  hits: SearchHit[];
  isOpen: boolean;

  setQuery: (q: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

/** Naive client-side search over the static product catalogue. */
function searchProducts(q: string): SearchHit[] {
  if (!q.trim()) return [];
  const lower = q.toLowerCase();
  return products
    .filter((p) => p.inStock)
    .flatMap((p) => {
      if (p.name.toLowerCase().includes(lower))
        return [{ product: p, matchedOn: "name" }];
      if (p.tagline.toLowerCase().includes(lower))
        return [{ product: p, matchedOn: "tagline" }];
      if (p.notes.some((n) => n.toLowerCase().includes(lower)))
        return [{ product: p, matchedOn: "notes" }];
      if (p.category.toLowerCase().includes(lower))
        return [{ product: p, matchedOn: "category" }];
      return [];
    })
    .slice(0, 6);
}

/**
 * Zustand search store.
 * Provides autocomplete hits derived from the static products array.
 * In production, replace searchProducts() with a debounced API call.
 */
export const useSearchStore = create<SearchState>()((set) => ({
  query: "",
  hits: [],
  isOpen: false,

  setQuery: (q) =>
    set({ query: q, hits: searchProducts(q), isOpen: q.length > 0 }),
  clear: () => set({ query: "", hits: [], isOpen: false }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
