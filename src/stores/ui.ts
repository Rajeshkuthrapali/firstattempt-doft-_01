import { create } from "zustand";

/** Global UI state (navigation drawer, modals, etc.) */
interface UiState {
  /** Whether the mobile navigation drawer is open */
  navOpen: boolean;
  /** Toggle the mobile navigation drawer */
  toggleNav: () => void;
  /** Explicitly close the navigation drawer */
  closeNav: () => void;

  /** Whether the cart drawer is visible */
  cartOpen: boolean;
  /** Toggle the cart drawer */
  toggleCart: () => void;
  /** Explicitly close the cart drawer */
  closeCart: () => void;
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
}));
