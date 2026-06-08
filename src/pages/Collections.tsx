import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api/client";
import { useApi } from "../lib/hooks/useApi";
import { useCartStore } from "../stores/cart";
import { useWishlistStore } from "../stores/wishlist";
import {
  trackWishlistAdd,
  trackWishlistRemove,
  trackAddToCart,
} from "../lib/analytics";
import { formatPrice } from "../lib/format";
import type { ProductSummary, PaginatedResponse } from "../types/catalog";

/**
 * Collections / Catalog page.
 * Features: category filter, curated favourites section, related/recommended products.
 */
export default function Collections() {
  const [searchParams] = useSearchParams();
  const scentParams = searchParams.get("scent") || "";
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState(scentParams);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();

  const productsApi = useApi<ProductSummary[]>(
    () => api.get<PaginatedResponse<ProductSummary>>("/api/products?limit=100"),
    [],
  );

  useEffect(() => {
    productsApi.execute();
  }, [productsApi.execute]);

  const allProducts = productsApi.data ?? [];

  const categories = [
    { value: "all", label: "All" },
    { value: "signature", label: "Signature" },
    { value: "seasonal", label: "Seasonal" },
    { value: "limited", label: "Limited Edition" },
  ];

  function getCategoryFromSlugs(collectionSlugs: string[]): string {
    if (collectionSlugs.includes("limited")) return "limited";
    if (collectionSlugs.includes("seasonal")) return "seasonal";
    return "signature";
  }

  const filtered = allProducts.filter((p) => {
    const productCategory = getCategoryFromSlugs(p.collectionSlugs);
    const matchCat = activeCategory === "all" || productCategory === activeCategory;
    const matchQ =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.scentNotes.some((n) => n.toLowerCase().includes(query.toLowerCase()));
    return matchCat && matchQ;
  });

  const curated = allProducts.filter(
    (p) => p.inStock && getCategoryFromSlugs(p.collectionSlugs) === "signature",
  );
  const recommended = allProducts.filter((p) => p.inStock).slice(0, 3);

  function handleWishlistToggle(p: ProductSummary) {
    const result = toggle(p);
    if (result === "added") trackWishlistAdd(p.id, p.title, p.priceCents / 100);
    else trackWishlistRemove(p.id, p.title);
  }

  function handleAddToCart(p: ProductSummary) {
    addItem({
      productId: p.id,
      variantId: p.id,
      title: p.title,
      variantTitle: "Single",
      price: p.priceCents / 100,
      image: p.image,
      slug: p.slug,
      maxStock: p.inStock ? 100 : 0,
    });
    trackAddToCart(p.id, p.title, p.priceCents / 100);
  }

  if (productsApi.loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="py-20 text-center text-sm text-[#9a8d82]">Loading...</div>
      </div>
    );
  }

  if (productsApi.error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="py-20 text-center text-sm text-[#9a8d82]">
          Unable to load products. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-['Cormorant_Garamond',serif] text-4xl font-semibold text-[#2d2926] mb-2">
        Our Collection
      </h1>
      <p className="text-sm text-[#6b5e54] mb-10">
        Hand-poured luxury soy candles for every mood and moment.
      </p>

      {/* ── Curated Favourites Banner ── */}
      {curated.length > 0 && (
        <section
          className="mb-12 rounded-xl bg-[#f3ece4] p-8 md:p-10"
          aria-labelledby="curated-heading"
        >
          <h2
            id="curated-heading"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-6"
          >
            ✦ Curated Favourites
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3" role="list">
            {curated.slice(0, 3).map((p) => (
              <li key={p.id} className="group flex flex-col">
                <Link
                  to={`/product/${p.slug}`}
                  className="overflow-hidden rounded-lg"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-52 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="mt-3">
                  <Link
                    to={`/product/${p.slug}`}
                    className="text-sm font-semibold text-[#2d2926] hover:text-[#c4a093] transition-colors"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-[#9a8d82] mt-0.5">
                    {formatPrice(p.priceCents / 100)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Filter + Search ── */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <nav aria-label="Product categories">
          <ul className="flex flex-wrap gap-2" role="list">
            {categories.map(({ value, label }) => (
              <li key={value}>
                <button
                  onClick={() => setActiveCategory(value)}
                  {...{ "aria-pressed": activeCategory === value }}
                  className={`px-4 py-2 text-xs uppercase tracking-widest rounded-full border transition-colors ${activeCategory === value
                      ? "bg-[#2d2926] text-white border-[#2d2926]"
                      : "border-[#e8e0d8] text-[#6b5e54] hover:border-[#c4a093]"
                    }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="relative">
          <label htmlFor="catalog-search" className="sr-only">
            Filter products
          </label>
          <input
            id="catalog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name or scent…"
            className="border border-[#e8e0d8] bg-white px-4 py-2 text-sm text-[#2d2926] placeholder:text-[#9a8d82] outline-none focus:border-[#c4a093] transition-colors rounded-sm w-56"
          />
        </div>
      </div>

      {/* ── Product Grid ── */}
      <section aria-label="Product grid" aria-live="polite">
        {filtered.length === 0 ? (
          <p className="text-sm text-[#9a8d82] py-8 text-center">
            No products match your selection.
          </p>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {filtered.map((p) => {
              const productCategory = getCategoryFromSlugs(p.collectionSlugs);
              return (
                <li key={p.id} className="group relative">
                  {/* Wishlist toggle */}
                  <button
                    onClick={() => handleWishlistToggle(p)}
                    aria-label={`${has(p.id) ? "Remove from" : "Add to"} wishlist: ${p.title}`}
                    {...{ "aria-pressed": has(p.id) }}
                    className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={has(p.id) ? "#c4a093" : "none"}
                      stroke="#c4a093"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  <div className="overflow-hidden rounded-lg">
                    <Link to={`/product/${p.slug}`}>
                      <img
                        src={p.image}
                        alt={p.title}
                        className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                  </div>

                  {!p.inStock && (
                    <span className="absolute top-3 left-3 bg-[#9a8d82] text-white text-[9px] uppercase tracking-widest px-2 py-1 rounded-full">
                      Sold Out
                    </span>
                  )}

                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#c4a093]">
                      {productCategory}
                    </p>
                    <Link
                      to={`/product/${p.slug}`}
                      className="mt-1 block text-base font-semibold text-[#2d2926] hover:text-[#c4a093] transition-colors"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-[#9a8d82] mt-0.5">{p.tagline}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#2d2926]">
                        {formatPrice(p.priceCents / 100)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={!p.inStock}
                        className="bg-[#2d2926] text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-[#c4a093] disabled:opacity-40 transition-colors rounded-sm"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Recommended ── */}
      {recommended.length > 0 && (
        <section className="mt-20" aria-labelledby="recommended-heading">
          <h2
            id="recommended-heading"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-6"
          >
            You Might Also Like
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3" role="list">
            {recommended.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/product/${p.slug}`}
                  className="group flex gap-4 items-center rounded border border-[#e8e0d8] p-4 hover:border-[#c4a093] transition-colors"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-14 w-14 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#2d2926] group-hover:text-[#c4a093] transition-colors truncate">
                      {p.title}
                    </p>
                    <p className="text-xs text-[#9a8d82]">
                      {formatPrice(p.priceCents / 100)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
