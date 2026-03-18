import { describe, it, expect } from "vitest";
import {
  createOrderSchema,
  verifyPaymentSchema,
} from "../../src/types/order.types.js";

describe("createOrderSchema", () => {
  it("should accept a valid order payload", () => {
    const result = createOrderSchema.safeParse({
      items: [
        { variantId: "550e8400-e29b-41d4-a716-446655440000", quantity: 2 },
      ],
      shippingAddress: {
        line1: "123 Main St",
        city: "Mumbai",
        state: "MH",
        postalCode: "400001",
      },
    });

    expect(result.success).toBe(true);
  });

  it("should reject an empty items array", () => {
    const result = createOrderSchema.safeParse({
      items: [],
      shippingAddress: {
        line1: "123 Main St",
        city: "Mumbai",
        state: "MH",
        postalCode: "400001",
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject quantity > 50", () => {
    const result = createOrderSchema.safeParse({
      items: [
        {
          variantId: "550e8400-e29b-41d4-a716-446655440000",
          quantity: 51,
        },
      ],
      shippingAddress: {
        line1: "123 Main St",
        city: "Mumbai",
        state: "MH",
        postalCode: "400001",
      },
    });

    expect(result.success).toBe(false);
  });

  it("should default gateway to RAZORPAY", () => {
    const result = createOrderSchema.safeParse({
      items: [
        { variantId: "550e8400-e29b-41d4-a716-446655440000", quantity: 1 },
      ],
      shippingAddress: {
        line1: "123 Main St",
        city: "Mumbai",
        state: "MH",
        postalCode: "400001",
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gateway).toBe("RAZORPAY");
    }
  });

  it("should accept optional fields", () => {
    const result = createOrderSchema.safeParse({
      items: [
        { variantId: "550e8400-e29b-41d4-a716-446655440000", quantity: 1 },
      ],
      promoCode: "WELCOME10",
      guestEmail: "guest@example.com",
      giftMessage: "Happy Birthday!",
      shippingAddress: {
        line1: "456 Oak St",
        city: "Delhi",
        state: "DL",
        postalCode: "110001",
      },
      billingAddress: {
        line1: "789 Elm St",
        city: "Kolkata",
        state: "WB",
        postalCode: "700001",
      },
      gateway: "STRIPE",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.promoCode).toBe("WELCOME10");
      expect(result.data.gateway).toBe("STRIPE");
    }
  });
});

describe("verifyPaymentSchema", () => {
  it("should accept valid verification payload", () => {
    const result = verifyPaymentSchema.safeParse({
      orderId: "550e8400-e29b-41d4-a716-446655440000",
      razorpayOrderId: "order_abc123",
      razorpayPaymentId: "pay_xyz789",
      razorpaySignature: "deadbeefcafebabe",
    });

    expect(result.success).toBe(true);
  });

  it("should reject missing required fields", () => {
    const result = verifyPaymentSchema.safeParse({
      orderId: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(result.success).toBe(false);
  });
});
