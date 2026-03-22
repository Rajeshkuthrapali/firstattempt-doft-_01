import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GiftOptions {
  enabled: boolean;
  message: string; // max 200 chars
  wrapping: "standard" | "premium" | "none";
}

interface CheckoutState {
  /** Gift wrapping options. */
  gift: GiftOptions;

  /** Timestamp (ms) of the last cart-abandonment warning shown. */
  lastAbandonmentWarning: number | null;

  /** Whether the recovery banner is visible. */
  showRecoveryBanner: boolean;

  setGift: (opts: Partial<GiftOptions>) => void;
  resetGift: () => void;
  markAbandonmentWarning: () => void;
  dismissRecoveryBanner: () => void;
  /** Call on page focus / return visit to decide if banner should show. */
  checkAbandonedCart: (cartIsEmpty: boolean) => void;
}

const DEFAULT_GIFT: GiftOptions = { enabled: false, message: "", wrapping: "none" };

/** Time after which an unfinished cart is considered "abandoned" (30 min). */
const ABANDONMENT_THRESHOLD_MS = 30 * 60 * 1000;

/**
 * Zustand checkout enhancement store.
 * Handles gift-wrapping options and abandoned-cart recovery state.
 */
export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      gift: { ...DEFAULT_GIFT },
      lastAbandonmentWarning: null,
      showRecoveryBanner: false,

      setGift: (opts) =>
        set((s) => ({ gift: { ...s.gift, ...opts } })),

      resetGift: () => set({ gift: { ...DEFAULT_GIFT } }),

      markAbandonmentWarning: () =>
        set({ lastAbandonmentWarning: Date.now(), showRecoveryBanner: false }),

      dismissRecoveryBanner: () => set({ showRecoveryBanner: false }),

      checkAbandonedCart: (cartIsEmpty) => {
        if (cartIsEmpty) { set({ showRecoveryBanner: false }); return; }
        const { lastAbandonmentWarning } = get();
        const elapsed = lastAbandonmentWarning
          ? Date.now() - lastAbandonmentWarning
          : Infinity;
        if (elapsed > ABANDONMENT_THRESHOLD_MS) {
          set({ showRecoveryBanner: true });
        }
      },
    }),
    { name: "lumiere-checkout" },
  ),
);
