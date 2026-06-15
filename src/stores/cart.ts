import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useToastStore } from "./toast";

export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  price: number;
  image: string;
  slug: string;
  quantity: number;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + quantity, i.maxStock),
                    }
                  : i,
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, item.maxStock) },
            ],
            isOpen: true,
          };
        });
        // Show toast notification
        setTimeout(() => {
          useToastStore.getState().addToast({
            type: "success",
            title: "Added to cart",
            description: item.title,
          });
        }, 0);
      },

      removeItem: (variantId) => {
        const removedItem = get().items.find((i) => i.variantId === variantId);
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
        if (removedItem) {
          setTimeout(() => {
            useToastStore.getState().addToast({
              type: "info",
              title: "Removed",
              description: removedItem.title,
              action: {
                label: "Undo",
                onClick: () => {
                  get().addItem(removedItem);
                },
              },
            });
          }, 0);
        }
      },

      updateQuantity: (variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.variantId !== variantId),
            };
          }
          return {
            items: state.items.map((i) =>
              i.variantId === variantId
                ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                : i,
            ),
          };
        }),

      clearCart: () => {
        set({ items: [] });
        setTimeout(() => {
          useToastStore.getState().addToast({
            type: "info",
            title: "Cart cleared",
          });
        }, 0);
      },
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "doft-cart", partialize: (state) => ({ items: state.items }) },
  ),
);
