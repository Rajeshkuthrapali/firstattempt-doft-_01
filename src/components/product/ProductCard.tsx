import Image from "next/image";
import Link from "next/link";
import type { Product, Variant } from "@prisma/client";
import { WishlistToggle } from "@/components/wishlist/WishlistToggle";

interface ProductCardProps {
  product: Product;
  variant: Variant;
}

export function ProductCard({ product, variant }: ProductCardProps) {
  const images: string[] = JSON.parse(product.images);
  const primaryImage = images[0] ?? "";
  const hoverImage = images[1] ?? primaryImage;

  return (
    <div className="group relative">
      <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <WishlistToggle productId={product.id} />
      </div>
      <Link href={`/products/${product.slug}`} className="flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-bg-secondary">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
            loading="lazy"
          />
          <Image
            src={hoverImage}
            alt={`${product.title} alternate`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
            loading="lazy"
          />
          <span className="absolute bottom-3 left-3 bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {product.scentFamily}
          </span>
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-primary/95 py-3 text-center text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
            Quick View
          </div>
        </div>
        <div className="mt-4 text-center">
          <h3 className="font-heading text-sm font-normal leading-snug transition-colors duration-300 group-hover:text-primary">
            {product.title}
          </h3>
          <p className="mt-1.5 text-sm font-bold text-primary">
            ${variant.price.toFixed(2)}
          </p>
        </div>
      </Link>
    </div>
  );
}
