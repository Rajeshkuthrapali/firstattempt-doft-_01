import { useEffect } from "react";
import { useSearchStore } from "../stores/search";
import { useCartStore } from "../stores/cart";
import { Link } from "react-router-dom";
import { formatPrice } from "../lib/format";
import { trackSearchQuery } from "../lib/analytics";

/**
 * Search results page with autocomplete hits.
 * Also shows a "Curated Favourites" section of recommended products.
 */
export default function Search() {
  const { query, hits, products, setQuery, fetchProducts } = useSearchStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const curated = products.filter((p) => p.inStock).slice(0, 3);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (q.length >= 2) {
      const results = hits; // already computed in store
      trackSearchQuery(q, results.length);
    }
  }

  function handleAddToCart(product: (typeof products)[0]) {
    addItem({
      productId: product.id,
      variantId: product.id,
      title: product.title,
      variantTitle: "Single",
      price: product.priceCents / 100,
      image: product.image,
      slug: product.slug,
      maxStock: product.inStock ? 100 : 0,
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-semibold text-[#2d2926] mb-6">
        Search
      </h1>

      {/* Search input */}
      <div className="relative mb-10">
        <label htmlFor="search-input" className="sr-only">
          Search products
        </label>
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a8d82]"
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
          className="w-full border border-[#e8e0d8] bg-white pl-12 pr-4 py-4 text-sm text-[#2d2926] placeholder:text-[#9a8d82] outline-none focus:border-[#c4a093] transition-colors rounded-sm"
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
          {hits.length === 0 ? (
            <p className="text-sm text-[#9a8d82]">
              No results for "<strong>{query}</strong>". Try a scent note or
              collection.
            </p>
          ) : (
            <>
              <p className="text-xs text-[#9a8d82] uppercase tracking-widest mb-4">
                {hits.length} result{hits.length !== 1 ? "s" : ""} for "{query}"
              </p>
              <ul
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                role="list"
              >
                {hits.map(({ product, matchedOn }) => (
                  <li
                    key={product.id}
                    className="group rounded border border-[#e8e0d8] overflow-hidden"
                  >
                    <Link to={`/product/${product.slug}`} className="block">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-widest text-[#c4a093] mb-1">
                          Matched on {matchedOn}
                        </p>
                        <h3 className="text-sm font-semibold text-[#2d2926]">
                          {product.title}
                        </h3>
                        <p className="text-xs text-[#9a8d82] mt-0.5">
                          {product.tagline}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#2d2926]">
                          {formatPrice(product.priceCents / 100)}
                        </p>
                      </div>
                    </Link>
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-[#2d2926] text-white py-2 text-[11px] uppercase tracking-widest hover:bg-[#c4a093] transition-colors rounded-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* Curated Favourites (shown when no query) */}
      {!query && (
        <section aria-labelledby="curated-heading">
          <h2
            id="curated-heading"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-6"
          >
            Curated Favourites
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3" role="list">
            {curated.map((p) => (
              <li key={p.id} className="group">
                <Link to={`/product/${p.slug}`} className="block">
                  <div className="overflow-hidden rounded">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-[#2d2926]">
                      {p.title}
                    </h3>
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
