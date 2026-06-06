"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2 } from "lucide-react";
import type { Product, Variant } from "@prisma/client";

export default function WishlistPage() {
  const [items, setItems] = useState<
    { productId: string; product: Product & { variants: Variant[] } }[]
  >([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function f() {
      try {
        const res = await fetch("/api/wishlist");
        if (res.ok) setItems(await res.json());
      } finally {
        setLoading(false);
      }
    }
    f();
  }, []);
  async function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
  }
  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 font-heading text-3xl font-bold text-primary">
        My Wishlist
      </h1>
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Heart size={48} className="mb-4 text-border" />
          <p className="text-lg text-text-muted">Your wishlist is empty</p>
          <Link
            href="/collections/bestsellers"
            className="mt-6 bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-accent"
          >
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ product }) => {
            const images: string[] = JSON.parse(product.images);
            const variant = product.variants[0];
            return (
              <div key={product.id} className="group relative">
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-accent shadow-sm hover:scale-110"
                  aria-label="Remove from wishlist"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
                <Link
                  href={`/products/${product.slug}`}
                  className="flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-bg-secondary">
                    <Image
                      src={images[0] ?? ""}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="font-heading text-sm">{product.title}</h3>
                    {variant && (
                      <p className="mt-1.5 text-sm font-bold text-primary">
                        ${variant.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
