import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "../../stores/ui";

beforeEach(() => {
  useUiStore.setState({ navOpen: false, cartOpen: false });
});

describe("UI Store — nav", () => {
  it("starts with navOpen = false", () => {
    expect(useUiStore.getState().navOpen).toBe(false);
  });

  it("toggleNav flips navOpen", () => {
    useUiStore.getState().toggleNav();
    expect(useUiStore.getState().navOpen).toBe(true);
    useUiStore.getState().toggleNav();
    expect(useUiStore.getState().navOpen).toBe(false);
  });

  it("closeNav sets navOpen to false", () => {
    useUiStore.getState().toggleNav(); // open
    useUiStore.getState().closeNav();
    expect(useUiStore.getState().navOpen).toBe(false);
  });
});

describe("UI Store — cart", () => {
  it("starts with cartOpen = false", () => {
    expect(useUiStore.getState().cartOpen).toBe(false);
  });

  it("toggleCart flips cartOpen", () => {
    useUiStore.getState().toggleCart();
    expect(useUiStore.getState().cartOpen).toBe(true);
    useUiStore.getState().toggleCart();
    expect(useUiStore.getState().cartOpen).toBe(false);
  });

  it("closeCart sets cartOpen to false", () => {
    useUiStore.getState().toggleCart(); // open
    useUiStore.getState().closeCart();
    expect(useUiStore.getState().cartOpen).toBe(false);
  });
});
