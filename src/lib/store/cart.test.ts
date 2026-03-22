import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/lib/store/cart";
import type { CartItem } from "@/lib/store/cart";

beforeEach(() => { useCartStore.setState({ items: [], isOpen: false }); });

const mockItem: Omit<CartItem, "quantity"> = { productId: "prod-1", variantId: "var-1", title: "Rose Mini Bowl Candle", variantTitle: "Single", price: 22, image: "/img.jpg", slug: "rose-mini-bowl-candle", maxStock: 10 };

describe("Cart Store", () => {
  it("should add item to empty cart", () => { useCartStore.getState().addItem(mockItem); expect(useCartStore.getState().items).toHaveLength(1); expect(useCartStore.getState().items[0]?.quantity).toBe(1); });
  it("should increment quantity for existing item", () => { useCartStore.getState().addItem(mockItem); useCartStore.getState().addItem(mockItem); expect(useCartStore.getState().items[0]?.quantity).toBe(2); });
  it("should remove item", () => { useCartStore.getState().addItem(mockItem); useCartStore.getState().removeItem("var-1"); expect(useCartStore.getState().items).toHaveLength(0); });
  it("should update quantity", () => { useCartStore.getState().addItem(mockItem); useCartStore.getState().updateQuantity("var-1", 5); expect(useCartStore.getState().items[0]?.quantity).toBe(5); });
  it("should clear cart", () => { useCartStore.getState().addItem(mockItem); useCartStore.getState().clearCart(); expect(useCartStore.getState().items).toHaveLength(0); });
  it("should compute totalItems", () => { useCartStore.getState().addItem(mockItem, 3); expect(useCartStore.getState().totalItems()).toBe(3); });
  it("should compute totalPrice", () => { useCartStore.getState().addItem(mockItem, 2); expect(useCartStore.getState().totalPrice()).toBe(44); });
  it("should clamp to maxStock", () => { useCartStore.getState().addItem(mockItem, 999); expect(useCartStore.getState().items[0]?.quantity).toBe(10); });
});
