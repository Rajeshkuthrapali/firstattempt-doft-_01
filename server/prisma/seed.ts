import { PrismaClient, UserRole, PromoType, OrderStatus, PaymentGateway, PaymentStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ---------------------------------------------------------------------------
  // Clean existing data in reverse dependency order
  // ---------------------------------------------------------------------------
  console.log("  Cleaning existing data...");
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.address.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productCollection.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------
  console.log("  Creating users...");
  const passwordHash = await bcrypt.hash("password123", 12);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@lumiere.com",
      passwordHash,
      name: "Admin User",
      role: UserRole.ADMIN,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "customer@test.com",
      passwordHash,
      name: "Test Customer",
      role: UserRole.CUSTOMER,
    },
  });

  // ---------------------------------------------------------------------------
  // Address for customer
  // ---------------------------------------------------------------------------
  console.log("  Creating addresses...");
  await prisma.address.create({
    data: {
      userId: customerUser.id,
      label: "Home",
      line1: "123 Candles Lane",
      line2: "Apartment 4B",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "IN",
      phone: "+919876543210",
      isDefault: true,
    },
  });

  // ---------------------------------------------------------------------------
  // Collections
  // ---------------------------------------------------------------------------
  console.log("  Creating collections...");
  const signatureCollection = await prisma.collection.create({
    data: { title: "Signature Collection", slug: "signature-collection", description: "Our signature hand-poured candles made with premium soy wax.", sortOrder: 1 },
  });
  const seasonalCollection = await prisma.collection.create({
    data: { title: "Seasonal", slug: "seasonal", description: "Limited edition candles inspired by the seasons.", sortOrder: 2 },
  });
  const giftSetsCollection = await prisma.collection.create({
    data: { title: "Gift Sets", slug: "gift-sets", description: "Curated candle gift sets for every occasion.", sortOrder: 3 },
  });

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------
  console.log("  Creating categories...");
  const floral = await prisma.category.create({ data: { name: "Floral", slug: "floral" } });
  const woody = await prisma.category.create({ data: { name: "Woody", slug: "woody" } });
  const fresh = await prisma.category.create({ data: { name: "Fresh", slug: "fresh" } });
  const gourmand = await prisma.category.create({ data: { name: "Gourmand", slug: "gourmand" } });
  const citrus = await prisma.category.create({ data: { name: "Citrus", slug: "citrus" } });

  // ---------------------------------------------------------------------------
  // Products with Variants
  // ---------------------------------------------------------------------------
  console.log("  Creating products and variants...");

  // Product 1: Lavender Serenity
  const product1 = await prisma.product.create({
    data: {
      title: "Lavender Serenity",
      slug: "lavender-serenity",
      description: "A calming lavender blend with notes of chamomile and vanilla. Perfect for evening relaxation.",
      images: ["/images/lavender-serenity-1.jpg", "/images/lavender-serenity-2.jpg"],
      fragranceFamily: "Floral",
      categories: { create: [{ categoryId: floral.id }] },
      collections: { create: [{ collectionId: signatureCollection.id }] },
    },
  });
  await prisma.variant.createMany({
    data: [
      { productId: product1.id, size: "Small (150g)", priceCents: 599, compareAtPrice: 799, stock: 50, sku: "LAV-SML-150" },
      { productId: product1.id, size: "Medium (300g)", priceCents: 999, compareAtPrice: 1299, stock: 30, sku: "LAV-MED-300" },
      { productId: product1.id, size: "Large (500g)", priceCents: 1499, compareAtPrice: 1899, stock: 20, sku: "LAV-LRG-500" },
    ],
  });

  // Product 2: Cedar & Amber
  const product2 = await prisma.product.create({
    data: {
      title: "Cedar & Amber",
      slug: "cedar-amber",
      description: "Warm cedarwood blended with rich amber and a hint of sandalwood. An earthy, grounding scent.",
      images: ["/images/cedar-amber-1.jpg", "/images/cedar-amber-2.jpg"],
      fragranceFamily: "Woody",
      categories: { create: [{ categoryId: woody.id }] },
      collections: { create: [{ collectionId: signatureCollection.id }] },
    },
  });
  await prisma.variant.createMany({
    data: [
      { productId: product2.id, size: "Small (150g)", priceCents: 649, stock: 40, sku: "CED-SML-150" },
      { productId: product2.id, size: "Medium (300g)", priceCents: 1099, stock: 25, sku: "CED-MED-300" },
    ],
  });

  // Product 3: Ocean Breeze
  const product3 = await prisma.product.create({
    data: {
      title: "Ocean Breeze",
      slug: "ocean-breeze",
      description: "Fresh sea salt accord with white musk and delicate jasmine. Transport yourself to the coast.",
      images: ["/images/ocean-breeze-1.jpg", "/images/ocean-breeze-2.jpg"],
      fragranceFamily: "Fresh",
      categories: { create: [{ categoryId: fresh.id }] },
      collections: { create: [{ collectionId: seasonalCollection.id }] },
    },
  });
  await prisma.variant.createMany({
    data: [
      { productId: product3.id, size: "Small (150g)", priceCents: 549, stock: 60, sku: "OCN-SML-150" },
      { productId: product3.id, size: "Medium (300g)", priceCents: 949, stock: 35, sku: "OCN-MED-300" },
      { productId: product3.id, size: "Large (500g)", priceCents: 1399, stock: 15, sku: "OCN-LRG-500" },
    ],
  });

  // Product 4: Vanilla Bean Dream
  const product4 = await prisma.product.create({
    data: {
      title: "Vanilla Bean Dream",
      slug: "vanilla-bean-dream",
      description: "Rich Madagascan vanilla with undertones of caramel and brown sugar. A sweet, comforting warmth.",
      images: ["/images/vanilla-bean-1.jpg", "/images/vanilla-bean-2.jpg"],
      fragranceFamily: "Gourmand",
      categories: { create: [{ categoryId: gourmand.id }] },
      collections: { create: [{ collectionId: signatureCollection.id }] },
    },
  });
  await prisma.variant.createMany({
    data: [
      { productId: product4.id, size: "Small (150g)", priceCents: 699, stock: 45, sku: "VNL-SML-150" },
      { productId: product4.id, size: "Medium (300g)", priceCents: 1149, stock: 28, sku: "VNL-MED-300" },
    ],
  });

  // Product 5: Zesty Grapefruit
  const product5 = await prisma.product.create({
    data: {
      title: "Zesty Grapefruit",
      slug: "zesty-grapefruit",
      description: "Bright pink grapefruit with hints of lemon zest and bergamot. An energizing citrus burst.",
      images: ["/images/zesty-grapefruit-1.jpg", "/images/zesty-grapefruit-2.jpg"],
      fragranceFamily: "Citrus",
      categories: { create: [{ categoryId: citrus.id }] },
      collections: { create: [{ collectionId: seasonalCollection.id }] },
    },
  });
  await prisma.variant.createMany({
    data: [
      { productId: product5.id, size: "Small (150g)", priceCents: 549, stock: 55, sku: "GRP-SML-150" },
      { productId: product5.id, size: "Medium (300g)", priceCents: 949, stock: 30, sku: "GRP-MED-300" },
    ],
  });

  // Product 6: Midnight Rose
  const product6 = await prisma.product.create({
    data: {
      title: "Midnight Rose",
      slug: "midnight-rose",
      description: "Deep dark rose petals with blackcurrant and patchouli. A mysterious, romantic floral.",
      images: ["/images/midnight-rose-1.jpg", "/images/midnight-rose-2.jpg"],
      fragranceFamily: "Floral",
      categories: { create: [{ categoryId: floral.id }] },
      collections: { create: [{ collectionId: signatureCollection.id }] },
    },
  });
  await prisma.variant.createMany({
    data: [
      { productId: product6.id, size: "Small (150g)", priceCents: 749, stock: 35, sku: "ROS-SML-150" },
      { productId: product6.id, size: "Medium (300g)", priceCents: 1249, stock: 20, sku: "ROS-MED-300" },
    ],
  });

  // Product 7: Sandalwood Mystique
  const product7 = await prisma.product.create({
    data: {
      title: "Sandalwood Mystique",
      slug: "sandalwood-mystique",
      description: "Premium Mysore sandalwood with whispers of frankincense and myrrh. An exotic, spiritual aroma.",
      images: ["/images/sandalwood-1.jpg", "/images/sandalwood-2.jpg"],
      fragranceFamily: "Woody",
      categories: { create: [{ categoryId: woody.id }] },
      collections: { create: [{ collectionId: signatureCollection.id }] },
    },
  });
  await prisma.variant.createMany({
    data: [
      { productId: product7.id, size: "Small (150g)", priceCents: 849, stock: 25, sku: "SAN-SML-150" },
      { productId: product7.id, size: "Medium (300g)", priceCents: 1399, stock: 15, sku: "SAN-MED-300" },
    ],
  });

  // Product 8: Fresh Linen
  const product8 = await prisma.product.create({
    data: {
      title: "Fresh Linen",
      slug: "fresh-linen",
      description: "Crisp cotton and clean aldehydes with a touch of white flowers. Like sun-dried laundry on a summer day.",
      images: ["/images/fresh-linen-1.jpg", "/images/fresh-linen-2.jpg"],
      fragranceFamily: "Fresh",
      categories: { create: [{ categoryId: fresh.id }] },
      collections: { create: [{ collectionId: seasonalCollection.id }] },
    },
  });
  await prisma.variant.createMany({
    data: [
      { productId: product8.id, size: "Small (150g)", priceCents: 499, stock: 70, sku: "LIN-SML-150" },
      { productId: product8.id, size: "Medium (300g)", priceCents: 899, stock: 40, sku: "LIN-MED-300" },
      { productId: product8.id, size: "Large (500g)", priceCents: 1299, stock: 20, sku: "LIN-LRG-500" },
    ],
  });

  // Product 9: Honey & Tobacco
  const product9 = await prisma.product.create({
    data: {
      title: "Honey & Tobacco",
      slug: "honey-tobacco",
      description: "Rich pipe tobacco sweetened with wildflower honey and a touch of leather. Warm and sophisticated.",
      images: ["/images/honey-tobacco-1.jpg", "/images/honey-tobacco-2.jpg"],
      fragranceFamily: "Gourmand",
      categories: { create: [{ categoryId: gourmand.id }] },
      collections: { create: [{ collectionId: giftSetsCollection.id }] },
    },
  });
  await prisma.variant.createMany({
    data: [
      { productId: product9.id, size: "Small (150g)", priceCents: 799, stock: 30, sku: "HON-SML-150" },
      { productId: product9.id, size: "Medium (300g)", priceCents: 1349, stock: 18, sku: "HON-MED-300" },
    ],
  });

  // Product 10: Lemon & Basil
  const product10 = await prisma.product.create({
    data: {
      title: "Lemon & Basil",
      slug: "lemon-basil",
      description: "Sun-ripened lemons with fresh basil and a hint of mint. An uplifting, herbaceous citrus.",
      images: ["/images/lemon-basil-1.jpg", "/images/lemon-basil-2.jpg"],
      fragranceFamily: "Citrus",
      categories: { create: [{ categoryId: citrus.id }] },
      collections: { create: [{ collectionId: seasonalCollection.id }] },
    },
  });
  await prisma.variant.createMany({
    data: [
      { productId: product10.id, size: "Small (150g)", priceCents: 549, stock: 55, sku: "LEM-SML-150" },
      { productId: product10.id, size: "Medium (300g)", priceCents: 949, stock: 30, sku: "LEM-MED-300" },
    ],
  });

  // Product 11: Cozy Cashmere (Gift Set)
  const product11 = await prisma.product.create({
    data: {
      title: "Cozy Cashmere Gift Set",
      slug: "cozy-cashmere-gift-set",
      description: "A curated gift set featuring our Cashmere & Cedar, Vanilla Bean Dream, and Lavender Serenity candles in elegant packaging.",
      images: ["/images/cozy-cashmere-1.jpg", "/images/cozy-cashmere-2.jpg"],
      fragranceFamily: "Gourmand",
      categories: { create: [{ categoryId: gourmand.id }] },
      collections: { create: [{ collectionId: giftSetsCollection.id }] },
    },
  });
  await prisma.variant.createMany({
    data: [
      { productId: product11.id, size: "Gift Set (3 × 150g)", priceCents: 1999, compareAtPrice: 2599, stock: 15, sku: "CSH-GFT-3X150" },
      { productId: product11.id, size: "Gift Set (3 × 300g)", priceCents: 3499, compareAtPrice: 4499, stock: 10, sku: "CSH-GFT-3X300" },
    ],
  });

  // ---------------------------------------------------------------------------
  // Promo Codes
  // ---------------------------------------------------------------------------
  console.log("  Creating promo codes...");
  await prisma.promoCode.create({
    data: {
      code: "WELCOME10",
      type: PromoType.PERCENTAGE,
      value: 10,
      minOrderCents: 0,
      startsAt: new Date("2025-01-01"),
      expiresAt: new Date("2027-12-31"),
      usageLimit: 1000,
      timesUsed: 0,
      applicableCollections: [],
      active: true,
    },
  });

  await prisma.promoCode.create({
    data: {
      code: "FREESHIP",
      type: PromoType.FIXED,
      value: 0, // free shipping handled by the app checking minOrderCents
      minOrderCents: 50000, // Free shipping on orders over ₹500
      startsAt: new Date("2025-01-01"),
      expiresAt: new Date("2027-12-31"),
      usageLimit: null,
      timesUsed: 0,
      applicableCollections: [],
      active: true,
    },
  });

  // ---------------------------------------------------------------------------
  // Cart for customer (with 2 items)
  // ---------------------------------------------------------------------------
  console.log("  Creating cart with items...");
  const allVariants = await prisma.variant.findMany({ take: 2 });
  if (allVariants.length >= 2) {
    const cart = await prisma.cart.create({
      data: { userId: customerUser.id },
    });
    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId: allVariants[0].id, quantity: 2 },
    });
    await prisma.cartItem.create({
      data: { cartId: cart.id, variantId: allVariants[1].id, quantity: 1 },
    });
  }

  // ---------------------------------------------------------------------------
  // Sample order for customer
  // ---------------------------------------------------------------------------
  console.log("  Creating sample order...");
  const product1Variants = await prisma.variant.findMany({ where: { productId: product1.id }, take: 1 });
  const promoCode = await prisma.promoCode.findUnique({ where: { code: "WELCOME10" } });

  if (product1Variants.length > 0 && promoCode) {
    const variant1 = product1Variants[0];
    const subtotalCents = variant1.priceCents * 2;
    const discountCents = Math.round(subtotalCents * 0.10); // 10% off
    const shippingCents = 0;
    const totalCents = subtotalCents - discountCents + shippingCents;

    const order = await prisma.order.create({
      data: {
        userId: customerUser.id,
        status: OrderStatus.DELIVERED,
        totalCents,
        subtotalCents,
        shippingCents,
        discountCents,
        currency: "INR",
        promoId: promoCode.id,
        shippingAddress: {
          line1: "123 Candles Lane",
          line2: "Apartment 4B",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
        },
        billingAddress: {
          line1: "123 Candles Lane",
          line2: "Apartment 4B",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
        },
        items: {
          create: {
            variantId: variant1.id,
            quantity: 2,
            priceCents: variant1.priceCents,
          },
        },
        payment: {
          create: {
            gateway: PaymentGateway.RAZORPAY,
            gatewayOrderId: "order_sample_rzp_001",
            gatewayPaymentId: "pay_sample_rzp_001",
            status: PaymentStatus.CAPTURED,
            amountCents: totalCents,
            currency: "INR",
            method: "upi",
          },
        },
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Wishlist item for customer
  // ---------------------------------------------------------------------------
  console.log("  Creating wishlist items...");
  const latestProduct = await prisma.product.findFirst({ orderBy: { createdAt: "desc" } });
  if (latestProduct) {
    await prisma.wishlistItem.create({
      data: { userId: customerUser.id, productId: latestProduct.id },
    });
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  const counts = {
    users: await prisma.user.count(),
    addresses: await prisma.address.count(),
    collections: await prisma.collection.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    variants: await prisma.variant.count(),
    promoCodes: await prisma.promoCode.count(),
    carts: await prisma.cart.count(),
    cartItems: await prisma.cartItem.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    payments: await prisma.payment.count(),
    wishlistItems: await prisma.wishlistItem.count(),
  };

  console.log("\n✅ Seed complete! Summary:");
  Object.entries(counts).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
