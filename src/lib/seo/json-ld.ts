interface JsonLdProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  scentFamily: string;
  images: string;
}

interface JsonLdVariant {
  id: string;
  productId: string;
  sku: string;
  title: string;
  price: number;
  stock: number;
}

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://doftcandles.com";

/**
 * Generates JSON-LD structured data for a product page.
 * Follows Schema.org Product specification for rich snippets.
 */
export function productJsonLd(
  product: JsonLdProduct,
  variants: JsonLdVariant[],
): Record<string, unknown> {
  const images: string[] = JSON.parse(product.images);
  const minPrice = Math.min(...variants.map((v) => v.price));
  const maxPrice = Math.max(...variants.map((v) => v.price));
  const inStock = variants.some((v) => v.stock > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: images,
    url: `${BASE_URL}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "Lumière",
    },
    offers:
      variants.length === 1
        ? {
            "@type": "Offer",
            price: minPrice.toFixed(2),
            priceCurrency: "USD",
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: `${BASE_URL}/products/${product.slug}`,
            seller: {
              "@type": "Organization",
              name: "Lumière",
            },
          }
        : {
            "@type": "AggregateOffer",
            lowPrice: minPrice.toFixed(2),
            highPrice: maxPrice.toFixed(2),
            priceCurrency: "USD",
            offerCount: variants.length,
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
    category: product.scentFamily,
  };
}

/**
 * Generates JSON-LD breadcrumb structured data.
 */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generates JSON-LD Organization structured data for the homepage.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lumière",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "Experience the world through smell. Handcrafted luxury candles, wax tablets, and diffusers in timeless glass.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@doftcandles.com",
      contactType: "customer service",
    },
    sameAs: [
      "https://www.instagram.com/doftcandles",
      "https://www.facebook.com/doftcandles",
    ],
  };
}

/**
 * Generates JSON-LD CollectionPage for collection listings.
 */
export function collectionJsonLd(
  title: string,
  slug: string,
  description: string,
  productCount: number,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `${BASE_URL}/collections/${slug}`,
    numberOfItems: productCount,
    isPartOf: {
      "@type": "WebSite",
      name: "Lumière",
      url: BASE_URL,
    },
  };
}
