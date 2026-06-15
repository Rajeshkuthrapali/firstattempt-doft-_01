import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api/client";
import { useApi } from "../lib/hooks/useApi";
import { ProductGridSkeleton } from "../components/ProductGridSkeleton";
import ProductCard from "../components/ProductCard";
import PageTransition from "../components/PageTransition";
import type { ProductSummary, PaginatedResponse } from "../types/catalog";

/**
 * Collections / Catalog page.
 * Editorial layout with category text nav and dense product grid.
 */
export default function Collections() {
  const [searchParams] = useSearchParams();
  const scentParams = searchParams.get("scent") || "";
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState(scentParams);

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

  if (productsApi.loading) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-section">
          <ProductGridSkeleton count={8} />
        </div>
      </PageTransition>
    );
  }

  if (productsApi.error) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="py-20 text-center body text-muted">
            Unable to load products. Please try again later.
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-6 py-section">
        {/* Page header */}
        <h1 className="heading-xl text-ink">Our Collection</h1>
        <p className="body text-muted mt-2 max-w-xl">
          Fifty-one hand-poured luxury soy candles, each one designed to transform the atmosphere of any room.
        </p>

        {/* Category navigation — text links */}
        <nav className="flex flex-wrap gap-8 border-b border-hairline pb-4 mb-12 mt-10">
          {categories.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={`caption tracking-[0.12em] transition-colors pb-4 -mb-4 ${
                activeCategory === value
                  ? "text-ink border-b border-ink"
                  : "text-light hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Product count + filter */}
        <div className="flex items-center justify-between mb-10">
          <p className="caption text-light">{filtered.length} products</p>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name or scent…"
            className="px-4 py-2 border border-hairline bg-transparent body-small text-ink placeholder:text-light outline-none focus:border-ink transition-colors max-w-[200px]"
          />
        </div>

        {/* Product grid */}
        <section aria-live="polite">
          {filtered.length === 0 ? (
            <p className="body text-muted py-20 text-center">No products match your selection.</p>
          ) : (
            <div className="grid grid-cols-2 gap-px bg-hairline md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <div key={p.id} className="bg-soft-cream" data-animate-child>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
