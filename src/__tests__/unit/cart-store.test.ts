import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "../../stores/cart";
import { products } from "../../../backup/06-mock-data/products";

/** Reset the cart store between tests */
beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

const p1 = products[0]; // Golden Hour
const p2 = products[1]; // Midnight Oud

function itemFor(product: (typeof products)[0]) {
  return {
    productId: product.id,
    variantId: product.id,
    title: product.name,
    variantTitle: "Single",
    price: product.price,
    image: product.image,
    slug: product.slug,
    maxStock: product.inStock ? 100 : 0,
  };
}

describe("Cart Store — addItem", () => {
  it("adds a new product with qty 1", () => {
    useCartStore.getState().addItem(itemFor(p1));
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBe(p1.id);
    expect(items[0].quantity).toBe(1);
  });

  it("increments qty when the same variant is added again", () => {
    useCartStore.getState().addItem(itemFor(p1));
    useCartStore.getState().addItem(itemFor(p1));
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("adds different products as separate lines", () => {
    useCartStore.getState().addItem(itemFor(p1));
    useCartStore.getState().addItem(itemFor(p2));
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(2);
  });
});

describe("Cart Store — removeItem", () => {
  it("removes the entire line", () => {
    useCartStore.getState().addItem(itemFor(p1));
    useCartStore.getState().removeItem(p1.id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("does nothing for a non-existent variant ID", () => {
    useCartStore.getState().addItem(itemFor(p1));
    useCartStore.getState().removeItem("fake-id");
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

describe("Cart Store — updateQuantity", () => {
  it("updates qty for a specific variant", () => {
    useCartStore.getState().addItem(itemFor(p1));
    useCartStore.getState().updateQuantity(p1.id, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });
});

describe("Cart Store — clearCart", () => {
  it("empties all items", () => {
    useCartStore.getState().addItem(itemFor(p1));
    useCartStore.getState().addItem(itemFor(p2));
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe("Cart Store — totalItems", () => {
  it("returns 0 for an empty cart", () => {
    expect(useCartStore.getState().totalItems()).toBe(0);
  });

  it("sums quantities across all lines", () => {
    useCartStore.getState().addItem(itemFor(p1));
    useCartStore.getState().addItem(itemFor(p1));
    useCartStore.getState().addItem(itemFor(p2));
    expect(useCartStore.getState().totalItems()).toBe(3);
  });
});

describe("Cart Store — totalPrice", () => {
  it("returns 0 for an empty cart", () => {
    expect(useCartStore.getState().totalPrice()).toBe(0);
  });

  it("calculates total correctly", () => {
    useCartStore.getState().addItem(itemFor(p1)); // ₹2,499
    useCartStore.getState().addItem(itemFor(p1)); // ₹2,499 × 2
    useCartStore.getState().addItem(itemFor(p2)); // ₹3,499
    expect(useCartStore.getState().totalPrice()).toBe(2499 * 2 + 3499);
  });
});
