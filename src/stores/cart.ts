import { create } from "zustand";
import type { Product } from "../data/products";

/** A product in the cart with its quantity. */
export interface CartItem {
  product: Product;
  qty: number;
}

interface CartState {
  /** Ordered list of items in the cart */
  items: CartItem[];

  /** Add a product (increments qty if already present) */
  addItem: (product: Product) => void;

  /** Remove one unit; removes line when qty hits 0 */
  removeItem: (productId: string) => void;

  /** Delete the entire line regardless of qty */
  deleteLine: (productId: string) => void;

  /** Empty the whole cart */
  clearCart: () => void;

  /** Total number of units across all lines */
  totalQty: () => number;

  /** Grand total in ₹ (paise-free, prices stored as integers) */
  totalPrice: () => number;
}

/**
 * Zustand cart store.
 * Prices are stored as plain integers (e.g. 2499 = ₹2 499).
 */
export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, { product, qty: 1 }] };
    }),

  removeItem: (productId) =>
    set((state) => {
      const updated = state.items
        .map((i) =>
          i.product.id === productId ? { ...i, qty: i.qty - 1 } : i,
        )
        .filter((i) => i.qty > 0);
      return { items: updated };
    }),

  deleteLine: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  clearCart: () => set({ items: [] }),

  totalQty: () => get().items.reduce((sum, i) => sum + i.qty, 0),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.qty, 0),
}));
