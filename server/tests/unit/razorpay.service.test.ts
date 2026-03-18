import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";

// Import after mocks are applied by setup.ts
const { prisma } = await import("../../src/lib/prisma.js");
const { razorpayClient } = await import("../../src/lib/razorpay.js");

// Dynamic imports for the service under test
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  validateRazorpayWebhookSignature,
  handleRazorpayWebhook,
  PaymentError,
} = await import("../../src/services/razorpay.service.js");

// ---------------------------------------------------------------------------
// createRazorpayOrder
// ---------------------------------------------------------------------------

describe("createRazorpayOrder", () => {
  it("should throw 404 when order does not exist", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    await expect(createRazorpayOrder("non-existent-id")).rejects.toThrow(
      PaymentError,
    );
    await expect(createRazorpayOrder("non-existent-id")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("should throw 409 when order is not PENDING", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: "order-1",
      status: "CONFIRMED",
      totalCents: 100000,
      currency: "INR",
    } as never);

    await expect(createRazorpayOrder("order-1")).rejects.toThrow(PaymentError);
    await expect(createRazorpayOrder("order-1")).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("should create a Razorpay order and upsert payment record", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: "order-1",
      status: "PENDING",
      totalCents: 250000,
      currency: "INR",
    } as never);

    vi.mocked(prisma.payment.findUnique).mockResolvedValue(null);

    vi.mocked(razorpayClient.orders.create).mockResolvedValue({
      id: "order_rzp_123",
      amount: 250000,
      currency: "INR",
    } as never);

    vi.mocked(prisma.payment.upsert).mockResolvedValue({} as never);

    const result = await createRazorpayOrder("order-1");

    expect(result).toEqual({
      razorpayOrderId: "order_rzp_123",
      keyId: "rzp_test_mock_key_id",
      amountCents: 250000,
      currency: "INR",
    });

    expect(razorpayClient.orders.create).toHaveBeenCalledWith({
      amount: 250000,
      currency: "INR",
      receipt: "order-1",
      notes: { internal_order_id: "order-1" },
    });

    expect(prisma.payment.upsert).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// verifyRazorpayPayment
// ---------------------------------------------------------------------------

describe("verifyRazorpayPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw 400 on invalid signature", async () => {
    await expect(
      verifyRazorpayPayment(
        "order-1",
        "order_rzp_123",
        "pay_rzp_456",
        "invalid_signature",
      ),
    ).rejects.toThrow(PaymentError);
  });

  it("should verify a valid signature and update records", async () => {
    const razorpayOrderId = "order_rzp_123";
    const razorpayPaymentId = "pay_rzp_456";

    // Compute valid signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const validSignature = crypto
      .createHmac("sha256", "rzp_test_mock_key_secret")
      .update(body)
      .digest("hex");

    // Mock the transaction to actually execute the callback
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      const tx = {
        payment: { update: vi.fn().mockResolvedValue({}) },
        order: { update: vi.fn().mockResolvedValue({}) },
      };
      return (fn as (tx: unknown) => Promise<unknown>)(tx);
    });

    const result = await verifyRazorpayPayment(
      "order-1",
      razorpayOrderId,
      razorpayPaymentId,
      validSignature,
    );

    expect(result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateRazorpayWebhookSignature
// ---------------------------------------------------------------------------

describe("validateRazorpayWebhookSignature", () => {
  it("should return true for a valid webhook signature", () => {
    const rawBody = '{"event":"payment.captured"}';
    const signature = crypto
      .createHmac("sha256", "rzp_test_webhook_secret")
      .update(rawBody)
      .digest("hex");

    expect(validateRazorpayWebhookSignature(rawBody, signature)).toBe(true);
  });

  it("should return false for an invalid webhook signature", () => {
    const rawBody = '{"event":"payment.captured"}';
    expect(validateRazorpayWebhookSignature(rawBody, "bad_sig")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// handleRazorpayWebhook
// ---------------------------------------------------------------------------

describe("handleRazorpayWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle payment.captured event", async () => {
    const mockPayment = { id: "pay-db-1", orderId: "order-1" };

    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      const tx = {
        payment: {
          findFirst: vi.fn().mockResolvedValue(mockPayment),
          update: vi.fn().mockResolvedValue({}),
        },
        order: { update: vi.fn().mockResolvedValue({}) },
      };
      return (fn as (tx: unknown) => Promise<unknown>)(tx);
    });

    await handleRazorpayWebhook({
      entity: "event",
      account_id: "acc_123",
      event: "payment.captured",
      contains: ["payment"],
      payload: {
        payment: {
          entity: {
            id: "pay_rzp_789",
            entity: "payment",
            amount: 100000,
            currency: "INR",
            status: "captured",
            order_id: "order_rzp_123",
            method: "upi",
            description: null,
            email: "test@example.com",
            contact: "+919999999999",
            error_code: null,
            error_description: null,
            created_at: Date.now(),
          },
        },
      },
      created_at: Date.now(),
    });

    // Should have called $transaction
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("should handle unknown events gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await handleRazorpayWebhook({
      entity: "event",
      account_id: "acc_123",
      event: "unknown.event",
      contains: [],
      payload: {},
      created_at: Date.now(),
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[Webhook] Unhandled Razorpay event: unknown.event",
    );
    consoleSpy.mockRestore();
  });
});
