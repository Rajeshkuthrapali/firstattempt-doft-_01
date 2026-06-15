import { describe, it, expect } from "vitest";
import {
  productJsonLd,
  breadcrumbJsonLd,
  organizationJsonLd,
  collectionJsonLd,
} from "@/lib/seo/json-ld";

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  scentFamily: string;
  images: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Variant {
  id: string;
  productId: string;
  sku: string;
  title: string;
  price: number;
  stock: number;
}

const mockProduct: Product = {
  id: "prod-1",
  title: "Rose Mini Bowl Candle",
  slug: "rose-mini-bowl-candle",
  description: "A delicate mini bowl candle infused with English Rose.",
  scentFamily: "Floral & Aromatic",
  images: JSON.stringify([
    "https://images.unsplash.com/photo-1.jpg",
    "https://images.unsplash.com/photo-2.jpg",
  ]),
  status: "active",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-02-01"),
};

const mockVariants: Variant[] = [
  {
    id: "var-1",
    productId: "prod-1",
    sku: "ROSE-MINI-001",
    title: "Single",
    price: 22.0,
    stock: 80,
  },
  {
    id: "var-2",
    productId: "prod-1",
    sku: "ROSE-MINI-SET",
    title: "Set of 3",
    price: 58.0,
    stock: 20,
  },
];

describe("JSON-LD Structured Data", () => {
  describe("productJsonLd", () => {
    it("should generate valid Product schema", () => {
      const ld = productJsonLd(mockProduct, mockVariants);
      expect(ld["@context"]).toBe("https://schema.org");
      expect(ld["@type"]).toBe("Product");
      expect(ld.name).toBe("Rose Mini Bowl Candle");
      expect(ld.brand).toEqual({ "@type": "Brand", name: "Lumière" });
    });

    it("should use AggregateOffer for multiple variants", () => {
      const ld = productJsonLd(mockProduct, mockVariants);
      const offers = ld.offers as Record<string, unknown>;
      expect(offers["@type"]).toBe("AggregateOffer");
      expect(offers.lowPrice).toBe("22.00");
      expect(offers.highPrice).toBe("58.00");
      expect(offers.offerCount).toBe(2);
    });

    it("should use Offer for single variant", () => {
      const ld = productJsonLd(mockProduct, [mockVariants[0]!]);
      const offers = ld.offers as Record<string, unknown>;
      expect(offers["@type"]).toBe("Offer");
      expect(offers.price).toBe("22.00");
    });

    it("should show InStock when variants have stock", () => {
      const ld = productJsonLd(mockProduct, mockVariants);
      const offers = ld.offers as Record<string, unknown>;
      expect(offers.availability).toBe("https://schema.org/InStock");
    });

    it("should show OutOfStock when no stock", () => {
      const zeroStock = mockVariants.map((v) => ({ ...v, stock: 0 }));
      const ld = productJsonLd(mockProduct, zeroStock);
      const offers = ld.offers as Record<string, unknown>;
      expect(offers.availability).toBe("https://schema.org/OutOfStock");
    });
  });

  describe("breadcrumbJsonLd", () => {
    it("should generate valid BreadcrumbList", () => {
      const ld = breadcrumbJsonLd([
        { name: "Home", url: "https://doftcandles.com" },
        { name: "Products", url: "https://doftcandles.com/collections/all" },
      ]);
      expect(ld["@type"]).toBe("BreadcrumbList");
      const items = ld.itemListElement as { position: number }[];
      expect(items).toHaveLength(2);
      expect(items[0]!.position).toBe(1);
      expect(items[1]!.position).toBe(2);
    });
  });

  describe("organizationJsonLd", () => {
    it("should generate valid Organization schema", () => {
      const ld = organizationJsonLd();
      expect(ld["@type"]).toBe("Organization");
      expect(ld.name).toBe("Lumière");
      expect(ld.contactPoint).toBeDefined();
    });
  });

  describe("collectionJsonLd", () => {
    it("should generate valid CollectionPage schema", () => {
      const ld = collectionJsonLd("Bestsellers", "bestsellers", "Top picks", 8);
      expect(ld["@type"]).toBe("CollectionPage");
      expect(ld.name).toBe("Bestsellers");
      expect(ld.numberOfItems).toBe(8);
    });
  });
});
