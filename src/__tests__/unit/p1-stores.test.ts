import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../../stores/auth";
import { useWishlistStore } from "../../stores/wishlist";
import { useSearchStore } from "../../stores/search";
import { useCheckoutStore } from "../../stores/checkout";
import { products } from "../../data/products";

// ── Auth Store ─────────────────────────────────────────────────────────────

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      addresses: [],
      orders: [],
      isLoading: false,
      error: null,
    });
  });

  it("starts with no user", () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("saveAddress appends an address with generated id", () => {
    useAuthStore.getState().saveAddress({
      label: "Home",
      name: "Priya",
      line1: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "IN",
      phone: "+919876543210",
      isDefault: true,
    });
    const { addresses } = useAuthStore.getState();
    expect(addresses).toHaveLength(1);
    expect(addresses[0].id).toBeDefined();
    expect(addresses[0].isDefault).toBe(true);
  });

  it("setDefaultAddress marks exactly one address as default", () => {
    const store = useAuthStore.getState();
    store.saveAddress({
      label: "Home",
      name: "A",
      line1: "1",
      city: "X",
      state: "Y",
      postalCode: "Z",
      country: "IN",
      phone: "0",
      isDefault: false,
    });
    store.saveAddress({
      label: "Work",
      name: "B",
      line1: "2",
      city: "X",
      state: "Y",
      postalCode: "Z",
      country: "IN",
      phone: "0",
      isDefault: false,
    });
    const { addresses } = useAuthStore.getState();
    useAuthStore.getState().setDefaultAddress(addresses[1].id);
    const updated = useAuthStore.getState().addresses;
    expect(updated.filter((a) => a.isDefault)).toHaveLength(1);
    expect(updated[1].isDefault).toBe(true);
  });

  it("removeAddress deletes the address by id", () => {
    const store = useAuthStore.getState();
    store.saveAddress({
      label: "Home",
      name: "A",
      line1: "1",
      city: "X",
      state: "Y",
      postalCode: "Z",
      country: "IN",
      phone: "0",
      isDefault: false,
    });
    const { addresses } = useAuthStore.getState();
    useAuthStore.getState().removeAddress(addresses[0].id);
    expect(useAuthStore.getState().addresses).toHaveLength(0);
  });

  it("addOrder prepends to order history", () => {
    useAuthStore
      .getState()
      .addOrder({
        id: "ord-001",
        date: "2026-03-23",
        total: 2499,
        status: "confirmed",
        items: [],
      });
    useAuthStore
      .getState()
      .addOrder({
        id: "ord-002",
        date: "2026-03-24",
        total: 3499,
        status: "shipped",
        items: [],
      });
    const { orders } = useAuthStore.getState();
    expect(orders[0].id).toBe("ord-002"); // newest first
    expect(orders).toHaveLength(2);
  });

  it("logout clears user, orders, and addresses", () => {
    useAuthStore.setState({
      user: { id: "u1", email: "a@b.com", name: "A", provider: "email" },
      addresses: [
        {
          id: "x",
          label: "L",
          name: "N",
          line1: "1",
          city: "C",
          state: "S",
          postalCode: "Z",
          country: "IN",
          phone: "0",
          isDefault: false,
        },
      ],
      orders: [
        {
          id: "o1",
          date: "2026-01-01",
          total: 999,
          status: "delivered",
          items: [],
        },
      ],
    });
    useAuthStore.getState().logout();
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.addresses).toHaveLength(0);
    expect(s.orders).toHaveLength(0);
  });
});

// ── Wishlist Store ──────────────────────────────────────────────────────────

describe("useWishlistStore", () => {
  beforeEach(() => useWishlistStore.setState({ ids: [] }));

  const p = products[0];

  it("toggle adds a product", () => {
    const result = useWishlistStore.getState().toggle(p);
    expect(result).toBe("added");
    expect(useWishlistStore.getState().ids).toContain(p.id);
  });

  it("toggle removes a product already in wishlist", () => {
    useWishlistStore.setState({ ids: [p.id] });
    const result = useWishlistStore.getState().toggle(p);
    expect(result).toBe("removed");
    expect(useWishlistStore.getState().ids).not.toContain(p.id);
  });

  it("has() returns correct boolean", () => {
    useWishlistStore.setState({ ids: [p.id] });
    expect(useWishlistStore.getState().has(p.id)).toBe(true);
    expect(useWishlistStore.getState().has("nonexistent")).toBe(false);
  });

  it("clear() empties the wishlist", () => {
    useWishlistStore.setState({ ids: [p.id] });
    useWishlistStore.getState().clear();
    expect(useWishlistStore.getState().ids).toHaveLength(0);
  });
});

// ── Search Store ────────────────────────────────────────────────────────────

describe("useSearchStore", () => {
  beforeEach(() =>
    useSearchStore.setState({ query: "", hits: [], isOpen: false }),
  );

  it("setQuery with empty string returns no hits", () => {
    useSearchStore.getState().setQuery("");
    expect(useSearchStore.getState().hits).toHaveLength(0);
    expect(useSearchStore.getState().isOpen).toBe(false);
  });

  it("setQuery with 'amber' returns at least one hit", () => {
    useSearchStore.getState().setQuery("amber");
    expect(useSearchStore.getState().hits.length).toBeGreaterThan(0);
    expect(useSearchStore.getState().isOpen).toBe(true);
  });

  it("setQuery with 'golden' matches by name", () => {
    useSearchStore.getState().setQuery("golden");
    const hit = useSearchStore.getState().hits[0];
    expect(hit.product.name).toBe("Golden Hour");
    expect(hit.matchedOn).toBe("name");
  });

  it("clear() resets state", () => {
    useSearchStore.getState().setQuery("oud");
    useSearchStore.getState().clear();
    const s = useSearchStore.getState();
    expect(s.query).toBe("");
    expect(s.hits).toHaveLength(0);
    expect(s.isOpen).toBe(false);
  });

  it("returns at most 6 hits", () => {
    useSearchStore.getState().setQuery("a"); // broad match
    expect(useSearchStore.getState().hits.length).toBeLessThanOrEqual(6);
  });
});

// ── Checkout Store ──────────────────────────────────────────────────────────

describe("useCheckoutStore", () => {
  beforeEach(() =>
    useCheckoutStore.setState({
      gift: { enabled: false, message: "", wrapping: "none" },
      lastAbandonmentWarning: null,
      showRecoveryBanner: false,
    }),
  );

  it("setGift merges partial update", () => {
    useCheckoutStore.getState().setGift({ enabled: true, wrapping: "premium" });
    const { gift } = useCheckoutStore.getState();
    expect(gift.enabled).toBe(true);
    expect(gift.wrapping).toBe("premium");
    expect(gift.message).toBe(""); // untouched
  });

  it("resetGift restores defaults", () => {
    useCheckoutStore
      .getState()
      .setGift({ enabled: true, wrapping: "premium", message: "Hello!" });
    useCheckoutStore.getState().resetGift();
    const { gift } = useCheckoutStore.getState();
    expect(gift.enabled).toBe(false);
    expect(gift.wrapping).toBe("none");
    expect(gift.message).toBe("");
  });

  it("checkAbandonedCart hides banner when cart is empty", () => {
    useCheckoutStore.setState({ showRecoveryBanner: true });
    useCheckoutStore.getState().checkAbandonedCart(true);
    expect(useCheckoutStore.getState().showRecoveryBanner).toBe(false);
  });

  it("checkAbandonedCart shows banner after abandonment threshold", () => {
    // Simulate last warning was > 30 min ago
    useCheckoutStore.setState({
      lastAbandonmentWarning: Date.now() - 31 * 60 * 1000,
    });
    useCheckoutStore.getState().checkAbandonedCart(false);
    expect(useCheckoutStore.getState().showRecoveryBanner).toBe(true);
  });

  it("dismissRecoveryBanner hides the banner", () => {
    useCheckoutStore.setState({ showRecoveryBanner: true });
    useCheckoutStore.getState().dismissRecoveryBanner();
    expect(useCheckoutStore.getState().showRecoveryBanner).toBe(false);
  });
});
