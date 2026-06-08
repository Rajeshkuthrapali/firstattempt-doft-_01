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

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface SingleResponse<T> {
  success: true;
  data: T;
}
