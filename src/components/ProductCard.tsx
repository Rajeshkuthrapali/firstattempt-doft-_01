import { useState } from "react";
import { Link } from "react-router-dom";
import type { ProductSummary } from "../types/catalog";
import { useCartStore } from "../stores/cart";

interface ProductCardProps {
  product: ProductSummary;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const priceInRupees = product.priceCents / 100;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(priceInRupees);

  const originalPrice = product.compareAtPriceCents
    ? product.compareAtPriceCents / 100
    : null;

  const formattedOriginal = originalPrice
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(originalPrice)
    : null;

  function handleAddToCart() {
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
  }

  const imageSrc = !product.image || imgError
    ? "/placeholder-candle.svg"
    : product.image;

  const isLimited = product.collectionSlugs.includes("limited");
  const isSeasonal = product.collectionSlugs.includes("seasonal");

  return (
    <article className="group relative flex flex-col">
      {/* ── Image ─────────────────────────────── */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block overflow-hidden bg-warm-sand"
        aria-label={`View ${product.title} details`}
      >
        <img
          src={imageSrc}
          alt={product.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="aspect-[3/4] w-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
        />

        {/* Collection badge */}
        {isLimited && (
          <span className="absolute top-4 left-4 bg-brass-gold px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
            Limited
          </span>
        )}
        {isSeasonal && (
          <span className="absolute top-4 left-4 bg-ink px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
            Seasonal
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <span className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick actions — subtle gold hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-400 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            id={`quick-add-${product.slug}`}
            disabled={!product.inStock}
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
            className="w-full bg-brass-gold py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-pale-gold hover:text-ink disabled:bg-hairline disabled:text-muted disabled:cursor-not-allowed"
          >
            {product.inStock ? "Add to Bag" : "Sold Out"}
          </button>
        </div>
      </Link>

      {/* ── Body ──────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 pt-4 px-0 border-t border-hairline">
        <Link to={`/product/${product.slug}`} className="space-y-1">
          <h3 className="font-heading text-[16px] font-medium text-ink leading-snug transition-colors duration-300 group-hover:text-brass-gold">
            {product.title}
          </h3>
          {product.tagline && (
            <p className="text-[12px] text-muted line-clamp-2 leading-relaxed">
              {product.tagline}
            </p>
          )}
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[14px] font-medium text-ink tracking-tight">
            {formattedPrice}
          </span>
          {originalPrice && (
            <span className="text-[12px] text-light line-through">
              {formattedOriginal}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
