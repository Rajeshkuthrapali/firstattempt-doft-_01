import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "../../stores/cart";
import { products } from "../../data/products";

/** Reset the cart store between tests */
beforeEach(() => {
  useCartStore.setState({ items: [] });
});

const goldenHour = products[0]; // Golden Hour
const midnightOud = products[1]; // Midnight Oud

describe("Cart Store — addItem", () => {
  it("adds a new product with qty 1", () => {
    useCartStore.getState().addItem(goldenHour);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe(goldenHour.id);
    expect(items[0].qty).toBe(1);
  });

  it("increments qty when the same product is added again", () => {
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().addItem(goldenHour);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(2);
  });

  it("adds different products as separate lines", () => {
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().addItem(midnightOud);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(2);
  });
});

describe("Cart Store — removeItem", () => {
  it("decrements qty by one", () => {
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().removeItem(goldenHour.id);
    expect(useCartStore.getState().items[0].qty).toBe(1);
  });

  it("removes the line when qty hits zero", () => {
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().removeItem(goldenHour.id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("does nothing for a non-existent product ID", () => {
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().removeItem("fake-id");
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

describe("Cart Store — deleteLine", () => {
  it("removes the entire line regardless of qty", () => {
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().deleteLine(goldenHour.id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("only removes the specified product line", () => {
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().addItem(midnightOud);
    useCartStore.getState().deleteLine(goldenHour.id);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe(midnightOud.id);
  });
});

describe("Cart Store — clearCart", () => {
  it("empties all items", () => {
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().addItem(midnightOud);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe("Cart Store — totalQty", () => {
  it("returns 0 for an empty cart", () => {
    expect(useCartStore.getState().totalQty()).toBe(0);
  });

  it("sums quantities across all lines", () => {
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().addItem(goldenHour);
    useCartStore.getState().addItem(midnightOud);
    expect(useCartStore.getState().totalQty()).toBe(3);
  });
});

describe("Cart Store — totalPrice", () => {
  it("returns 0 for an empty cart", () => {
    expect(useCartStore.getState().totalPrice()).toBe(0);
  });

  it("calculates total correctly", () => {
    useCartStore.getState().addItem(goldenHour); // ₹2,499
    useCartStore.getState().addItem(goldenHour); // ₹2,499 × 2
    useCartStore.getState().addItem(midnightOud); // ₹3,499
    expect(useCartStore.getState().totalPrice()).toBe(2499 * 2 + 3499);
  });
});
