import { prisma } from "../lib/prisma.js";
import type {
  GetProductsParams,
  SearchProductsParams,
  ProductSummary,
  ProductDetail,
  VariantInfo,
} from "../types/catalog.types.js";

// ── Read Prisma client

/**
 * List products with optional collection/fragranceFamily filtering and pagination.
 */
export async function listProducts(
  params: GetProductsParams,
): Promise<{ products: ProductSummary[]; total: number }> {
  const where: Record<string, unknown> = {};

  if (params.collection) {
    where.collections = {
      some: { collection: { slug: params.collection } },
    };
  }
  if (params.fragranceFamily) {
    where.fragranceFamily = {
      equals: params.fragranceFamily,
      mode: "insensitive" as const,
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: { orderBy: { priceCents: "asc" } },
        collections: { include: { collection: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => mapToSummary(p)),
    total,
  };
}

/**
 * Get a single product by slug with full detail.
 */
export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: { orderBy: { priceCents: "asc" } },
      collections: { include: { collection: true } },
    },
  });

  if (!product) return null;

  // Get related products (same fragrance family, excluding current)
  const related = await prisma.product.findMany({
    where: {
      fragranceFamily: product.fragranceFamily,
      id: { not: product.id },
    },
    include: {
      variants: { orderBy: { priceCents: "asc" } },
      collections: { include: { collection: true } },
    },
    take: 4,
  });

  return {
    ...mapToDetail(product),
    relatedProducts: related.map(mapToSummary),
  };
}

/**
 * Search products by title, tagline, description, or scentNotes.
 */
export async function searchProducts(
  params: SearchProductsParams,
): Promise<{ products: ProductSummary[]; total: number }> {
  const q = params.q.toLowerCase();

  const where = {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { tagline: { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
      { scentNotes: { has: q } },
    ],
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: { orderBy: { priceCents: "asc" } },
        collections: { include: { collection: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => mapToSummary(p)),
    total,
  };
}

/**
 * Return featured products for the home page.
 *
 * Prefers curated products from the Signature Collection.
 * If fewer than 4 signature products exist, falls back to the 6 newest products.
 */
export async function getFeaturedProducts(): Promise<ProductSummary[]> {
  // First, try to get products from Signature Collection
  const signatureProducts = await prisma.product.findMany({
    where: {
      collections: {
        some: {
          collection: {
            slug: "signature-collection",
          },
        },
      },
    },
    include: {
      variants: { orderBy: { priceCents: "asc" } },
      collections: { include: { collection: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  if (signatureProducts.length >= 4) {
    return signatureProducts.map(mapToSummary);
  }

  // Fallback: 6 newest products
  const latestProducts = await prisma.product.findMany({
    include: {
      variants: { orderBy: { priceCents: "asc" } },
      collections: { include: { collection: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return latestProducts.map(mapToSummary);
}

// ── Mappers ───────────────────────────────────────────────────────────

function getFirstVariant(
  variants: Array<{
    id: string;
    sku: string;
    priceCents: number;
    compareAtPrice: number | null;
    stock: number;
    size: string | null;
    color: string | null;
    fragrance: string | null;
  }>,
) {
  return variants[0] ?? null;
}

function mapToSummary(product: {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  images: string[];
  fragranceFamily: string | null;
  scentNotes: string[];
  burnTime: number | null;
  weight: number | null;
  hsnCode: string | null;
  waxType: string | null;
  ingredients: string | null;
  giftEligible: boolean;
  variants: Array<{
    id: string;
    sku: string;
    priceCents: number;
    compareAtPrice: number | null;
    stock: number;
    size: string | null;
    color: string | null;
    fragrance: string | null;
  }>;
  collections: Array<{
    collection: { id: string; title: string; slug: string };
  }>;
}): ProductSummary {
  const first = getFirstVariant(product.variants);
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    tagline: product.tagline,
    priceCents: first?.priceCents ?? 0,
    compareAtPriceCents: first?.compareAtPrice ?? null,
    image: product.images[0] ?? "",
    inStock: product.variants.some((v) => v.stock > 0),
    fragranceFamily: product.fragranceFamily,
    scentNotes: product.scentNotes,
    giftEligible: product.giftEligible,
    collectionSlugs: product.collections.map((pc) => pc.collection.slug),
  };
}

function mapToDetail(product: {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  images: string[];
  fragranceFamily: string | null;
  scentNotes: string[];
  burnTime: number | null;
  weight: number | null;
  hsnCode: string | null;
  waxType: string | null;
  ingredients: string | null;
  giftEligible: boolean;
  variants: Array<{
    id: string;
    sku: string;
    priceCents: number;
    compareAtPrice: number | null;
    stock: number;
    size: string | null;
    color: string | null;
    fragrance: string | null;
  }>;
  collections: Array<{
    collection: { id: string; title: string; slug: string };
  }>;
}): ProductDetail {
  const summary = mapToSummary(product);
  return {
    ...summary,
    description: product.description ?? "",
    images: product.images,
    burnTime: product.burnTime,
    weight: product.weight,
    hsnCode: product.hsnCode,
    waxType: product.waxType,
    ingredients: product.ingredients,
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      priceCents: v.priceCents,
      compareAtPriceCents: v.compareAtPrice,
      stock: v.stock,
      size: v.size,
      color: v.color,
      fragrance: v.fragrance,
    })),
    collections: product.collections.map((pc) => ({
      id: pc.collection.id,
      title: pc.collection.title,
      slug: pc.collection.slug,
    })),
    relatedProducts: [],
  };
}
