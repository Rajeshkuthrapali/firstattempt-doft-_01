import { test, expect } from "@playwright/test";

/**
 * E2E: Stripe payment gateway — test-mode flows.
 * Tests PaymentIntent creation, simulated success/failure,
 * and webhook delivery for global expansion support.
 *
 * Prerequisites:
 *   - Server running at http://localhost:4000 with test Stripe keys
 *   - Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` in `.env`
 */

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api";

test.describe("Stripe Payment Flow", () => {
  test.describe.configure({ mode: "serial" });

  let orderId: string;

  test("create order for Stripe payment", async ({ request }) => {
    const res = await request.post(`${API_BASE}/orders`, {
      data: {
        items: [
          { productId: "midnight-oud", variantId: "mo-default", quantity: 2 },
        ],
        shippingAddress: {
          name: "Global Customer",
          line1: "10 Oxford Street",
          city: "London",
          state: "England",
          postalCode: "W1D 1BS",
          country: "GB",
          phone: "+447911123456",
        },
        currency: "USD",
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    orderId = body.data.id;
  });

  test("initiate Stripe PaymentIntent", async ({ request }) => {
    const res = await request.post(`${API_BASE}/payments/initiate`, {
      data: {
        orderId,
        gateway: "stripe",
      },
    });

    // If Stripe is not configured, expect 501
    if (res.status() === 501) {
      test.skip(true, "Stripe is not configured on the server");
      return;
    }

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.clientSecret).toBeTruthy();
    expect(body.data.clientSecret).toMatch(/^pi_/);
    expect(body.data.publishableKey).toMatch(/^pk_test_/);
    expect(body.data.amountCents).toBeGreaterThan(0);
  });

  test("Stripe webhook: payment_intent.succeeded", async ({ request }) => {
    const crypto = await import("node:crypto");

    const eventPayload = JSON.stringify({
      id: `evt_test_${Date.now()}`,
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: `pi_test_${Date.now()}`,
          amount: 6998,
          currency: "usd",
          status: "succeeded",
          metadata: {
            internal_order_id: orderId,
          },
          payment_method_types: ["card"],
        },
      },
    });

    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_test_secret";

    // Compute Stripe signature (timestamp + payload)
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${eventPayload}`;
    const sig = crypto
      .createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("hex");

    const stripeSignature = `t=${timestamp},v1=${sig}`;

    const res = await request.post(
      `${API_BASE}/payments/webhooks/stripe`,
      {
        data: eventPayload,
        headers: {
          "Content-Type": "application/json",
          "Stripe-Signature": stripeSignature,
        },
      },
    );

    // May fail with 501 if Stripe not configured
    if (res.status() === 501) {
      test.skip(true, "Stripe is not configured");
      return;
    }

    expect(res.ok()).toBeTruthy();
  });

  test("Stripe webhook: payment_intent.payment_failed", async ({
    request,
  }) => {
    // Create another order for failure test
    const orderRes = await request.post(`${API_BASE}/orders`, {
      data: {
        items: [
          { productId: "golden-hour", variantId: "gh-default", quantity: 1 },
        ],
        shippingAddress: {
          name: "Fail Test",
          line1: "1 Fail Road",
          city: "London",
          state: "England",
          postalCode: "W1D 1BS",
          country: "GB",
          phone: "+447911123456",
        },
        currency: "USD",
      },
    });
    const { data: order } = await orderRes.json();

    const crypto = await import("node:crypto");

    const eventPayload = JSON.stringify({
      id: `evt_fail_${Date.now()}`,
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: `pi_fail_${Date.now()}`,
          amount: 2499,
          currency: "usd",
          status: "requires_payment_method",
          metadata: {
            internal_order_id: order.id,
          },
          last_payment_error: {
            code: "card_declined",
            message: "Your card was declined",
          },
        },
      },
    });

    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_test_secret";
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${eventPayload}`;
    const sig = crypto
      .createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("hex");

    const stripeSignature = `t=${timestamp},v1=${sig}`;

    const res = await request.post(
      `${API_BASE}/payments/webhooks/stripe`,
      {
        data: eventPayload,
        headers: {
          "Content-Type": "application/json",
          "Stripe-Signature": stripeSignature,
        },
      },
    );

    if (res.status() === 501) {
      test.skip(true, "Stripe is not configured");
      return;
    }

    expect(res.ok()).toBeTruthy();
  });
});
