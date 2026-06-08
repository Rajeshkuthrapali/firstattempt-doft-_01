import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSummary } from "../types/catalog";

interface WishlistState {
  ids: string[]; // product IDs
  /** Toggle: adds if absent, removes if present. Returns new state. */
  toggle: (product: ProductSummary) => "added" | "removed";
  has: (id: string) => boolean;
  clear: () => void;
}

/**
 * Zustand wishlist store — persisted to localStorage.
 * Stores only product IDs; hydrate with the products array when rendering.
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (product) => {
        const exists = get().ids.includes(product.id);
        set((s) => ({
          ids: exists
            ? s.ids.filter((id) => id !== product.id)
            : [...s.ids, product.id],
        }));
        return exists ? "removed" : "added";
      },

      has: (id) => get().ids.includes(id),

      clear: () => set({ ids: [] }),
    }),
    { name: "lumiere-wishlist" },
  ),
);
