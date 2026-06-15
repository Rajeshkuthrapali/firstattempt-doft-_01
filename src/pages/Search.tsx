import { useEffect } from "react";
import { useSearchStore } from "../stores/search";
import { Link } from "react-router-dom";
import { trackSearchQuery } from "../lib/analytics";
import PageTransition from "../components/PageTransition";
import { ProductGridSkeleton } from "../components/ProductGridSkeleton";
import ProductCard from "../components/ProductCard";

/**
 * Search results page with autocomplete hits.
 */
export default function Search() {
  const { query, hits, loading, error, setQuery, fetchProducts } = useSearchStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (q.length >= 2) {
      const results = hits; // already computed in store
      trackSearchQuery(q, results.length);
    }
  }

  return (
    <PageTransition>
    <div className="mx-auto max-w-7xl px-6 py-section">
      <h1 className="heading-l text-ink mb-6">
        Search
      </h1>

      {/* Search input */}
      <div className="relative mb-10 max-w-xl">
        <label htmlFor="search-input" className="sr-only">
          Search products
        </label>
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-light"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m21 21-4.35-4.35" />
        </svg>
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={handleSearch}
          placeholder="Search candles, scents, collections…"
          autoFocus
          className="w-full border border-hairline bg-transparent pl-12 pr-4 py-3 body text-ink placeholder:text-light outline-none focus:border-ink transition-colors"
          aria-label="Search products"
          aria-controls="search-results"
          aria-autocomplete="list"
        />
      </div>

      {/* Results */}
      {query && (
        <section
          id="search-results"
          aria-live="polite"
          aria-label="Search results"
        >
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <div className="py-16 text-center">
              <p className="body text-muted">{error}</p>
            </div>
          ) : hits.length > 0 ? (
            <>
              <p className="caption text-muted mb-4">
                {hits.length} result{hits.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </p>
              <div className="grid grid-cols-2 gap-px bg-hairline md:grid-cols-3 lg:grid-cols-4">
                {hits.map(({ product }) => (
                  <div key={product.id} className="bg-soft-cream">
                    <Link to={`/product/${product.slug}`}>
                      <ProductCard product={product} />
                    </Link>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="body text-muted">
              No results for &ldquo;<strong>{query}</strong>&rdquo;. Try a scent note or
              collection.
            </p>
          )}
        </section>
      )}
    </div>
    </PageTransition>
  );
}
