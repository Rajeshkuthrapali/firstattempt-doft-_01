import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterBar } from "@/components/product/FilterBar";
import { collectionJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata(
  { params }: CollectionPageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const collection = await prisma.collection.findUnique({ where: { slug } });
  if (!collection) return { title: "Collection Not Found" };

  return {
    title: collection.title,
    description: collection.description || `Shop the ${collection.title} collection at DOFT Candles.`,
    openGraph: {
      title: `${collection.title} | DOFT`,
      description: collection.description || `Shop the ${collection.title} collection.`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${collection.title} | DOFT`,
      description: collection.description || `Shop the ${collection.title} collection.`,
    },
  };
}

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;

  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          product: {
            include: { variants: true },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!collection) notFound();

  let products = collection.products.map((cp) => cp.product);

  if (sort === "price-asc") {
    products = products.sort(
      (a, b) => (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0),
    );
  } else if (sort === "price-desc") {
    products = products.sort(
      (a, b) => (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0),
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://doftcandles.com";

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            collectionJsonLd(
              collection.title,
              collection.slug,
              collection.description,
              products.length,
            ),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: baseUrl },
              { name: collection.title, url: `${baseUrl}/collections/${collection.slug}` },
            ]),
          ),
        }}
      />

      {/* Collection Header */}
      <section className="bg-bg-secondary py-16 text-center">
        <h1 className="font-heading text-4xl font-bold text-primary md:text-5xl">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mt-3 text-lg italic text-text-light">
            {collection.description}
          </p>
        )}
      </section>

      <FilterBar productCount={products.length} />

      <section className="mx-auto max-w-7xl px-6 py-12">
        {products.length === 0 ? (
          <p className="py-20 text-center text-text-muted">
            No products found in this collection.
          </p>
        ) : (
          <div className="stagger-children grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant={product.variants[0]!}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
