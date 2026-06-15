import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Enrichment {
  fragranceFamily?: string;
  waxType?: string;
  description?: string;
  tagline?: string;
}

function inferFragrance(title: string): string {
  const t = title.toLowerCase();
  const floral = ["rose", "lavender", "jasmine", "lily", "peony", "sunflower", "daisy", "tulip", "cherry blossom", "magnolia", "orchid", "marigold", "lotus"];
  const fresh = ["lemon", "citrus", "orange", "lime", "mango", "pineapple", "berry", "cranberry", "mint", "eucalyptus", "ocean", "sea", "rain", "cucumber"];
  const warm = ["cinnamon", "coffee", "vanilla", "chocolate", "honey", "caramel", "coconut", "spice", "chai", "rum"];
  const woody = ["sandalwood", "cedar", "pine", "oak", "wood", "musk", "oud"];

  if (floral.some(k => t.includes(k))) return "Floral";
  if (fresh.some(k => t.includes(k))) return "Fresh";
  if (warm.some(k => t.includes(k))) return "Warm & Sweet";
  if (woody.some(k => t.includes(k))) return "Woody";
  return "Aromatic";
}

function inferWaxType(title: string): string | undefined {
  return title.toLowerCase().includes("beeswax") ? "Beeswax" : undefined;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { fragranceFamily: "Unknown" },
    include: { collections: { include: { collection: true } } },
  });

  console.log(`Found ${products.length} products to enrich.`);

  for (const product of products) {
    const collectionTitle = product.collections[0]?.collection?.title ?? "Artisan Collection";
    const t = product.title;
    const fragranceFamily = inferFragrance(t);
    const waxType = inferWaxType(t);
    const description = product.description ?? `A handcrafted ${t.toLowerCase()} from our ${collectionTitle.toLowerCase()}. Made with care using premium materials for a clean, even burn.`;
    const tagline = product.tagline || (t.length > 40 ? t : `${t} — a Lumière original`);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        fragranceFamily,
        ...(waxType ? { waxType } : {}),
        description,
        tagline,
      },
    });

    console.log(`  ✅ ${t}: fragranceFamily=${fragranceFamily}${waxType ? `, waxType=${waxType}` : ""}`);
  }

  const remaining = await prisma.product.count({ where: { fragranceFamily: "Unknown" } });
  console.log(`\nDone! Remaining with "Unknown" fragrance: ${remaining}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
