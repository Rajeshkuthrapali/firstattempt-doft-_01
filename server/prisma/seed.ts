import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds the database with sample data for development and E2E testing.
 */
async function main(): Promise<void> {
  console.log("🌱 Seeding database...");

  // -----------------------------------------------------------------------
  // Collections
  // -----------------------------------------------------------------------
  const bestsellers = await prisma.collection.upsert({
    where: { slug: "bestsellers" },
    update: {},
    create: {
      id: "seed-coll-001",
      title: "Bestsellers",
      slug: "bestsellers",
      description: "Our most loved candles",
      sortOrder: 1,
    },
  });

  const cosmicCollection = await prisma.collection.upsert({
    where: { slug: "the-cosmic-collection" },
    update: {},
    create: {
      id: "seed-coll-002",
      title: "The Cosmic Collection",
      slug: "the-cosmic-collection",
      description: "Inspired by celestial energies",
      sortOrder: 2,
    },
  });

  // -----------------------------------------------------------------------
  // Categories
  // -----------------------------------------------------------------------
  const bowlCategory = await prisma.category.upsert({
    where: { slug: "bowls-jars" },
    update: {},
    create: {
      id: "seed-cat-001",
      name: "Bowls, Jars & Trays",
      slug: "bowls-jars",
    },
  });

  // -----------------------------------------------------------------------
  // Products & Variants
  // -----------------------------------------------------------------------
  const product1 = await prisma.product.upsert({
    where: { slug: "rose-mini-bowl-candle" },
    update: {},
    create: {
      id: "seed-prod-001",
      title: "Rose Mini Bowl Candle | English Rose",
      slug: "rose-mini-bowl-candle",
      description:
        "A delicate bowl candle handcrafted with English Rose fragrance.",
      images: [
        "/images/rose-mini-bowl-1.webp",
        "/images/rose-mini-bowl-2.webp",
      ],
      fragranceFamily: "Floral & Aromatic",
      variants: {
        create: [
          {
            id: "seed-variant-001",
            color: "Pink",
            size: "Mini",
            fragrance: "English Rose",
            weight: "150g",
            priceCents: 149900, // ₹1,499
            compareAtPrice: 179900,
            stock: 50,
            sku: "ROSE-MINI-BOWL-PNK",
          },
          {
            id: "seed-variant-002",
            color: "White",
            size: "Mini",
            fragrance: "English Rose",
            weight: "150g",
            priceCents: 149900,
            stock: 30,
            sku: "ROSE-MINI-BOWL-WHT",
          },
        ],
      },
      collections: {
        create: [{ collectionId: bestsellers.id }],
      },
      categories: {
        create: [{ categoryId: bowlCategory.id }],
      },
    },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: "cosmic-candle-sage-cleanse" },
    update: {},
    create: {
      id: "seed-prod-002",
      title: "Cosmic Candle | Olive Green | Sage Cleanse",
      slug: "cosmic-candle-sage-cleanse",
      description:
        "Part of the Cosmic collection, this candle blends sage and eucalyptus.",
      images: ["/images/cosmic-sage-1.webp"],
      fragranceFamily: "Woody & Earthy",
      variants: {
        create: [
          {
            id: "seed-variant-003",
            color: "Olive Green",
            size: "Medium",
            fragrance: "Sage Cleanse",
            weight: "300g",
            priceCents: 249900, // ₹2,499
            stock: 25,
            sku: "COSMIC-SAGE-M-GRN",
          },
          {
            id: "seed-variant-004",
            color: "Olive Green",
            size: "Large",
            fragrance: "Sage Cleanse",
            weight: "500g",
            priceCents: 399900, // ₹3,999
            compareAtPrice: 449900,
            stock: 15,
            sku: "COSMIC-SAGE-L-GRN",
          },
        ],
      },
      collections: {
        create: [
          { collectionId: cosmicCollection.id },
          { collectionId: bestsellers.id },
        ],
      },
    },
  });

  // -----------------------------------------------------------------------
  // Promo Codes
  // -----------------------------------------------------------------------
  await prisma.promoCode.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      id: "seed-promo-001",
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      startsAt: new Date("2025-01-01"),
      expiresAt: new Date("2027-12-31"),
      usageLimit: 10000,
      timesUsed: 0,
      applicableCollections: [],
      active: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: "FLAT500" },
    update: {},
    create: {
      id: "seed-promo-002",
      code: "FLAT500",
      type: "FIXED",
      value: 50000, // ₹500
      minOrderCents: 200000, // min ₹2,000
      startsAt: new Date("2025-01-01"),
      expiresAt: new Date("2027-12-31"),
      usageLimit: 500,
      timesUsed: 0,
      applicableCollections: [],
      active: true,
    },
  });

  // -----------------------------------------------------------------------
  // Admin User
  // -----------------------------------------------------------------------
  await prisma.user.upsert({
    where: { email: "admin@doftcandles.com" },
    update: {},
    create: {
      id: "seed-user-admin",
      email: "admin@doftcandles.com",
      // WARNING: In production, use bcrypt-hashed passwords
      passwordHash: "$2a$12$placeholder_hash_replace_in_production",
      name: "Doft Admin",
      role: "ADMIN",
    },
  });

  console.log("✅ Seed complete!");
  console.log("   Products:", product1.title, "|", product2.title);
  console.log("   Promo codes: WELCOME10, FLAT500");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
