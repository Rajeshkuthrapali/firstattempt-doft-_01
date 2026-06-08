import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { razorpayClient } from "../lib/razorpay.js";
import { env } from "../config/env.js";
import { validateOrderTransition } from "./order.service.js";
import { securityLogger } from "./security-logger.js";
import type { RazorpayWebhookPayload } from "../types/payment.types.js";

// ---------------------------------------------------------------------------
// State machine — Payment status transitions
// ---------------------------------------------------------------------------

/** Valid payment status transitions. Only these state changes are allowed. */
const PAYMENT_TRANSITIONS: Record<string, string[]> = {
  CREATED: ["AUTHORIZED", "FAILED"],
  AUTHORIZED: ["CAPTURED", "FAILED"],
  CAPTURED: ["REFUNDED"],
  FAILED: [],      // terminal — can retry with new payment
  REFUNDED: [],    // terminal
};

/**
 * Validates that a transition from `currentStatus` to `newStatus` is allowed.
 * Throws a PaymentError (409) if the transition is not in the allowed set.
 */
function validatePaymentTransition(
  currentStatus: string,
  newStatus: string,
  context?: Record<string, unknown>,
): void {
  const allowed = PAYMENT_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    securityLogger.warn("payment_invalid_transition", {
      from: currentStatus,
      to: newStatus,
      ...context,
    });
    throw new PaymentError(
      `Invalid payment status transition: ${currentStatus} → ${newStatus}. ` +
        `Allowed transitions from ${currentStatus}: ${allowed?.join(", ") || "none"}`,
      409,
    );
  }
}

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
    securityLogger.warn("webhook_invalid_signature", {
      gateway: "RAZORPAY",
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
    });
    throw new PaymentError("Invalid payment signature", 400);
  }

  // 2. Validate state transitions before applying
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (payment) {
    validatePaymentTransition(payment.status, "CAPTURED", { orderId, paymentId: payment.id });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (order) {
    validateOrderTransition(order.status, "CONFIRMED", { orderId });
  }

  // 3. Update payment + order status in a transaction
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
 * Includes idempotency check, amount verification, state machine guards,
 * and stock management.
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

      // Idempotency: check if this event was already processed
      const idempotencyKey = `razorpay/${event}/${paymentEntity.id}`;
      const alreadyProcessed = await prisma.webhookEvent.findUnique({
        where: { idempotencyKey },
      });
      if (alreadyProcessed) {
        console.log(
          `[Webhook] Razorpay ${event} ${paymentEntity.id} already processed at ${alreadyProcessed.processedAt}`,
        );
        break;
      }

      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
          where: { gatewayOrderId: paymentEntity.order_id },
        });
        if (!payment) {
          securityLogger.warn("webhook_order_not_found", {
            gateway: "RAZORPAY",
            gatewayOrderId: paymentEntity.order_id,
            event,
          });
          return;
        }

        // Security check: verify gatewayOrderId matches webhook payload
        if (payment.gatewayOrderId !== paymentEntity.order_id) {
          securityLogger.critical("webhook_invalid_signature", {
            gateway: "RAZORPAY",
            paymentId: payment.id,
            expected: payment.gatewayOrderId,
            received: paymentEntity.order_id,
            event,
          });
          return;
        }

        // State machine guard: validate payment transition
        validatePaymentTransition(payment.status, "CAPTURED", { paymentId: payment.id, event });

        // Fetch order for amount verification and state guard
        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
        });
        if (!order) {
          securityLogger.warn("webhook_order_not_found", {
            gateway: "RAZORPAY",
            paymentId: payment.id,
            event,
          });
          return;
        }

        // Amount verification: compare webhook amount against order total
        if (paymentEntity.amount !== order.totalCents) {
          securityLogger.critical("webhook_amount_mismatch", {
            gateway: "RAZORPAY",
            orderId: order.id,
            expectedCents: order.totalCents,
            receivedCents: paymentEntity.amount,
            event,
          });
          return;
        }

        // State machine guard: validate order transition
        validateOrderTransition(order.status, "CONFIRMED", { orderId: order.id, event });

        // Update payment status
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            gatewayPaymentId: paymentEntity.id,
            status: "CAPTURED",
            method: paymentEntity.method,
          },
        });

        // Update order status
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "CONFIRMED" },
        });

        // Decrement stock (payment was captured — stock is now committed)
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: payment.orderId },
        });
        for (const item of orderItems) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Record idempotency
        await tx.webhookEvent.create({
          data: {
            idempotencyKey,
            gateway: "RAZORPAY",
            eventType: event,
          },
        });
      });
      break;
    }

    case "payment.failed": {
      const paymentEntity = payload.payload.payment?.entity;
      if (!paymentEntity) break;

      // Idempotency
      const idempotencyKey = `razorpay/${event}/${paymentEntity.id}`;
      const alreadyProcessed = await prisma.webhookEvent.findUnique({
        where: { idempotencyKey },
      });
      if (alreadyProcessed) {
        console.log(
          `[Webhook] Razorpay ${event} ${paymentEntity.id} already processed at ${alreadyProcessed.processedAt}`,
        );
        break;
      }

      const payment = await prisma.payment.findFirst({
        where: { gatewayOrderId: paymentEntity.order_id },
      });
      if (!payment) {
        securityLogger.warn("webhook_order_not_found", {
          gateway: "RAZORPAY",
          gatewayOrderId: paymentEntity.order_id,
          event,
        });
        break;
      }

      await prisma.$transaction(async (tx) => {
        // State machine guard
        const currentPayment = await tx.payment.findUnique({
          where: { id: payment.id },
        });
        if (currentPayment) {
          validatePaymentTransition(currentPayment.status, "FAILED", { paymentId: payment.id, event });
        }

        // Fetch and guard order transition
        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
        });
        if (order) {
          validateOrderTransition(order.status, "CANCELLED", { orderId: order.id, event });
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            gatewayPaymentId: paymentEntity.id,
            status: "FAILED",
          },
        });

        // NOTE: No stock restoration needed — stock is decremented only on
        // CAPTURED, so a failed payment never changed stock levels.

        if (order) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: "CANCELLED" },
          });
        }

        // Record idempotency
        await tx.webhookEvent.create({
          data: {
            idempotencyKey,
            gateway: "RAZORPAY",
            eventType: event,
          },
        });
      });
      break;
    }

    case "refund.created": {
      const refundEntity = payload.payload.refund?.entity;
      if (!refundEntity) break;

      // Idempotency
      const idempotencyKey = `razorpay/${event}/${refundEntity.id}`;
      const alreadyProcessed = await prisma.webhookEvent.findUnique({
        where: { idempotencyKey },
      });
      if (alreadyProcessed) {
        console.log(
          `[Webhook] Razorpay ${event} ${refundEntity.id} already processed at ${alreadyProcessed.processedAt}`,
        );
        break;
      }

      const payment = await prisma.payment.findFirst({
        where: { gatewayPaymentId: refundEntity.payment_id },
      });
      if (!payment) {
        securityLogger.warn("webhook_order_not_found", {
          gateway: "RAZORPAY",
          gatewayPaymentId: refundEntity.payment_id,
          event,
        });
        break;
      }

      await prisma.$transaction(async (tx) => {
        // State machine guards
        const currentPayment = await tx.payment.findUnique({
          where: { id: payment.id },
        });
        if (currentPayment) {
          validatePaymentTransition(currentPayment.status, "REFUNDED", { paymentId: payment.id, event });
        }

        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
        });
        if (order) {
          validateOrderTransition(order.status, "REFUNDED", { orderId: order.id, event });
        }

        // Verify refund amount does not exceed original payment
        if (refundEntity.amount > payment.amountCents) {
          securityLogger.critical("webhook_amount_mismatch", {
            gateway: "RAZORPAY",
            paymentId: payment.id,
            orderId: payment.orderId,
            refundAmount: refundEntity.amount,
            originalAmount: payment.amountCents,
            event,
          });
          return;
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            refundId: refundEntity.id,
            status: "REFUNDED",
          },
        });

        if (order) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: "REFUNDED" },
          });

          // Restore stock since the order is refunded
          const orderItems = await tx.orderItem.findMany({
            where: { orderId: payment.orderId },
          });
          for (const item of orderItems) {
            await tx.variant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        // Record idempotency
        await tx.webhookEvent.create({
          data: {
            idempotencyKey,
            gateway: "RAZORPAY",
            eventType: event,
          },
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
