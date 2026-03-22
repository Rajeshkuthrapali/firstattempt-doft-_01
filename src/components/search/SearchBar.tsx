import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "../../stores/search";
import { useUiStore } from "../../stores/ui";
import { formatPrice } from "../../lib/format";
import { trackSearchQuery } from "../../lib/analytics";

/**
 * SearchBar overlay — full-width autocomplete dropdown.
 * Triggered by the search icon in Nav.
 * Keyboard accessible: Escape closes, Enter navigates to /search.
 */
export default function SearchBar() {
  const { query, hits, setQuery, clear } = useSearchStore();
  const { searchOpen, closeSearch } = useUiStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { closeSearch(); clear(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeSearch, clear]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    trackSearchQuery(query, hits.length);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    closeSearch();
  }

  if (!searchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => { closeSearch(); clear(); }}
        aria-hidden="true"
      />

      {/* Search panel */}
      <div className="relative bg-[#faf7f4] shadow-xl">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="text-[#9a8d82] flex-shrink-0" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          <label htmlFor="nav-search-input" className="sr-only">Search products</label>
          <input
            id="nav-search-input"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candles, scents, collections…"
            className="flex-1 bg-transparent py-2 text-base text-[#2d2926] placeholder:text-[#9a8d82] outline-none"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
          />
          <button
            type="button"
            onClick={() => { closeSearch(); clear(); }}
            className="text-[#9a8d82] hover:text-[#2d2926] transition-colors"
            aria-label="Close search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>

        {/* Autocomplete dropdown */}
        {hits.length > 0 && (
          <ul
            id="search-suggestions"
            role="listbox"
            aria-label="Search suggestions"
            className="mx-auto max-w-3xl px-6 pb-4 space-y-1"
          >
            {hits.map(({ product }) => (
              <li key={product.id} role="option" aria-selected="false">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/product/${product.slug}`);
                    closeSearch();
                    clear();
                  }}
                  className="w-full flex items-center gap-4 rounded p-2 text-left hover:bg-[#f3ece4] transition-colors"
                >
                  <img src={product.image} alt="" aria-hidden="true" className="h-10 w-10 rounded object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#2d2926] truncate">{product.name}</p>
                    <p className="text-xs text-[#9a8d82] truncate">{product.tagline}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-[#2d2926] flex-shrink-0">{formatPrice(product.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
