import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { razorpayClient } from "../lib/razorpay.js";
import { env } from "../config/env.js";
import type { RazorpayWebhookPayload } from "../types/payment.types.js";

/**
 * Creates a Razorpay order for a given internal order and persists the
 * Payment record with status CREATED.
 *
 * @param orderId - Internal order UUID
 * @returns Object containing the `razorpayOrderId` and `key` for the frontend SDK
 */
export async function createRazorpayOrder(orderId: string): Promise<{
  razorpayOrderId: string;
  keyId: string;
  amountCents: number;
  currency: string;
}> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new PaymentError("Order not found", 404);
  if (order.status !== "PENDING") {
    throw new PaymentError("Order is not in a payable state", 409);
  }

  // Check for existing payment
  const existingPayment = await prisma.payment.findUnique({
    where: { orderId },
  });

  if (existingPayment?.status === "CAPTURED") {
    throw new PaymentError("Payment already completed for this order", 409);
  }

  // Create Razorpay order via SDK
  const rzpOrder = await razorpayClient.orders.create({
    amount: order.totalCents, // Razorpay expects paise for INR
    currency: order.currency,
    receipt: order.id,
    notes: {
      internal_order_id: order.id,
    },
  });

  // Upsert payment record
  await prisma.payment.upsert({
    where: { orderId },
    update: {
      gatewayOrderId: rzpOrder.id,
      amountCents: order.totalCents,
      status: "CREATED",
    },
    create: {
      orderId,
      gateway: "RAZORPAY",
      gatewayOrderId: rzpOrder.id,
      amountCents: order.totalCents,
      currency: order.currency,
      status: "CREATED",
    },
  });

  return {
    razorpayOrderId: rzpOrder.id,
    keyId: env.RAZORPAY_KEY_ID,
    amountCents: order.totalCents,
    currency: order.currency,
  };
}

/**
 * Verifies the Razorpay payment signature from the client-side callback
 * and marks the payment + order as CONFIRMED.
 *
 * @param orderId - Internal order UUID
 * @param razorpayOrderId - Razorpay order ID (`order_xxx`)
 * @param razorpayPaymentId - Razorpay payment ID (`pay_xxx`)
 * @param razorpaySignature - HMAC signature from Razorpay checkout
 * @returns true if verification succeeds
 */
export async function verifyRazorpayPayment(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<boolean> {
  // 1. Compute expected signature
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new PaymentError("Invalid payment signature", 400);
  }

  // 2. Update payment + order status in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { orderId },
      data: {
        gatewayPaymentId: razorpayPaymentId,
        gatewaySignature: razorpaySignature,
        status: "CAPTURED",
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" },
    });
  });

  return true;
}

/**
 * Validates a Razorpay webhook signature using HMAC-SHA256.
 *
 * @param rawBody - Raw request body (Buffer or string)
 * @param signature - `X-Razorpay-Signature` header value
 * @returns true if the webhook is authentic
 */
export function validateRazorpayWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedSignature);
  const signatureBuf = Buffer.from(signature);

  if (expectedBuf.length !== signatureBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

/**
 * Processes an incoming Razorpay webhook event.
 * Handles `payment.captured`, `payment.failed`, and `refund.created`.
 *
 * @param payload - Parsed webhook JSON body
 */
export async function handleRazorpayWebhook(
  payload: RazorpayWebhookPayload,
): Promise<void> {
  const event = payload.event;

  switch (event) {
    case "payment.captured": {
      const paymentEntity = payload.payload.payment?.entity;
      if (!paymentEntity) break;

      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
          where: { gatewayOrderId: paymentEntity.order_id },
        });
        if (!payment) return;

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            gatewayPaymentId: paymentEntity.id,
            status: "CAPTURED",
            method: paymentEntity.method,
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "CONFIRMED" },
        });
      });
      break;
    }

    case "payment.failed": {
      const paymentEntity = payload.payload.payment?.entity;
      if (!paymentEntity) break;

      const payment = await prisma.payment.findFirst({
        where: { gatewayOrderId: paymentEntity.order_id },
      });
      if (!payment) break;

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            gatewayPaymentId: paymentEntity.id,
            status: "FAILED",
          },
        });

        // Restore stock for failed payments
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: payment.orderId },
        });

        for (const item of orderItems) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "CANCELLED" },
        });
      });
      break;
    }

    case "refund.created": {
      const refundEntity = payload.payload.refund?.entity;
      if (!refundEntity) break;

      const payment = await prisma.payment.findFirst({
        where: { gatewayPaymentId: refundEntity.payment_id },
      });
      if (!payment) break;

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            refundId: refundEntity.id,
            status: "REFUNDED",
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "REFUNDED" },
        });
      });
      break;
    }

    default:
      // Unhandled event — log and ignore
      console.log(`[Webhook] Unhandled Razorpay event: ${event}`);
  }
}

/**
 * Domain error with associated HTTP status code.
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "PaymentError";
  }
}
