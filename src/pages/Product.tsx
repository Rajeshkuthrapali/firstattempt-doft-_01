import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api/client";
import { useApi } from "../lib/hooks/useApi";
import { useCartStore } from "../stores/cart";
import { useWishlistStore } from "../stores/wishlist";
import ProductCard from "../components/ProductCard";
import PageTransition from "../components/PageTransition";
import { PageSkeleton } from "../components/PageSkeleton";
import type { ProductDetail, SingleResponse } from "../types/catalog";

/**
 * Product detail page — editorial luxury layout.
 *
 * Layout: left image gallery, right details with clear hierarchy:
 *   category → title → tagline → price → divider → description
 *   → scent notes (top/heart/base) → specs → add-to-cart → cross-sell
 *
 * Accent: brass gold for interactive elements.
 */
export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const productApi = useApi<ProductDetail>(
    () => api.get<SingleResponse<ProductDetail>>(`/api/products/${slug}`),
    [slug],
  );

  useEffect(() => {
    if (slug) productApi.execute();
  }, [slug, productApi.execute]);

  const product = productApi.data;

  /* ── Loading state ──────────────────── */
  if (productApi.loading) {
    return <PageSkeleton />;
  }

  /* ── Error / not found ──────────────── */
  if (productApi.error || !product) {
    return (
      <PageTransition>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="heading-l text-ink">Product Not Found</h1>
          <p className="body text-muted max-w-md">
            The candle you&apos;re looking for doesn&apos;t exist — yet.
          </p>
          <Link
            to="/collections"
            className="mt-3 border border-brass-gold px-6 py-2.5 caption text-brass-gold transition-all hover:bg-brass-gold hover:text-warm-ivory"
          >
            Browse Collections
          </Link>
        </div>
      </PageTransition>
    );
  }

  const safeProduct = product;
  const priceInRupees = safeProduct.priceCents / 100;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(priceInRupees);

  const relatedProducts = safeProduct.relatedProducts?.slice(0, 3) ?? [];
  const displayImage = safeProduct.images?.[selectedImage] ?? safeProduct.image;

  const isLimited = safeProduct.collectionSlugs.includes("limited");
  const isSeasonal = safeProduct.collectionSlugs.includes("seasonal");
  const displayCategory = isLimited ? "limited" : isSeasonal ? "seasonal" : "signature";

  const isWishlisted = wishlistIds.includes(safeProduct.id);

  function handleAddToCart() {
    addItem({
      productId: safeProduct.id,
      variantId: safeProduct.id,
      title: safeProduct.title,
      variantTitle: "Single",
      price: priceInRupees,
      image: displayImage,
      slug: safeProduct.slug,
      maxStock: safeProduct.inStock ? 100 : 0,
    }, quantity);
  }

  function handleToggleWishlist() {
    toggleWishlist(safeProduct);
  }

  return (
    <PageTransition>
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        {/* ── Breadcrumb ─────────────────────── */}
        <nav className="mb-10 caption text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link to="/" className="hover:text-brass-gold transition-colors">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/collections" className="hover:text-brass-gold transition-colors">Shop</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-dark" aria-current="page">{safeProduct.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* ══════════════════════════════════
              IMAGE COLUMN
              ══════════════════════════════════ */}
          <div className="overflow-hidden" data-animate="image-reveal">
            <img
              src={displayImage}
              alt={safeProduct.title}
              className="w-full aspect-[4/5] object-cover"
            />
            {/* Image gallery */}
            {safeProduct.images && safeProduct.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {safeProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-20 border-2 transition-colors ${
                      selectedImage === idx ? "border-brass-gold" : "border-hairline hover:border-muted"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-candle.svg"; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════
              DETAILS COLUMN
              ══════════════════════════════════ */}
          <div className="flex flex-col gap-6 md:py-6">
            {/* Category pill */}
<span className="self-start micro uppercase tracking-[0.15em] text-brass-gold border border-brass-gold/30 px-4 py-1.5">
  {displayCategory}
</span>

            {/* Title */}
            <h1 className="heading-l text-ink">
              {safeProduct.title}
            </h1>

            {/* Tagline */}
            <p className="body-large text-dark leading-relaxed">
              {safeProduct.tagline}
            </p>

            {/* Price */}
            <p className="heading-s font-semibold text-ink">
              {formattedPrice}
            </p>

            {/* Hairline divider */}
            <div className="h-px w-full bg-hairline" />

            {/* Description */}
            <p className="body text-dark leading-relaxed max-w-lg">
              {safeProduct.description}
            </p>

            {/* ── Scent Notes ────────────────── */}
            <div>
              <h3 className="micro uppercase tracking-[0.2em] text-muted mb-3">
                Fragrance Notes
              </h3>
              <div className="flex flex-wrap gap-2">
                {safeProduct.scentNotes.map((note) => (
                  <span
                    key={note}
                    className="border border-hairline bg-soft-cream px-3 py-1.5 caption tracking-[0.05em] text-dark"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Specifications ─────────────── */}
            <div className="grid grid-cols-3 gap-px bg-hairline">
              {safeProduct.burnTime != null && (
                <div className="bg-white p-5 text-center">
                  <p className="micro uppercase tracking-[0.15em] text-muted">Burn Time</p>
                  <p className="mt-1.5 body font-medium text-ink">~{safeProduct.burnTime}h</p>
                </div>
              )}
              {safeProduct.weight != null && (
                <div className="bg-white p-5 text-center">
                  <p className="micro uppercase tracking-[0.15em] text-muted">Weight</p>
                  <p className="mt-1.5 body font-medium text-ink">{safeProduct.weight}g</p>
                </div>
              )}
              <div className="bg-white p-5 text-center">
                <p className="micro uppercase tracking-[0.15em] text-muted">Wax</p>
                <p className="mt-1.5 body font-medium text-ink">
                  {safeProduct.waxType ? `100% ${safeProduct.waxType}` : "100% Soy"}
                </p>
              </div>
            </div>

            {/* ── Quantity selector ──────────── */}
            <div className="flex items-center gap-4 mb-2">
              <span className="caption text-muted tracking-[0.12em]">Qty</span>
              <div className="flex items-center border border-hairline">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-ink hover:bg-warm-sand transition-colors text-sm"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="px-4 py-2 text-ink text-sm font-medium min-w-[2rem] text-center border-x border-hairline">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="px-3 py-2 text-ink hover:bg-warm-sand transition-colors text-sm"
                  aria-label="Increase quantity"
                  disabled={quantity >= 99}
                >
                  +
                </button>
              </div>
            </div>

            {/* ── Add to Cart + Wishlist ──────── */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  id="product-add-to-cart"
                  disabled={!safeProduct.inStock}
                  onClick={handleAddToCart}
                  className="flex-1 bg-ink py-4 caption font-semibold uppercase tracking-[0.15em] text-ivory hover:bg-brass-gold transition-all duration-250 disabled:cursor-not-allowed disabled:bg-light"
                >
                  {safeProduct.inStock ? "Add to Cart" : "Sold Out"}
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`w-14 border py-4 flex items-center justify-center transition-colors ${
                    isWishlisted
                      ? "border-brass-gold text-brass-gold"
                      : "border-hairline text-muted hover:text-brass-gold hover:border-brass-gold"
                  }`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>
              </div>

              {safeProduct.inStock && (
                <p className="flex items-center gap-1.5 caption text-success">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  In stock · Free shipping on orders above ₹3,000
                </p>
              )}
            </div>

            {/* ── Trust badges ───────────────── */}
            <div className="flex items-center gap-6 pt-4 border-t border-hairline">
              {["Cruelty Free", "Eco Packaging", "Cotton Wick"].map((badge) => (
                <span key={badge} className="micro uppercase tracking-[0.1em] text-muted">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CROSS-SELL — Related Products
          ══════════════════════════════════════ */}
      {relatedProducts.length > 0 && (
        <section className="bg-warm-sand border-t border-hairline py-section" data-animate="fade-up">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="heading-m text-ink">
                You May Also Like
              </h2>
              <div className="mx-auto mt-3 h-px w-12 bg-brass-gold" />
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
              data-animate="stagger"
            >
              {relatedProducts.map((p) => (
                <div key={p.id} data-animate-child>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageTransition>
  );
}
