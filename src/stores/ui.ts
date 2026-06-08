import { create } from "zustand";
import type { ProductSummary } from "../types/catalog";

/** Global UI state (navigation drawer, modals, search overlay, etc.) */
interface UiState {
  /** Whether the mobile navigation drawer is open */
  navOpen: boolean;
  toggleNav: () => void;
  closeNav: () => void;

  /** Whether the cart drawer is visible */
  cartOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;

  /** Whether the search overlay is open */
  searchOpen: boolean;
  toggleSearch: () => void;
  closeSearch: () => void;

  /** Quick-view modal — stores the product being previewed, or null when closed */
  quickViewProduct: ProductSummary | null;
  openQuickView: (product: ProductSummary) => void;
  closeQuickView: () => void;
}

/**
 * Zustand store that manages transient UI state
 * shared across layout components.
 */
export const useUiStore = create<UiState>((set) => ({
  navOpen: false,
  toggleNav: () => set((s) => ({ navOpen: !s.navOpen })),
  closeNav: () => set({ navOpen: false }),

  cartOpen: false,
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  closeCart: () => set({ cartOpen: false }),

  searchOpen: false,
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  closeSearch: () => set({ searchOpen: false }),

  quickViewProduct: null,
  openQuickView: (product) => set({ quickViewProduct: product }),
  closeQuickView: () => set({ quickViewProduct: null }),
}));
