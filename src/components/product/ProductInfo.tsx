import { useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

interface ProductInfoProps {
  product: {
    id: string;
    title: string;
    description: string;
    scentFamily: string;
    images: string;
    slug: string;
  };
  variants: Array<{
    id: string;
    title: string;
    price: number;
    stock: number;
  }>;
}

export function ProductInfo({ product, variants }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  return (
    <div className="flex flex-col justify-center">
      <span className="mb-4 self-start bg-bg-secondary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
        {product.scentFamily}
      </span>
      <h1 className="font-heading text-3xl font-bold leading-tight text-primary md:text-4xl">
        {product.title}
      </h1>
      <p className="mt-4 text-2xl font-bold text-primary">
        ${selectedVariant.price.toFixed(2)}
      </p>
      <p className="mt-6 leading-relaxed text-text-light">
        {product.description}
      </p>
      {variants.length > 1 && (
        <div className="mt-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider">
            Options
          </p>
          <div className="flex flex-wrap gap-3">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={`border px-5 py-2.5 text-sm transition-all ${selectedVariant.id === v.id ? "border-primary bg-primary text-white" : "border-border text-text hover:border-primary"}`}
              >
                {v.title} — ${v.price.toFixed(2)}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="mt-6 text-sm text-text-muted">
        {selectedVariant.stock > 0
          ? `${selectedVariant.stock} in stock`
          : "Out of stock"}
      </p>
      <div className="mt-6">
        <AddToCartButton product={product} variant={selectedVariant} />
      </div>
      <div className="mt-10 space-y-3 border-t border-border pt-6 text-sm text-text-muted">
        <p>✦ Hand-poured with natural fragrances</p>
        <p>✦ Free shipping on orders over $50</p>
        <p>✦ Gift-ready packaging included</p>
      </div>
    </div>
  );
}
