import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: ProductPageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product Not Found" };

  const images: string[] = JSON.parse(product.images);
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.title} | DOFT`,
      description: product.description.slice(0, 160),
      type: "website",
      images: images[0] ? [{ url: images[0], width: 800, height: 800 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description.slice(0, 160),
      images: images[0] ? [images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });

  if (!product) notFound();

  const images: string[] = JSON.parse(product.images);
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://doftcandles.com";

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product, product.variants)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: baseUrl },
              { name: "Products", url: `${baseUrl}/collections/bestsellers` },
              { name: product.title, url: `${baseUrl}/products/${product.slug}` },
            ]),
          ),
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-text-muted" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="hover:text-primary">Home</a></li>
            <li className="text-border">/</li>
            <li><a href="/collections/bestsellers" className="hover:text-primary">Shop</a></li>
            <li className="text-border">/</li>
            <li className="text-text">{product.title}</li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          <ProductGallery images={images} title={product.title} />
          <ProductInfo product={product} variants={product.variants} />
        </div>
      </div>
    </>
  );
}
