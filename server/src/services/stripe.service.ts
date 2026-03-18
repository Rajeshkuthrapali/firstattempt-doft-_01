import { prisma } from "../lib/prisma.js";
import { stripeClient } from "../lib/stripe.js";
import { env } from "../config/env.js";
import type Stripe from "stripe";

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
 * @param event - Verified Stripe event
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata.internal_order_id;
      if (!orderId) break;

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { orderId },
          data: {
            gatewayPaymentId: pi.id,
            status: "CAPTURED",
            method: pi.payment_method_types?.[0] ?? "card",
          },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        });
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata.internal_order_id;
      if (!orderId) break;

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { orderId },
          data: {
            gatewayPaymentId: pi.id,
            status: "FAILED",
          },
        });

        // Restore stock
        const orderItems = await tx.orderItem.findMany({
          where: { orderId },
        });

        for (const item of orderItems) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      });
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
  }
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
