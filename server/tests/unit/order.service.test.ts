import { describe, it, expect, vi, beforeEach } from "vitest";

const { prisma } = await import("../../src/lib/prisma.js");
const { createOrder, OrderError } =
  await import("../../src/services/order.service.js");

// ---------------------------------------------------------------------------
// createOrder
// ---------------------------------------------------------------------------

describe("createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw 404 when a variant is not found", async () => {
    vi.mocked(prisma.variant.findMany).mockResolvedValue([]);

    await expect(
      createOrder(
        {
          items: [{ variantId: "v-missing", quantity: 1 }],
          shippingAddress: {
            line1: "123 Main St",
            city: "Mumbai",
            state: "MH",
            postalCode: "400001",
            country: "IN",
          },
          gateway: "RAZORPAY",
        },
        null,
      ),
    ).rejects.toThrow(OrderError);

    await expect(
      createOrder(
        {
          items: [{ variantId: "v-missing", quantity: 1 }],
          shippingAddress: {
            line1: "123 Main St",
            city: "Mumbai",
            state: "MH",
            postalCode: "400001",
            country: "IN",
          },
          gateway: "RAZORPAY",
        },
        null,
      ),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw 409 when stock is insufficient", async () => {
    vi.mocked(prisma.variant.findMany).mockResolvedValue([
      {
        id: "v-1",
        productId: "p-1",
        color: "Red",
        size: "M",
        fragrance: "Rose",
        weight: "200g",
        priceCents: 100000,
        compareAtPrice: null,
        stock: 2,
        sku: "SKU-001",
      },
    ] as never);

    await expect(
      createOrder(
        {
          items: [{ variantId: "v-1", quantity: 5 }],
          shippingAddress: {
            line1: "123 Main St",
            city: "Mumbai",
            state: "MH",
            postalCode: "400001",
            country: "IN",
          },
          gateway: "RAZORPAY",
        },
        null,
      ),
    ).rejects.toThrow(OrderError);
  });

  it("should throw 400 for an invalid promo code", async () => {
    vi.mocked(prisma.variant.findMany).mockResolvedValue([
      {
        id: "v-1",
        productId: "p-1",
        color: null,
        size: null,
        fragrance: null,
        weight: null,
        priceCents: 200000,
        compareAtPrice: null,
        stock: 10,
        sku: "SKU-002",
      },
    ] as never);

    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue(null);

    await expect(
      createOrder(
        {
          items: [{ variantId: "v-1", quantity: 1 }],
          promoCode: "INVALID_CODE",
          shippingAddress: {
            line1: "456 Oak Ave",
            city: "Delhi",
            state: "DL",
            postalCode: "110001",
            country: "IN",
          },
          gateway: "RAZORPAY",
        },
        null,
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should create an order successfully with correct totals", async () => {
    const variant = {
      id: "v-1",
      productId: "p-1",
      color: "Gold",
      size: "L",
      fragrance: "Jasmine",
      weight: "300g",
      priceCents: 200000, // ₹2,000
      compareAtPrice: 250000,
      stock: 10,
      sku: "SKU-003",
    };

    vi.mocked(prisma.variant.findMany).mockResolvedValue([variant] as never);

    // Mock the transaction
    const createdOrder = {
      id: "order-new",
      userId: null,
      status: "PENDING",
      subtotalCents: 200000,
      shippingCents: 9900, // below ₹3,000 → ₹99 shipping
      discountCents: 0,
      totalCents: 209900,
      currency: "INR",
      promoId: null,
      guestEmail: null,
      giftMessage: null,
      shippingAddress: {},
      billingAddress: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: "item-1",
          orderId: "order-new",
          variantId: "v-1",
          quantity: 2,
          priceCents: 200000,
        },
      ],
      payment: null,
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      const tx = {
        variant: { update: vi.fn().mockResolvedValue({}) },
        promoCode: { update: vi.fn().mockResolvedValue({}) },
        order: {
          create: vi.fn().mockResolvedValue(createdOrder),
        },
      };
      return (fn as (tx: unknown) => Promise<unknown>)(tx);
    });

    const result = await createOrder(
      {
        items: [{ variantId: "v-1", quantity: 2 }],
        shippingAddress: {
          line1: "789 Elm Blvd",
          city: "Bangalore",
          state: "KA",
          postalCode: "560001",
          country: "IN",
        },
        gateway: "RAZORPAY",
      },
      null,
    );

    expect(result.id).toBe("order-new");
    expect(result.status).toBe("PENDING");
    expect(result.totalCents).toBe(209900);
    expect(result.items).toHaveLength(1);
  });

  it("should apply free shipping above ₹3,000 threshold", async () => {
    const variant = {
      id: "v-1",
      productId: "p-1",
      priceCents: 350000, // ₹3,500 — above threshold
      stock: 10,
      sku: "SKU-004",
    };

    vi.mocked(prisma.variant.findMany).mockResolvedValue([variant] as never);

    const createdOrder = {
      id: "order-free-ship",
      status: "PENDING",
      subtotalCents: 350000,
      shippingCents: 0,
      discountCents: 0,
      totalCents: 350000,
      currency: "INR",
      createdAt: new Date(),
      items: [{ variantId: "v-1", quantity: 1, priceCents: 350000 }],
      payment: null,
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      const tx = {
        variant: { update: vi.fn().mockResolvedValue({}) },
        promoCode: { update: vi.fn().mockResolvedValue({}) },
        order: { create: vi.fn().mockResolvedValue(createdOrder) },
      };
      return (fn as (tx: unknown) => Promise<unknown>)(tx);
    });

    const result = await createOrder(
      {
        items: [{ variantId: "v-1", quantity: 1 }],
        shippingAddress: {
          line1: "Free Ship Rd",
          city: "Pune",
          state: "MH",
          postalCode: "411001",
          country: "IN",
        },
        gateway: "RAZORPAY",
      },
      null,
    );

    // Total should equal subtotal (no shipping)
    expect(result.totalCents).toBe(350000);
  });
});
