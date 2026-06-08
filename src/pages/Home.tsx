import { useEffect } from "react";
import { api } from "../lib/api/client";
import { useApi } from "../lib/hooks/useApi";
import ProductCard from "../components/ProductCard";
import type { ProductSummary, PaginatedResponse } from "../types/catalog";

/**
 * Home page for the Lumière candle store.
 * Matches the reference: full-width hero with calligraphic headline,
 * product grid, bestsellers section, value props strip, and
 * a "Clean Burning" brand story section.
 *
 * GSAP scroll animations are applied via data-animate attributes
 * (handled by LayoutShell's initScrollAnimations).
 */
export default function Home() {
  const featuredApi = useApi<ProductSummary[]>(
    () => api.get<PaginatedResponse<ProductSummary>>("/api/products/featured"),
    [],
  );

  useEffect(() => {
    featuredApi.execute();
  }, [featuredApi.execute]);

  const signatureProducts = (featuredApi.data ?? []).slice(0, 4);
  const bestsellerProducts = (featuredApi.data ?? []).slice(0, 3);

  return (
    <>
      {/* ── Hero Section ────────────────────────── */}
      <section
        id="hero"
        className="relative overflow-hidden"
        aria-label="Hero banner"
      >
        <div className="relative h-[75vh] min-h-[500px] max-h-[800px]">
          {/* Background image */}
          <img
            src="/hero-candle.png"
            alt="Signature scented candle collection by Lumière"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2d2926]/50 via-[#2d2926]/25 to-transparent" />

          {/* Hero copy */}
          <div className="relative flex h-full flex-col justify-center px-8 md:px-16 lg:px-24 max-w-3xl">
            <p className="animate-fade-in text-[11px] uppercase tracking-[0.35em] text-white/80">
              Handcrafted Luxury
            </p>
            <h1 className="animate-slide-up mt-4 font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,7vw,5rem)] italic font-light leading-[1.1] text-white">
              signature
              <br />
              <span className="not-italic font-medium tracking-[0.04em]">
                Scented Collection
              </span>
            </h1>
            <p className="animate-fade-in delay-300 mt-5 max-w-md text-[14px] leading-relaxed text-white/75">
              Discover our curated range of naturally scented candles —
              hand-poured with 100% soy wax for a clean, luxurious burn.
            </p>
            <a
              href="#collection"
              className="animate-fade-in delay-500 mt-8 inline-flex w-fit items-center gap-2 border border-white/60 bg-white/10 px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-[#2d2926]"
            >
              Shop Now
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── New Arrivals Grid ────────────────────── */}
      <section
        id="collection"
        className="mx-auto max-w-7xl px-6 py-16 md:py-24"
        data-animate="fade-up"
      >
        <div className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c4a093]">
            New Arrivals
          </p>
          <h2 className="mt-2 font-['Cormorant_Garamond',serif] text-[32px] md:text-[40px] font-medium text-[#2d2926]">
            Signature Fragrances
          </h2>
          <div className="mx-auto mt-3 h-px w-12 bg-[#c4a093]" />
        </div>

        {featuredApi.loading ? (
          <div className="py-12 text-center text-sm text-[#9a8d82]">Loading...</div>
        ) : featuredApi.error ? (
          <div className="py-12 text-center text-sm text-[#9a8d82]">
            Unable to load products.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
            {signatureProducts.map((product) => (
              <div key={product.id} data-animate="scale-in">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center" data-animate="fade-up">
          <a
            href="#"
            className="inline-block border border-[#c4a093] px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#c4a093] transition-all duration-300 hover:bg-[#c4a093] hover:text-white"
          >
            View All Products
          </a>
        </div>
      </section>

      {/* ── Lifestyle Banner ─────────────────────── */}
      <section
        className="relative h-[50vh] min-h-[350px] overflow-hidden"
        aria-label="Lifestyle imagery and brand quote"
        data-animate="scale-in"
      >
        <img
          src="/product-detail.png"
          alt="Lifestyle candle setting"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#2d2926]/30" />
        <div className="relative flex h-full flex-col items-center justify-center text-center px-6">
          <p className="font-['Cormorant_Garamond',serif] text-[clamp(1.8rem,5vw,3.5rem)] italic font-light text-white leading-snug">
            &ldquo;allow for first scent of love&rdquo;
          </p>
          <a
            href="#"
            className="mt-6 bg-[#c4a093] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a8877b]"
          >
            Shop Bestsellers
          </a>
        </div>
      </section>

      {/* ── Bestsellers Section ──────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24" data-animate="fade-up">
        <div className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c4a093]">
            Most Loved
          </p>
          <h2 className="mt-2 font-['Cormorant_Garamond',serif] text-[32px] md:text-[40px] font-medium text-[#2d2926]">
            Bestsellers
          </h2>
          <div className="mx-auto mt-3 h-px w-12 bg-[#c4a093]" />
        </div>

        {bestsellerProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5">
            {bestsellerProducts.map((product) => (
              <div key={product.id} data-animate="fade-up">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          !featuredApi.loading && (
            <div className="py-8 text-center text-sm text-[#9a8d82]">
              No products to show yet.
            </div>
          )
        )}
      </section>

      {/* ── Value Props Strip ────────────────────── */}
      <section
        className="bg-[#f3ece4] border-y border-[#e8e0d8]"
        aria-label="Brand values"
      >
        <div
          className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-14 sm:grid-cols-3 text-center"
          data-animate="stagger"
        >
          {[
            {
              icon: (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c4a093"
                  strokeWidth={1.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
                  />
                </svg>
              ),
              title: "Hand-Poured",
              desc: "Crafted in small batches for unmatched quality & consistency.",
            },
            {
              icon: (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8b9e7e"
                  strokeWidth={1.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12.75 3.03v.568c0 2.849.274 5.695.82 8.493l.004.013a5.036 5.036 0 0 1-2.224 4.766c-1.065.691-2.285 1.052-3.534 1.123a47.5 47.5 0 0 0 0 2.014M12 21a8.966 8.966 0 0 0 5.657-2m-5.657 2a8.966 8.966 0 0 1-5.657-2M12 21v-7.5"
                  />
                </svg>
              ),
              title: "100% Natural Soy",
              desc: "Pure soy wax, cotton wicks & phthalate-free fragrance oils.",
            },
            {
              icon: (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c4a093"
                  strokeWidth={1.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18"
                  />
                </svg>
              ),
              title: "Gift-Ready",
              desc: "Premium packaging — perfect for gifting someone special.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-3" data-animate-child>
              {icon}
              <h3 className="font-['Cormorant_Garamond',serif] text-[18px] font-semibold text-[#2d2926]">
                {title}
              </h3>
              <p className="text-[13px] leading-relaxed text-[#6b5e54] max-w-[240px]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Clean Burning Section ────────────────── */}
      <section
        className="mx-auto max-w-4xl px-6 py-20 text-center"
        data-animate="fade-up"
      >
        <h2 className="font-['Cormorant_Garamond',serif] text-[28px] md:text-[36px] font-medium text-[#2d2926] leading-snug">
          Clean Burning so you can light
          <br />
          your candle responsibly
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-[14px] leading-relaxed text-[#6b5e54]">
          Lumière candles are 100% coconut, cruelty-free, plant-based, and
          contain no artificial dyes, ensuring the purest and cleanest
          fragrances. Our carefully curated ingredients ensure a cleaner burn
          and a more sustainable product, all beautifully presented in
          eco-conscious packaging.
        </p>
        <div className="mx-auto mt-6 h-px w-16 bg-[#c4a093]" />
      </section>
    </>
  );
}
