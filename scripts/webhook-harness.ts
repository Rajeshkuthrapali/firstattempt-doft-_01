#!/usr/bin/env tsx
/**
 * Webhook Test Harness
 *
 * Simulates Razorpay and Stripe webhook deliveries to the local server
 * for manual debugging and integration testing.
 *
 * Usage:
 *   npx tsx scripts/webhook-harness.ts razorpay payment.captured <razorpay_order_id>
 *   npx tsx scripts/webhook-harness.ts razorpay payment.failed <razorpay_order_id>
 *   npx tsx scripts/webhook-harness.ts stripe payment_intent.succeeded <order_id>
 *   npx tsx scripts/webhook-harness.ts stripe payment_intent.payment_failed <order_id>
 */

import crypto from "node:crypto";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api";

/** Sends a simulated Razorpay webhook to the local server. */
async function sendRazorpayWebhook(
  event: string,
  razorpayOrderId: string,
): Promise<void> {
  const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET ?? "your_razorpay_webhook_secret";

  const payload = JSON.stringify({
    event,
    payload: {
      payment: {
        entity: {
          id: `pay_harness_${Date.now()}`,
          order_id: razorpayOrderId,
          amount: 249900,
          currency: "INR",
          status: event === "payment.captured" ? "captured" : "failed",
          method: "card",
          ...(event === "payment.failed" && {
            error_code: "BAD_REQUEST_ERROR",
            error_description: "Simulated failure from webhook harness",
          }),
        },
      },
    },
  });

  const signature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  console.log(`\n📤 Sending Razorpay webhook: ${event}`);
  console.log(`   Order ID: ${razorpayOrderId}`);
  console.log(`   Signature: ${signature.substring(0, 20)}...`);

  const res = await fetch(`${API_BASE}/payments/webhooks/razorpay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Razorpay-Signature": signature,
    },
    body: payload,
  });

  console.log(`   Status: ${res.status} ${res.statusText}`);
  const body = await res.text();
  console.log(`   Response: ${body}\n`);
}

/** Sends a simulated Stripe webhook to the local server. */
async function sendStripeWebhook(
  eventType: string,
  orderId: string,
): Promise<void> {
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_xxxxxxxxxxxx";

  const eventPayload = JSON.stringify({
    id: `evt_harness_${Date.now()}`,
    type: eventType,
    data: {
      object: {
        id: `pi_harness_${Date.now()}`,
        amount: 249900,
        currency: "inr",
        status:
          eventType === "payment_intent.succeeded"
            ? "succeeded"
            : "requires_payment_method",
        metadata: {
          internal_order_id: orderId,
        },
        payment_method_types: ["card"],
        ...(eventType === "payment_intent.payment_failed" && {
          last_payment_error: {
            code: "card_declined",
            message: "Simulated decline from webhook harness",
          },
        }),
      },
    },
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${eventPayload}`;
  const sig = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex");

  const stripeSignature = `t=${timestamp},v1=${sig}`;

  console.log(`\n📤 Sending Stripe webhook: ${eventType}`);
  console.log(`   Order ID: ${orderId}`);

  const res = await fetch(`${API_BASE}/payments/webhooks/stripe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Stripe-Signature": stripeSignature,
    },
    body: eventPayload,
  });

  console.log(`   Status: ${res.status} ${res.statusText}`);
  const body = await res.text();
  console.log(`   Response: ${body}\n`);
}

// ── CLI entry point ──────────────────────────────────────
const [, , gateway, event, id] = process.argv;

if (!gateway || !event || !id) {
  console.log(`
🔧 Webhook Test Harness — Lumière Candles

Usage:
  npx tsx scripts/webhook-harness.ts <gateway> <event> <id>

Razorpay examples:
  npx tsx scripts/webhook-harness.ts razorpay payment.captured order_xxx
  npx tsx scripts/webhook-harness.ts razorpay payment.failed order_xxx

Stripe examples:
  npx tsx scripts/webhook-harness.ts stripe payment_intent.succeeded <order_uuid>
  npx tsx scripts/webhook-harness.ts stripe payment_intent.payment_failed <order_uuid>
  `);
  process.exit(1);
}

if (gateway === "razorpay") {
  await sendRazorpayWebhook(event, id);
} else if (gateway === "stripe") {
  await sendStripeWebhook(event, id);
} else {
  console.error(`❌ Unknown gateway: ${gateway}. Use 'razorpay' or 'stripe'.`);
  process.exit(1);
}
