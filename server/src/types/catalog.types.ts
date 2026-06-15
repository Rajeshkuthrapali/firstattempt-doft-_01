import { z } from "zod";

// ── Query param schemas ───────────────────────────────────────────────

export const GetProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  collection: z.string().optional(),
  fragranceFamily: z.string().optional(),
});

export const SearchProductsSchema = z.object({
  q: z.string().min(2, "Search query must be at least 2 characters"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type GetProductsParams = z.infer<typeof GetProductsSchema>;
export type SearchProductsParams = z.infer<typeof SearchProductsSchema>;

// ── Response shapes ───────────────────────────────────────────────────

export interface VariantInfo {
  id: string;
  sku: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  stock: number;
  size: string | null;
  color: string | null;
  fragrance: string | null;
}

export interface ProductSummary {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  image: string;
  inStock: boolean;
  fragranceFamily: string | null;
  scentNotes: string[];
  giftEligible: boolean;
  collectionSlugs: string[];
}

export interface ProductDetail extends ProductSummary {
  description: string;
  images: string[];
  burnTime: number | null;
  weight: number | null;
  hsnCode: string | null;
  waxType: string | null;
  ingredients: string | null;
  variants: VariantInfo[];
  collections: Array<{ id: string; title: string; slug: string }>;
  relatedProducts: ProductSummary[];
}
