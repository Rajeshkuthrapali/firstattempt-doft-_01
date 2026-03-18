import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import { useCartStore } from "../stores/cart";

interface ProductCardProps {
  product: Product;
}

/**
 * Clean, minimal product card — light luxury style.
 * White card on warm cream background, subtle hover elevation,
 * elegant serif title, and a rose-toned "Add to Cart" button.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  /** Format price as ₹X,XXX */
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <article
      id={`product-card-${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-white border border-[#f0ebe5] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(45,41,38,0.1)] hover:border-[#e8e0d8]"
    >
      {/* ── Image ─────────────────────────────── */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block overflow-hidden bg-[#f3ece4]"
        aria-label={`View ${product.name} details`}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category badge */}
        {product.category === "limited" && (
          <span className="absolute top-3 left-3 rounded-sm bg-[#c4a093] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
            Limited Edition
          </span>
        )}
        {product.category === "seasonal" && (
          <span className="absolute top-3 left-3 rounded-sm bg-[#8b9e7e] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
            Seasonal
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="rounded-sm bg-[#2d2926] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick-add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            id={`quick-add-${product.slug}`}
            disabled={!product.inStock}
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="w-full bg-[#c4a093] py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#a8877b] disabled:cursor-not-allowed disabled:bg-[#d9c2b7]"
          >
            {product.inStock ? "Quick Add" : "Sold Out"}
          </button>
        </div>
      </Link>

      {/* ── Body ──────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <Link to={`/product/${product.slug}`} className="space-y-0.5">
          <h3 className="font-['Cormorant_Garamond',serif] text-[17px] font-medium text-[#2d2926] transition-colors group-hover:text-[#c4a093]">
            {product.name}
          </h3>
          <p className="text-[12px] text-[#9a8d82] line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </Link>

        {/* Price */}
        <p className="mt-auto pt-2 text-[14px] font-medium text-[#2d2926]">
          {formattedPrice}
        </p>
      </div>
    </article>
  );
}
