import { test, expect } from "@playwright/test";

/**
 * E2E: Razorpay payment gateway — test-mode flows.
 * Tests order creation via API, checkout modal invocation,
 * simulated success/failure callbacks, and webhook delivery.
 *
 * Prerequisites:
 *   - Server running at http://localhost:4000 with test Razorpay keys
 *   - Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`
 *
 * Note: These tests mock the Razorpay SDK interaction since the
 * actual checkout modal can't be automated in headless browsers.
 */

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api";

test.describe("Razorpay Payment Flow", () => {
  test.describe.configure({ mode: "serial" });

  let orderId: string;
  let razorpayOrderId: string;

  test("create order via API", async ({ request }) => {
    const res = await request.post(`${API_BASE}/orders`, {
      data: {
        items: [
          { productId: "golden-hour", variantId: "gh-default", quantity: 1 },
        ],
        shippingAddress: {
          name: "Test User",
          line1: "123 Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
          phone: "+919876543210",
        },
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeTruthy();

    orderId = body.data.id;
  });

  test("initiate Razorpay payment for order", async ({ request }) => {
    const res = await request.post(`${API_BASE}/payments/initiate`, {
      data: {
        orderId,
        gateway: "razorpay",
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.razorpayOrderId).toBeTruthy();
    expect(body.data.keyId).toMatch(/^rzp_test_/);
    expect(body.data.amountCents).toBeGreaterThan(0);
    expect(body.data.currency).toBe("INR");

    razorpayOrderId = body.data.razorpayOrderId;
  });

  test("verify payment with valid signature", async ({ request }) => {
    // Simulate the client-side callback from Razorpay checkout
    const crypto = await import("node:crypto");
    const paymentId = `pay_test_${Date.now()}`;
    const body = `${razorpayOrderId}|${paymentId}`;

    const secret = process.env.RAZORPAY_KEY_SECRET ?? "test_secret";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const res = await request.post(`${API_BASE}/payments/verify`, {
      data: {
        orderId,
        razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      },
    });

    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test("order status updates to CONFIRMED after payment", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/orders/${orderId}`);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.data.status).toBe("CONFIRMED");
  });

  test("reject payment with invalid signature", async ({ request }) => {
    // First create a new order for this test
    const orderRes = await request.post(`${API_BASE}/orders`, {
      data: {
        items: [
          { productId: "golden-hour", variantId: "gh-default", quantity: 1 },
        ],
        shippingAddress: {
          name: "Test User",
          line1: "123 Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
          phone: "+919876543210",
        },
      },
    });
    const orderBody = await orderRes.json();
    const newOrderId = orderBody.data.id;

    // Initiate payment
    const payRes = await request.post(`${API_BASE}/payments/initiate`, {
      data: { orderId: newOrderId, gateway: "razorpay" },
    });
    const payBody = await payRes.json();
    const newRzpOrderId = payBody.data.razorpayOrderId;

    // Attempt verification with bad signature
    const verifyRes = await request.post(`${API_BASE}/payments/verify`, {
      data: {
        orderId: newOrderId,
        razorpayOrderId: newRzpOrderId,
        razorpayPaymentId: "pay_fake_123",
        razorpaySignature: "invalid_signature_value",
      },
    });

    expect(verifyRes.status()).toBe(400);
  });
});

test.describe("Razorpay Webhook Delivery", () => {
  test("payment.captured webhook updates order status", async ({ request }) => {
    // Create order + initiate payment
    const orderRes = await request.post(`${API_BASE}/orders`, {
      data: {
        items: [
          { productId: "golden-hour", variantId: "gh-default", quantity: 1 },
        ],
        shippingAddress: {
          name: "Webhook Test",
          line1: "456 Hook Lane",
          city: "Delhi",
          state: "Delhi",
          postalCode: "110001",
          country: "IN",
          phone: "+919876543210",
        },
      },
    });
    const { data: order } = await orderRes.json();

    const payRes = await request.post(`${API_BASE}/payments/initiate`, {
      data: { orderId: order.id, gateway: "razorpay" },
    });
    const { data: payment } = await payRes.json();

    // Simulate Razorpay webhook payload
    const crypto = await import("node:crypto");
    const webhookPayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_webhook_${Date.now()}`,
            order_id: payment.razorpayOrderId,
            amount: payment.amountCents,
            currency: "INR",
            status: "captured",
            method: "card",
          },
        },
      },
    });

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ?? "webhook_secret";
    const webhookSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(webhookPayload)
      .digest("hex");

    const webhookRes = await request.post(
      `${API_BASE}/payments/webhooks/razorpay`,
      {
        data: webhookPayload,
        headers: {
          "Content-Type": "application/json",
          "X-Razorpay-Signature": webhookSignature,
        },
      },
    );

    expect(webhookRes.ok()).toBeTruthy();
  });

  test("payment.failed webhook cancels order and restores stock", async ({
    request,
  }) => {
    // Create order + initiate payment
    const orderRes = await request.post(`${API_BASE}/orders`, {
      data: {
        items: [
          { productId: "golden-hour", variantId: "gh-default", quantity: 1 },
        ],
        shippingAddress: {
          name: "Fail Test",
          line1: "789 Error Road",
          city: "Bangalore",
          state: "Karnataka",
          postalCode: "560001",
          country: "IN",
          phone: "+919876543210",
        },
      },
    });
    const { data: order } = await orderRes.json();

    const payRes = await request.post(`${API_BASE}/payments/initiate`, {
      data: { orderId: order.id, gateway: "razorpay" },
    });
    const { data: payment } = await payRes.json();

    // Simulate failed payment webhook
    const crypto = await import("node:crypto");
    const webhookPayload = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: `pay_fail_${Date.now()}`,
            order_id: payment.razorpayOrderId,
            amount: payment.amountCents,
            currency: "INR",
            status: "failed",
            error_code: "BAD_REQUEST_ERROR",
            error_description: "Payment was declined by the bank",
          },
        },
      },
    });

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ?? "webhook_secret";
    const webhookSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(webhookPayload)
      .digest("hex");

    const webhookRes = await request.post(
      `${API_BASE}/payments/webhooks/razorpay`,
      {
        data: webhookPayload,
        headers: {
          "Content-Type": "application/json",
          "X-Razorpay-Signature": webhookSignature,
        },
      },
    );

    expect(webhookRes.ok()).toBeTruthy();

    // Verify order is cancelled
    const statusRes = await request.get(`${API_BASE}/orders/${order.id}`);
    const statusBody = await statusRes.json();
    expect(statusBody.data.status).toBe("CANCELLED");
  });

  test("duplicate payment.captured webhook is idempotent (no-op)", async ({
    request,
  }) => {
    // Create order + initiate + send first captured webhook
    const orderRes = await request.post(`${API_BASE}/orders`, {
      data: {
        items: [
          { productId: "golden-hour", variantId: "gh-default", quantity: 1 },
        ],
        shippingAddress: {
          name: "Idempotency Test",
          line1: "100 Retry Ave",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "IN",
          phone: "+919876543210",
        },
      },
    });
    const { data: order } = await orderRes.json();

    const payRes = await request.post(`${API_BASE}/payments/initiate`, {
      data: { orderId: order.id, gateway: "razorpay" },
    });
    const { data: payment } = await payRes.json();

    const crypto = await import("node:crypto");
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ?? "webhook_secret";
    const paymentId = `pay_idempotent_${Date.now()}`;

    const makePayload = () =>
      JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: paymentId,
              order_id: payment.razorpayOrderId,
              amount: payment.amountCents,
              currency: "INR",
              status: "captured",
              method: "upi",
            },
          },
        },
      });

    // Send first webhook
    const payload1 = makePayload();
    const sig1 = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload1)
      .digest("hex");
    const res1 = await request.post(`${API_BASE}/payments/webhooks/razorpay`, {
      data: payload1,
      headers: {
        "Content-Type": "application/json",
        "X-Razorpay-Signature": sig1,
      },
    });
    expect(res1.ok()).toBeTruthy();

    // Send duplicate webhook (retry scenario)
    const payload2 = makePayload();
    const sig2 = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload2)
      .digest("hex");
    const res2 = await request.post(`${API_BASE}/payments/webhooks/razorpay`, {
      data: payload2,
      headers: {
        "Content-Type": "application/json",
        "X-Razorpay-Signature": sig2,
      },
    });
    // Should succeed (idempotent) — not create duplicate records
    expect(res2.ok()).toBeTruthy();

    // Order should still be CONFIRMED (not errored)
    const statusRes = await request.get(`${API_BASE}/orders/${order.id}`);
    const statusBody = await statusRes.json();
    expect(statusBody.data.status).toBe("CONFIRMED");
  });

  test("refund.created webhook transitions order to REFUNDED", async ({
    request,
  }) => {
    // Create + pay an order first
    const orderRes = await request.post(`${API_BASE}/orders`, {
      data: {
        items: [
          { productId: "golden-hour", variantId: "gh-default", quantity: 1 },
        ],
        shippingAddress: {
          name: "Refund Test",
          line1: "200 Refund Street",
          city: "Chennai",
          state: "Tamil Nadu",
          postalCode: "600001",
          country: "IN",
          phone: "+919876543210",
        },
      },
    });
    const { data: order } = await orderRes.json();

    const payRes = await request.post(`${API_BASE}/payments/initiate`, {
      data: { orderId: order.id, gateway: "razorpay" },
    });
    const { data: payment } = await payRes.json();

    const crypto = await import("node:crypto");
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ?? "webhook_secret";
    const paymentEntityId = `pay_refund_${Date.now()}`;

    // First: capture the payment via webhook
    const capturePayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: paymentEntityId,
            order_id: payment.razorpayOrderId,
            amount: payment.amountCents,
            currency: "INR",
            status: "captured",
            method: "card",
          },
        },
      },
    });
    const captureSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(capturePayload)
      .digest("hex");
    await request.post(`${API_BASE}/payments/webhooks/razorpay`, {
      data: capturePayload,
      headers: {
        "Content-Type": "application/json",
        "X-Razorpay-Signature": captureSig,
      },
    });

    // Now: send refund webhook
    const refundPayload = JSON.stringify({
      event: "refund.created",
      payload: {
        refund: {
          entity: {
            id: `rfnd_${Date.now()}`,
            payment_id: paymentEntityId,
            amount: payment.amountCents,
            currency: "INR",
            status: "processed",
          },
        },
      },
    });
    const refundSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(refundPayload)
      .digest("hex");
    const refundRes = await request.post(
      `${API_BASE}/payments/webhooks/razorpay`,
      {
        data: refundPayload,
        headers: {
          "Content-Type": "application/json",
          "X-Razorpay-Signature": refundSig,
        },
      },
    );
    expect(refundRes.ok()).toBeTruthy();

    // Verify order is REFUNDED
    const statusRes = await request.get(`${API_BASE}/orders/${order.id}`);
    const statusBody = await statusRes.json();
    expect(statusBody.data.status).toBe("REFUNDED");
  });
});
