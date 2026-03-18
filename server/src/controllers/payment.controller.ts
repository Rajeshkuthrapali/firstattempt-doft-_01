import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  validateRazorpayWebhookSignature,
  handleRazorpayWebhook as processRazorpayWebhook,
  PaymentError,
} from "../services/razorpay.service.js";
import {
  createStripePaymentIntent,
  constructStripeEvent,
  handleStripeWebhook as processStripeWebhook,
  StripeServiceError,
} from "../services/stripe.service.js";
import type { VerifyPaymentInput } from "../types/order.types.js";
import type { RazorpayWebhookPayload } from "../types/payment.types.js";

// ---------------------------------------------------------------------------
// Initiate payment
// ---------------------------------------------------------------------------

const initiateSchema = z.object({
  orderId: z.string().uuid(),
  gateway: z.enum(["RAZORPAY", "STRIPE"]).default("RAZORPAY"),
});

/**
 * POST /api/payments/initiate
 * Creates a gateway-specific payment object (Razorpay order or Stripe PaymentIntent).
 */
export async function handleInitiatePayment(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  try {
    const { orderId, gateway } = initiateSchema.parse(req.body);

    if (gateway === "STRIPE") {
      const result = await createStripePaymentIntent(orderId);
      res.json({ success: true, data: { gateway: "STRIPE", ...result } });
    } else {
      const result = await createRazorpayOrder(orderId);
      res.json({ success: true, data: { gateway: "RAZORPAY", ...result } });
    }
  } catch (err) {
    if (err instanceof PaymentError || err instanceof StripeServiceError) {
      res.status(err.statusCode).json({ success: false, error: err.message });
      return;
    }
    _next(err);
  }
}

// ---------------------------------------------------------------------------
// Verify Razorpay payment (client-side callback)
// ---------------------------------------------------------------------------

/**
 * POST /api/payments/verify
 * Verifies the Razorpay signature after checkout and marks the order confirmed.
 */
export async function handleVerifyPayment(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as VerifyPaymentInput;

    await verifyRazorpayPayment(
      input.orderId,
      input.razorpayOrderId,
      input.razorpayPaymentId,
      input.razorpaySignature,
    );

    res.json({
      success: true,
      data: { message: "Payment verified successfully" },
    });
  } catch (err) {
    if (err instanceof PaymentError) {
      res.status(err.statusCode).json({ success: false, error: err.message });
      return;
    }
    _next(err);
  }
}

// ---------------------------------------------------------------------------
// Razorpay webhook
// ---------------------------------------------------------------------------

/**
 * POST /api/webhooks/razorpay
 * Server-to-server webhook — validates signature, then processes the event.
 */
export async function handleRazorpayWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      res
        .status(400)
        .json({ success: false, error: "Missing signature header" });
      return;
    }

    const rawBody = req.body as Buffer;
    const isValid = validateRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      res
        .status(401)
        .json({ success: false, error: "Invalid webhook signature" });
      return;
    }

    const payload: RazorpayWebhookPayload = JSON.parse(rawBody.toString());
    await processRazorpayWebhook(payload);

    // Always respond 200 to acknowledge receipt
    res.json({ success: true });
  } catch (err) {
    // Log but still respond 200 to avoid webhook retries
    console.error("[Razorpay Webhook Error]", err);
    res.status(200).json({ success: true });
  }
}

// ---------------------------------------------------------------------------
// Stripe webhook
// ---------------------------------------------------------------------------

/**
 * POST /api/webhooks/stripe
 * Server-to-server webhook — validates signature, then processes the event.
 */
export async function handleStripeWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) {
      res
        .status(400)
        .json({ success: false, error: "Missing Stripe signature" });
      return;
    }

    const rawBody = req.body as Buffer;
    const event = constructStripeEvent(rawBody, signature);
    await processStripeWebhook(event);

    res.json({ success: true });
  } catch (err) {
    if (err instanceof StripeServiceError) {
      res.status(err.statusCode).json({ success: false, error: err.message });
      return;
    }
    console.error("[Stripe Webhook Error]", err);
    res.status(200).json({ success: true });
  }
}
