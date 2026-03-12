import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Collections
  const bestsellers = await prisma.collection.upsert({ where: { slug: "bestsellers" }, update: {}, create: { title: "Bestsellers", slug: "bestsellers", description: "Our most loved fragrances" } });
  const freshCitrusy = await prisma.collection.upsert({ where: { slug: "fresh-citrusy" }, update: {}, create: { title: "Fresh & Citrusy", slug: "fresh-citrusy", description: "Bright and invigorating scents" } });
  const floralAromatic = await prisma.collection.upsert({ where: { slug: "floral-aromatic" }, update: {}, create: { title: "Floral & Aromatic", slug: "floral-aromatic", description: "Elegant and romantic fragrances" } });

  // Products
  const products = [
    { title: "Signature Trio Wax Tablets", slug: "signature-trio-wax-tablets", description: "A set of three handcrafted wax tablets featuring our signature scent blends.", scentFamily: "Opulent & Warm", images: JSON.stringify(["https://images.unsplash.com/photo-1602874801007-b43d0fbd6cbb?w=800"]), variants: [{ sku: "SIG-TRIO-001", title: "Set of 3", price: 38.00, stock: 50 }] },
    { title: "Rose Mini Bowl Candle", slug: "rose-mini-bowl-candle", description: "A delicate mini bowl candle infused with English Rose.", scentFamily: "Floral & Aromatic", images: JSON.stringify(["https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=800"]), variants: [{ sku: "ROSE-MINI-001", title: "Single", price: 22.00, stock: 80 }, { sku: "ROSE-MINI-SET", title: "Set of 3", price: 58.00, stock: 20 }] },
    { title: "Lemon Verbena Reed Diffuser", slug: "lemon-verbena-reed-diffuser", description: "Crisp, clean lemon verbena for effortless freshness.", scentFamily: "Fresh & Citrusy", images: JSON.stringify(["https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800"]), variants: [{ sku: "LEM-DIFF-001", title: "200ml", price: 45.00, stock: 35 }] },
    { title: "Oud & Amber Luxury Candle", slug: "oud-amber-luxury-candle", description: "Rich oud and warm amber in our signature glass.", scentFamily: "Opulent & Warm", images: JSON.stringify(["https://images.unsplash.com/photo-1608181831688-ba943fb1b264?w=800"]), variants: [{ sku: "OUD-AMB-001", title: "Standard", price: 65.00, stock: 25 }] },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { title: p.title, slug: p.slug, description: p.description, scentFamily: p.scentFamily, images: p.images },
    });
    for (const v of p.variants) {
      await prisma.variant.upsert({ where: { sku: v.sku }, update: {}, create: { productId: product.id, ...v } });
    }
    await prisma.collectionProduct.upsert({ where: { collectionId_productId: { collectionId: bestsellers.id, productId: product.id } }, update: {}, create: { collectionId: bestsellers.id, productId: product.id, sortOrder: 0 } });
  }

  console.log("✅ Database seeded successfully!");
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
