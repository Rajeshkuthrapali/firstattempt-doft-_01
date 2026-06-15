import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api/client";
import { useApi } from "../lib/hooks/useApi";
import ProductCard from "../components/ProductCard";
import PageTransition from "../components/PageTransition";
import { heroReveal } from "../lib/animations";
import { ProductGridSkeleton } from "../components/ProductGridSkeleton";
import type { ProductSummary, PaginatedResponse } from "../types/catalog";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  const featuredApi = useApi<ProductSummary[]>(
    () => api.get<PaginatedResponse<ProductSummary>>("/api/products/featured"),
    [],
  );

  useEffect(() => {
    featuredApi.execute();
  }, [featuredApi.execute]);

  /* ── Hero reveal animation ────────────── */
  useEffect(() => {
    if (heroRef.current) {
      const cleanup = heroReveal(heroRef.current);
      return () => {
        if (cleanup && typeof cleanup.revert === "function") cleanup.revert();
        else if (cleanup && typeof cleanup.kill === "function") cleanup.kill();
      };
    }
  }, []);

  const signatureProducts = (featuredApi.data ?? []).slice(0, 4);
  const bestsellerProducts = (featuredApi.data ?? []).slice(2, 6);

  return (
    <PageTransition>
      {/* ═══════════════════════════════════════════
           1. HERO — Editorial brand campaign
           ═══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative h-[90vh] min-h-[650px] max-h-[1000px] overflow-hidden bg-deep-charcoal"
        aria-label="Hero banner"
      >
        {/* Background image with slow zoom */}
        <img
          src="/hero-candle.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50 scale-105"
          style={{ transform: "scale(1.08)" }}
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-deep-charcoal/50 via-deep-charcoal/30 to-deep-charcoal/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-charcoal/40 to-transparent" />

        {/* Editorial hero content — left-aligned, not centered */}
        <div className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-5xl">
          <p
            data-hero="label"
            className="micro tracking-[0.15em] text-brass-gold mb-6"
          >
            Lumière — Artisanal Candles
          </p>
          <h1
            data-hero="headline"
            className="heading-hero-display text-white max-w-4xl"
          >
            Light,
            <br />
            <span className="text-brass-gold">responsibly</span>
          </h1>
          <p
            data-hero="subtext"
            className="mt-8 body text-white/65 max-w-xl leading-relaxed"
          >
            Handcrafted in small batches using 100% natural soy wax, cotton wicks,
            and the finest fragrance oils. Each candle is a quiet ritual — a
            moment of stillness in an otherwise restless world.
          </p>
          <div data-hero="cta" className="mt-10 flex items-center gap-6">
            <Link
              to="/collections"
              className="group inline-flex items-center gap-3 border border-brass-gold px-10 py-4 caption text-brass-gold hover:bg-brass-gold hover:text-warm-ivory transition-all duration-500"
            >
              Explore the Collection
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/about"
              className="caption text-white/70 hover:text-white transition-colors duration-300"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="tiny">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. BRAND PHILOSOPHY — Editorial spread
          ═══════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-8 md:px-12 py-section" data-animate="fade-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
          <div className="space-y-8 max-w-lg">
            <p className="micro tracking-[0.15em] text-brass-gold">
              Our Philosophy
            </p>
            <h2 className="heading-xl text-ink leading-[1.05]">
              Crafted for those who notice the details
            </h2>
            <div className="w-16 h-px bg-brass-gold" />
            <div className="space-y-5">
              <p className="body text-dark leading-relaxed">
                Every Lumière candle begins with a single question: what makes a
                space feel complete? We believe it is not merely fragrance, but
                intention — the quiet ritual of striking a match, watching the flame
                settle, and letting the scent unfold naturally.
              </p>
              <p className="body text-muted leading-relaxed">
                Our candles are hand-poured in small batches using 100% natural soy
                wax, cotton wicks, and phthalate-free fragrance oils. No dyes, no
                shortcuts, no compromises. Just the purest expression of craft.
              </p>
            </div>
          </div>
          <div data-animate="image-reveal" className="relative overflow-hidden">
            <img
              src="/product-detail.png"
              alt="Lumière candle in a calm interior setting"
              className="w-full h-[550px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-soft-cream/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. FEATURED COLLECTION — Curated showcase
          ═══════════════════════════════════════════ */}
      <section className="bg-warm-sand py-section">
        <div className="mx-auto max-w-7xl px-8 md:px-12">
          <div className="text-center mb-16">
            <p className="micro tracking-[0.15em] text-brass-gold">
              Curated Selection
            </p>
            <h2 className="heading-xl text-ink mt-4 leading-[1.05]">
              Signature Fragrances
            </h2>
            <div className="mx-auto mt-6 w-16 h-px bg-brass-gold" />
            <p className="mt-6 body text-muted max-w-lg mx-auto leading-relaxed">
              A carefully edited collection of our most beloved scents — each one
              designed to transform the atmosphere of any room.
            </p>
          </div>

          {featuredApi.loading ? (
            <ProductGridSkeleton count={4} />
          ) : featuredApi.error ? (
            <div className="py-16 text-center body text-muted">
              <p>Unable to load products at this time.</p>
              <Link to="/collections" className="mt-4 inline-block text-brass-gold caption tracking-[0.15em] hover:underline">
                Browse all products
              </Link>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4"
              data-animate="stagger"
            >
              {signatureProducts.length > 0 ? (
                signatureProducts.map((product) => (
                  <div key={product.id} data-animate-child>
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center body text-muted py-12">
                  No featured products available.
                </p>
              )}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              to="/collections"
              className="group inline-flex items-center gap-2 border border-brass-gold px-10 py-3.5 caption text-brass-gold hover:bg-brass-gold hover:text-warm-ivory transition-all duration-500"
            >
              View All Products
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. BEST SELLERS — Editorial product grid
          ═══════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-8 md:px-12 py-section" data-animate="fade-up">
        <div className="text-center mb-16">
          <p className="micro tracking-[0.15em] text-brass-gold">
            Most Loved
          </p>
          <h2 className="heading-xl text-ink mt-4 leading-[1.05]">
            Bestsellers
          </h2>
          <div className="mx-auto mt-6 w-16 h-px bg-brass-gold" />
        </div>

        {featuredApi.loading ? (
          <ProductGridSkeleton count={4} />
        ) : bestsellerProducts.length > 0 ? (
          <div
            className="grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4"
            data-animate="stagger"
          >
            {bestsellerProducts.map((product) => (
              <div key={product.id} data-animate-child>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center body text-muted">
            <p>No products to show yet.</p>
            <Link to="/collections" className="mt-4 inline-block text-brass-gold caption tracking-[0.15em] hover:underline">
              Browse our collection
            </Link>
          </div>
        )}

        {/* Editorial pull-quote between sections */}
        <div className="mt-24 text-center">
          <div className="section-separator max-w-2xl mx-auto mb-12" />
          <p className="pull-quote max-w-2xl mx-auto text-muted">
            "A candle is not merely an object. It is an atmosphere, a memory, a
            quiet insistence on beauty in the everyday."
          </p>
          <div className="section-separator max-w-2xl mx-auto mt-12" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. CRAFTSMANSHIP — Artisan process feature
          ═══════════════════════════════════════════ */}
      <section className="bg-deep-charcoal py-section" data-animate="fade-up">
        <div className="mx-auto max-w-7xl px-8 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
          <div data-animate="image-reveal" className="order-2 md:order-1 overflow-hidden">
            <img
              src="/golden-hour.png"
              alt="Hand-pouring soy wax into a candle vessel"
              className="w-full h-[500px] object-cover"
            />
          </div>
          <div className="space-y-8 max-w-lg order-1 md:order-2">
            <p className="micro tracking-[0.15em] text-brass-gold">
              Craftsmanship
            </p>
            <h2 className="heading-xl text-white leading-[1.05]">
              Made by hand,<br />
              <span className="text-brass-gold">with care</span>
            </h2>
            <div className="w-16 h-px bg-brass-gold" />
            <div className="space-y-5">
              <p className="body text-white/70 leading-relaxed">
                Each candle is hand-poured in our studio, with every batch
                tested for an even burn, optimal scent throw, and a clean
                finish. We source our soy wax from non-GMO suppliers and our
                fragrance oils from houses that share our commitment to
                transparency.
              </p>
              <p className="body text-white/50 leading-relaxed">
                The result is a candle that burns evenly, fills a room without
                overwhelming it, and looks at home on any surface — from a
                minimalist concrete shelf to an heirloom wooden table.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. TESTIMONIALS — Social proof
          ═══════════════════════════════════════════ */}
      <section className="py-section" data-animate="fade-up">
        <div className="mx-auto max-w-6xl px-8 md:px-12">
          <div className="text-center mb-16">
            <p className="micro tracking-[0.15em] text-brass-gold">
              What Our Customers Say
            </p>
            <h2 className="heading-xl text-ink mt-4 leading-[1.05]">
              Loved by those who know
            </h2>
            <div className="mx-auto mt-6 w-16 h-px bg-brass-gold" />
          </div>

          {/* Featured testimonial */}
          <blockquote className="text-center max-w-3xl mx-auto mb-20">
            <p className="pull-quote text-ink">
              &ldquo;The Midnight Oud candle has become an evening ritual. It
              fills the room without shouting — exactly what I wanted.&rdquo;
            </p>
            <div className="mt-8 w-12 h-px bg-brass-gold mx-auto" />
            <p className="mt-6 caption text-dark tracking-[0.12em]">
              — Priya S., Mumbai
            </p>
          </blockquote>

          {/* Secondary testimonials grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                quote: "The quality is evident from the first burn. Clean, even, and the scent lasts beautifully.",
                author: "Ananya R.",
                location: "Delhi",
              },
              {
                quote: "I gifted the Golden Hour set to three friends. All of them asked where I found it.",
                author: "Vikram P.",
                location: "Bangalore",
              },
              {
                quote: "Finally, a candle that looks as good as it smells. The packaging alone is a statement.",
                author: "Maya K.",
                location: "Pune",
              },
            ].map(({ quote, author, location }) => (
              <div key={author} className="text-center space-y-4">
                <p className="body text-dark leading-relaxed italic">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="w-10 h-px bg-brass-gold/40 mx-auto" />
                <div>
                  <p className="caption text-dark tracking-[0.1em]">{author}</p>
                  <p className="text-[11px] text-muted tracking-wider mt-1">{location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </PageTransition>
  );
}
