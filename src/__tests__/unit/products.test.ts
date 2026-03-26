import { describe, it, expect } from "vitest";
import { products, getProductBySlug, type Product } from "../../data/products";

describe("products data", () => {
  it("exports a non-empty product array", () => {
    expect(products).toBeDefined();
    expect(products.length).toBeGreaterThan(0);
  });

  it("every product satisfies the Product interface shape", () => {
    products.forEach((p: Product) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.tagline).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(typeof p.price).toBe("number");
      expect(p.price).toBeGreaterThan(0);
      expect(p.slug).toBeTruthy();
      expect(["signature", "seasonal", "limited"]).toContain(p.category);
      expect(p.image).toBeTruthy();
      expect(Array.isArray(p.notes)).toBe(true);
      expect(p.notes.length).toBeGreaterThan(0);
      expect(typeof p.burnTime).toBe("number");
      expect(typeof p.weight).toBe("number");
      expect(typeof p.inStock).toBe("boolean");
    });
  });

  it("all slugs are unique", () => {
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("all IDs are unique", () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getProductBySlug", () => {
  it("returns the correct product for a valid slug", () => {
    const product = getProductBySlug("golden-hour");
    expect(product).toBeDefined();
    expect(product!.name).toBe("Golden Hour");
    expect(product!.id).toBe("lum-001");
  });

  it("returns undefined for an invalid slug", () => {
    expect(getProductBySlug("does-not-exist")).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(getProductBySlug("")).toBeUndefined();
  });

  it("finds every product by its slug", () => {
    products.forEach((p) => {
      const found = getProductBySlug(p.slug);
      expect(found).toBeDefined();
      expect(found!.id).toBe(p.id);
    });
  });
});
