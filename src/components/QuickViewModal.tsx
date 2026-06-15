import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUiStore } from "../stores/ui";
import { useCartStore } from "../stores/cart";
import { trackAddToCart, trackQuickView } from "../lib/analytics";

/**
 * Quick-view modal — shows product details without leaving the current page.
 * Triggered by hovering a ProductCard and clicking "Quick View".
 * Accessible: focus-trapped, Escape closes, aria-modal, role=dialog.
 */
export default function QuickViewModal() {
  const [imgError, setImgError] = useState(false);
  const { quickViewProduct, closeQuickView } = useUiStore();
  const addItem = useCartStore((s) => s.addItem);
  const closeRef = useRef<HTMLButtonElement>(null);

  const product = quickViewProduct;

  // Focus the close button when modal opens
  useEffect(() => {
    if (product) {
      closeRef.current?.focus();
      trackQuickView(product.id, product.title);
    }
  }, [product]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeQuickView();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeQuickView]);

  if (!product) return null;

  const priceInRupees = product.priceCents / 100;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(priceInRupees);

  const isLimited = product.collectionSlugs.includes("limited");

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      variantId: product.id,
      title: product.title,
      variantTitle: "Single",
      price: priceInRupees,
      image: product.image,
      slug: product.slug,
      maxStock: product.inStock ? 100 : 0,
    });
    trackAddToCart(product.id, product.title, priceInRupees);
    closeQuickView();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeQuickView}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-soft-cream shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {/* Close */}
        <button
          ref={closeRef}
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center bg-[#f3ece4] text-dark hover:bg-hairline transition-colors"
          aria-label="Close quick view"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative overflow-hidden bg-[#f3ece4]">
            <img
              src={!product.image || imgError ? "/placeholder-candle.svg" : product.image}
              alt={product.title}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover aspect-square"
            />
            {!product.inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <span className="bg-ink px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
                  Sold Out
                </span>
              </div>
            )}
            {isLimited && (
              <span className="absolute top-3 left-3 bg-brass-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                Limited Edition
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 p-6">
            <div>
              <h2 className="font-heading text-2xl font-medium text-ink">
                {product.title}
              </h2>
              <p className="mt-1 text-sm text-dark leading-relaxed">
                {product.tagline}
              </p>
            </div>

            <p className="text-xl font-semibold text-ink">{formattedPrice}</p>

            {/* Scent notes */}
            {product.scentNotes.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                  Scent Notes
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.scentNotes.map((note) => (
                    <span
                      key={note}
                      className="border border-hairline px-3 py-1 text-[11px] text-dark"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-ink text-white py-3 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-brass-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {product.inStock ? "Add to Cart" : "Sold Out"}
              </button>
              <Link
                to={`/product/${product.slug}`}
                onClick={closeQuickView}
                className="text-center text-[11px] uppercase tracking-[0.15em] text-muted hover:text-brass-gold transition-colors py-2"
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
