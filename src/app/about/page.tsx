import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About Us", description: "DOFT comes from the German word Düft — experiencing the world through smell." };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl">Our Story</h1>
      <div className="mt-8 space-y-6">
        <p className="text-lg leading-relaxed text-text-light"><strong className="text-text">DOFT</strong> comes from the German word, <em>Düft</em>, which translates as experiencing the world through smell.</p>
        <p className="text-lg leading-relaxed text-text-light">Doft brings you sensuous natural fragrances, handcrafted in timeless glass, that ignite a personal memory of a moment gone by.</p>
        <p className="text-lg leading-relaxed text-text-light">Each candle is hand-poured with the finest natural waxes and infused with carefully sourced fragrance oils. Our timeless glass vessels are designed to be kept and cherished long after the final flame.</p>
        <blockquote className="my-8 border-l-4 border-gold pl-6 text-lg italic text-text-light">&ldquo;We believe scent has the power to transport you to a moment, a memory, a feeling — and that's what DOFT is all about.&rdquo;</blockquote>
        <h2 className="mt-12 font-heading text-2xl font-bold text-primary">Our Craft</h2>
        <p className="text-lg leading-relaxed text-text-light">Every DOFT product is handcrafted in small batches. We use only natural waxes, lead-free cotton wicks, and premium fragrance oils.</p>
        <h2 className="mt-12 font-heading text-2xl font-bold text-primary">Sustainability</h2>
        <p className="text-lg leading-relaxed text-text-light">We are committed to sustainable practices. Our glass vessels are reusable, our packaging is recyclable, and we source ingredients responsibly.</p>
      </div>
      <div className="mt-12"><Link href="/collections/bestsellers" className="bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-accent">Explore Our Collection</Link></div>
    </div>
  );
}
