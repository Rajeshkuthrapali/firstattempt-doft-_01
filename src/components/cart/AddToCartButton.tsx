"use client";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import type { Product, Variant } from "@prisma/client";

interface AddToCartButtonProps { product: Product; variant: Variant; }

export function AddToCartButton({ product, variant }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const disabled = variant.stock <= 0;

  function handle() {
    if (disabled) return;
    const images: string[] = JSON.parse(product.images);
    addItem({
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      image: images[0] ?? "",
      slug: product.slug,
      maxStock: variant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button onClick={handle} disabled={disabled}
      className={`btn-luxury flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-widest transition-all ${disabled ? "cursor-not-allowed bg-border text-text-muted" : added ? "bg-green-600 text-white" : "bg-primary text-white hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg"}`}>
      {disabled ? "Out of Stock" : added ? (<><Check size={16} /> Added!</>) : (<><ShoppingBag size={16} /> Add to Cart</>)}
    </button>
  );
}
