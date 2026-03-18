import { useParams, Link } from "react-router-dom";
import { getProductBySlug, products } from "../data/products";
import { useCartStore } from "../stores/cart";
import ProductCard from "../components/ProductCard";

/**
 * Product detail page — clean, editorial layout matching the
 * light luxury reference. Left image, right details with clear hierarchy:
 * category → name → tagline → description → notes → specs → price → CTA.
 * Includes a "You May Also Like" recommendation section.
 */
export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const addItem = useCartStore((s) => s.addItem);

  const product = slug ? getProductBySlug(slug) : undefined;

  /* ── 404 fallback ───────────────────────── */
  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-['Cormorant_Garamond',serif] text-[36px] font-medium text-[#2d2926]">
          Product Not Found
        </h1>
        <p className="text-[14px] text-[#9a8d82]">
          The candle you&apos;re looking for doesn&apos;t exist — yet.
        </p>
        <Link
          to="/"
          className="mt-3 border border-[#c4a093] px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#c4a093] transition-all hover:bg-[#c4a093] hover:text-white"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price);

  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        {/* ── Breadcrumb ─────────────────────── */}
        <nav
          className="mb-8 text-[12px] text-[#9a8d82]"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-[#c4a093] transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/" className="hover:text-[#c4a093] transition-colors">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-[#6b5e54]" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
          {/* ── Image Column ─────────────────── */}
          <div className="overflow-hidden rounded-lg bg-[#f3ece4]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-[4/5] object-cover"
            />
          </div>

          {/* ── Details Column ───────────────── */}
          <div className="flex flex-col gap-5 md:py-4">
            {/* Category pill */}
            <span className="self-start rounded-sm bg-[#f3ece4] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a8d82]">
              {product.category}
            </span>

            <h1 className="font-['Cormorant_Garamond',serif] text-[36px] md:text-[44px] font-medium leading-[1.15] text-[#2d2926]">
              {product.name}
            </h1>

            <p className="text-[16px] text-[#6b5e54]">{product.tagline}</p>

            {/* Price */}
            <p className="text-[22px] font-semibold text-[#2d2926]">
              {formattedPrice}
            </p>

            {/* Divider */}
            <div className="h-px w-full bg-[#e8e0d8]" />

            {/* Description */}
            <p className="text-[14px] leading-[1.8] text-[#6b5e54]">
              {product.description}
            </p>

            {/* Fragrance notes */}
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a8d82] mb-2.5">
                Fragrance Notes
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.notes.map((note) => (
                  <span
                    key={note}
                    className="rounded-sm border border-[#e8e0d8] bg-[#faf7f4] px-3 py-1.5 text-[11px] tracking-[0.05em] text-[#6b5e54]"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-3 gap-px bg-[#e8e0d8] rounded-md overflow-hidden">
              <div className="bg-white p-4 text-center">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#9a8d82]">
                  Burn Time
                </p>
                <p className="mt-1 text-[15px] font-medium text-[#2d2926]">
                  ~{product.burnTime}h
                </p>
              </div>
              <div className="bg-white p-4 text-center">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#9a8d82]">
                  Weight
                </p>
                <p className="mt-1 text-[15px] font-medium text-[#2d2926]">
                  {product.weight}g
                </p>
              </div>
              <div className="bg-white p-4 text-center">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#9a8d82]">
                  Wax
                </p>
                <p className="mt-1 text-[15px] font-medium text-[#2d2926]">
                  100% Soy
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              id="product-add-to-cart"
              disabled={!product.inStock}
              onClick={() => addItem(product)}
              className="w-full bg-[#c4a093] py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-all duration-250 hover:bg-[#a8877b] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#d9c2b7]"
            >
              {product.inStock ? "Add to Cart" : "Sold Out"}
            </button>

            {product.inStock && (
              <p className="flex items-center gap-1.5 text-[12px] text-[#8b9e7e]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                In stock · Free shipping on orders above ₹3,000
              </p>
            )}

            {/* Trust badges */}
            <div className="flex items-center gap-6 pt-2 border-t border-[#f0ebe5]">
              {["Cruelty Free", "Eco Packaging", "Cotton Wick"].map((badge) => (
                <span
                  key={badge}
                  className="text-[10px] uppercase tracking-[0.1em] text-[#9a8d82]"
                >
                  ✦ {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── You May Also Like ────────────────── */}
      <section className="bg-[#f3ece4] border-t border-[#e8e0d8] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center">
            <h2 className="font-['Cormorant_Garamond',serif] text-[28px] md:text-[34px] font-medium text-[#2d2926]">
              You May Also Like
            </h2>
            <div className="mx-auto mt-3 h-px w-12 bg-[#c4a093]" />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
