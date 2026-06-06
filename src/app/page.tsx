import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { organizationJsonLd } from "@/lib/seo/json-ld";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function HomePage() {
  const bestsellers = await prisma.product.findMany({
    where: {
      collections: {
        some: { collection: { slug: "bestsellers" } },
      },
    },
    include: { variants: true },
    take: 8,
  });

  return (
    <>
      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd()),
        }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center bg-gradient-to-br from-[#eaddd5] to-[#d4c4bc]">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <div className="animate-fade-in border border-white/20 bg-white/10 p-12 backdrop-blur-sm">
            <h1 className="font-heading text-5xl font-bold leading-tight text-primary md:text-6xl">
              Timeless Glass.
              <br />
              Sensuous Scents.
            </h1>
            <p className="mt-4 text-lg font-light text-text md:text-xl">
              Experience the world through smell.
            </p>
            <Link
              href="/collections/bestsellers"
              className="btn-luxury mt-8 inline-block bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-4xl font-bold">Bestsellers</h2>
          <p className="mt-2 text-lg italic text-text-light">
            Our most loved fragrances
          </p>
        </div>
        <div className="stagger-children grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              variant={product.variants[0]!}
            />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/collections/bestsellers"
            className="btn-luxury border border-primary px-8 py-3 text-sm font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-white"
          >
            View All Bestsellers
          </Link>
        </div>
      </section>

      {/* Story Section */}
      <section className="flex flex-col bg-surface lg:flex-row">
        <div className="flex flex-1 flex-col justify-center px-8 py-16 lg:px-20">
          <h2 className="font-heading text-4xl font-bold">Our Story</h2>
          <p className="mt-6 text-lg leading-relaxed text-text-light">
            DOFT comes from the German word, <em>Düft</em>, which translates as
            experiencing the world through smell.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-text-light">
            Doft brings you sensuous natural fragrances, handcrafted in timeless
            glass, that ignite a personal memory of a moment gone by.
          </p>
          <Link
            href="/about"
            className="btn-luxury mt-8 self-start border border-primary px-8 py-3 text-sm font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary hover:text-white"
          >
            Read Full Story
          </Link>
        </div>
        <div className="min-h-[400px] flex-1 bg-gradient-to-br from-[#d7ccc8] to-[#bcaaa4]" />
      </section>

      {/* Newsletter */}
      <section className="bg-bg-secondary px-6 py-20 text-center">
        <h2 className="font-heading text-3xl font-bold">Stay Connected</h2>
        <p className="mt-3 text-text-light">
          Subscribe to receive updates, access to exclusive deals, and more.
        </p>
        <form className="mx-auto mt-8 flex max-w-md gap-3">
          <input
            type="email"
            placeholder="Enter your email address"
            required
            className="flex-1 border border-border px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="btn-luxury bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent"
          >
            Subscribe
          </button>
        </form>
      </section>
    </>
  );
}
