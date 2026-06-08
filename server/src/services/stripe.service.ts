import { prisma } from "../lib/prisma.js";
import { stripeClient } from "../lib/stripe.js";
import { env } from "../config/env.js";
import { validateOrderTransition } from "./order.service.js";
import { securityLogger } from "./security-logger.js";
import type Stripe from "stripe";

// ---------------------------------------------------------------------------
// State machine — Payment status transitions
// ---------------------------------------------------------------------------

const PAYMENT_TRANSITIONS: Record<string, string[]> = {
  CREATED: ["AUTHORIZED", "FAILED"],
  AUTHORIZED: ["CAPTURED", "FAILED"],
  CAPTURED: ["REFUNDED"],
  FAILED: [],      // terminal
  REFUNDED: [],    // terminal
};

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
    throw new StripeServiceError(
      `Invalid payment status transition: ${currentStatus} → ${newStatus}. ` +
        `Allowed transitions from ${currentStatus}: ${allowed?.join(", ") || "none"}`,
      409,
    );
  }
}

/**
 * Creates a Stripe PaymentIntent for a given internal order.
 * Only available when `STRIPE_SECRET_KEY` is configured.
 *
 * @param orderId - Internal order UUID
 * @returns Stripe client secret for the frontend to confirm payment
 */
export async function createStripePaymentIntent(orderId: string): Promise<{
  clientSecret: string;
  publishableKey: string;
  amountCents: number;
  currency: string;
}> {
  if (!stripeClient) {
    throw new StripeServiceError(
      "Stripe is not configured on this server",
      501,
    );
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new StripeServiceError("Order not found", 404);
  if (order.status !== "PENDING") {
    throw new StripeServiceError("Order is not in a payable state", 409);
  }

  // Create PaymentIntent
  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: order.totalCents,
    currency: order.currency.toLowerCase(),
    metadata: {
      internal_order_id: order.id,
    },
    automatic_payment_methods: { enabled: true },
  });

  // Upsert payment record
  await prisma.payment.upsert({
    where: { orderId },
    update: {
      gatewayOrderId: paymentIntent.id,
      amountCents: order.totalCents,
      status: "CREATED",
    },
    create: {
      orderId,
      gateway: "STRIPE",
      gatewayOrderId: paymentIntent.id,
      amountCents: order.totalCents,
      currency: order.currency,
      status: "CREATED",
    },
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY ?? "",
    amountCents: order.totalCents,
    currency: order.currency,
  };
}

/**
 * Constructs and validates a Stripe webhook event.
 *
 * @param rawBody - Raw request body
 * @param signature - `Stripe-Signature` header
 * @returns Parsed Stripe event
 */
export function constructStripeEvent(
  rawBody: string | Buffer,
  signature: string,
): Stripe.Event {
  if (!stripeClient) {
    throw new StripeServiceError("Stripe is not configured", 501);
  }
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new StripeServiceError("Stripe webhook secret not configured", 501);
  }

  return stripeClient.webhooks.constructEvent(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET,
  );
}

/**
 * Handles Stripe webhook events: `payment_intent.succeeded` and
 * `payment_intent.payment_failed`.
 *
 * Includes idempotency check, amount verification, state machine guards,
 * and stock management.
 *
 * @param event - Verified Stripe event
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  const idempotencyKey = `stripe/${event.id}`;

  // Idempotency: check if this event was already processed
  const alreadyProcessed = await prisma.webhookEvent.findUnique({
    where: { idempotencyKey },
  });
  if (alreadyProcessed) {
    console.log(
      `[Webhook] Stripe ${event.type} ${event.id} already processed at ${alreadyProcessed.processedAt}`,
    );
    return;
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata.internal_order_id;
      if (!orderId) break;

      await prisma.$transaction(async (tx) => {
        // Fetch payment and order for validation
        const payment = await tx.payment.findUnique({
          where: { orderId },
        });
        if (!payment) {
          securityLogger.warn("webhook_order_not_found", {
            gateway: "STRIPE",
            orderId,
            event: event.type,
          });
          return;
        }

        // State machine guard: validate payment transition
        validatePaymentTransition(payment.status, "CAPTURED", { orderId, paymentId: payment.id, event: event.type });

        const order = await tx.order.findUnique({
          where: { id: orderId },
        });
        if (!order) {
          securityLogger.warn("webhook_order_not_found", {
            gateway: "STRIPE",
            orderId,
            paymentId: payment.id,
            event: event.type,
          });
          return;
        }

        // Amount verification: compare Stripe amount against order total
        if (pi.amount !== order.totalCents) {
          securityLogger.critical("webhook_amount_mismatch", {
            gateway: "STRIPE",
            orderId: order.id,
            expectedCents: order.totalCents,
            receivedCents: pi.amount,
            event: event.type,
          });
          return;
        }

        // State machine guard: validate order transition
        validateOrderTransition(order.status, "CONFIRMED", { orderId: order.id, event: event.type });

        // Update payment
        await tx.payment.update({
          where: { orderId },
          data: {
            gatewayPaymentId: pi.id,
            status: "CAPTURED",
            method: pi.payment_method_types?.[0] ?? "card",
          },
        });

        // Update order
        await tx.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        });

        // Decrement stock (payment captured — stock is committed)
        const orderItems = await tx.orderItem.findMany({
          where: { orderId },
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
            gateway: "STRIPE",
            eventType: event.type,
          },
        });
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata.internal_order_id;
      if (!orderId) break;

      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({
          where: { orderId },
        });
        if (payment) {
          validatePaymentTransition(payment.status, "FAILED", { orderId, paymentId: payment.id, event: event.type });
        }

        const order = await tx.order.findUnique({
          where: { id: orderId },
        });
        if (order) {
          validateOrderTransition(order.status, "CANCELLED", { orderId: order.id, event: event.type });
        }

        await tx.payment.update({
          where: { orderId },
          data: {
            gatewayPaymentId: pi.id,
            status: "FAILED",
          },
        });

        // NOTE: No stock restoration — stock is decremented only on CAPTURED

        if (order) {
          await tx.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
          });
        }

        // Record idempotency
        await tx.webhookEvent.create({
          data: {
            idempotencyKey,
            gateway: "STRIPE",
            eventType: event.type,
          },
        });
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (!paymentIntentId) break;

      const refundId = charge.refunds?.data?.[0]?.id;
      if (!refundId) {
        console.warn(
          `[Webhook] No refund ID found in charge.refunded event ${event.id}`,
        );
        break;
      }

      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
          where: { gatewayOrderId: paymentIntentId },
        });
        if (!payment) {
          securityLogger.warn("webhook_order_not_found", {
            gateway: "STRIPE",
            paymentIntentId,
            event: event.type,
          });
          return;
        }

        // State machine guard
        validatePaymentTransition(payment.status, "REFUNDED", { paymentId: payment.id, event: event.type });

        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
        });
        if (order) {
          validateOrderTransition(order.status, "REFUNDED", { orderId: order.id, event: event.type });
        }

        // Verify refund amount does not exceed original payment
        const refundAmount = charge.refunds?.data?.[0]?.amount ?? 0;
        if (refundAmount > payment.amountCents) {
          securityLogger.critical("webhook_amount_mismatch", {
            gateway: "STRIPE",
            paymentId: payment.id,
            orderId: payment.orderId,
            refundAmount,
            originalAmount: payment.amountCents,
            event: event.type,
          });
          return;
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            refundId,
            status: "REFUNDED",
          },
        });

        if (order) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: { status: "REFUNDED" },
          });

          // Restore stock
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
            gateway: "STRIPE",
            eventType: event.type,
          },
        });
      });
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
  }
}

/**
 * Initiate a refund for a Stripe payment via the admin API.
 * Calls Stripe's refund API and persists the refund ID.
 *
 * NOTE: This only stores the refundId — the `charge.refunded` webhook handler
 * is responsible for updating payment/order status and restoring stock.
 * This prevents a race condition where the admin endpoint and webhook both
 * try to apply the REFUNDED transition.
 *
 * @param paymentIntentId - Stripe PaymentIntent ID
 * @returns Object containing the refund ID
 */
export async function refundStripePayment(
  paymentIntentId: string,
): Promise<{ refundId: string }> {
  if (!stripeClient) {
    throw new StripeServiceError("Stripe is not configured on this server", 501);
  }

  const refund = await stripeClient.refunds.create({
    payment_intent: paymentIntentId,
  });

  // Persist the refundId without changing payment status — the
  // charge.refunded webhook will handle state transitions atomically.
  await prisma.payment.updateMany({
    where: { gatewayOrderId: paymentIntentId },
    data: { refundId: refund.id },
  });

  return { refundId: refund.id };
}

/**
 * Domain error for Stripe service operations.
 */
export class StripeServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "StripeServiceError";
  }
}
