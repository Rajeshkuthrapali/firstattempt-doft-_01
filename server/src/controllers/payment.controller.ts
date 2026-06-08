import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { DomainError } from "../lib/domain-error.js";
import { sendSuccess, sendError } from "../lib/response.js";
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
  refundStripePayment,
  StripeServiceError,
} from "../services/stripe.service.js";
import { securityLogger } from "../services/security-logger.js";
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
      sendSuccess(res, { gateway: "STRIPE", ...result });
    } else {
      const result = await createRazorpayOrder(orderId);
      sendSuccess(res, { gateway: "RAZORPAY", ...result });
    }
  } catch (err) {
    if (err instanceof DomainError || err instanceof PaymentError || err instanceof StripeServiceError) {
      sendError(res, err.message, err.statusCode);
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

    sendSuccess(res, { message: "Payment verified successfully" });
  } catch (err) {
    if (err instanceof DomainError || err instanceof PaymentError) {
      sendError(res, err.message, err.statusCode);
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
      securityLogger.warn("webhook_invalid_signature", {
        gateway: "RAZORPAY",
        reason: "Missing signature header",
        ip: req.ip,
      });
      sendError(res, "Missing signature header", 400);
      return;
    }

    const rawBody = req.body as Buffer;
    const isValid = validateRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      securityLogger.warn("webhook_invalid_signature", {
        gateway: "RAZORPAY",
        reason: "Signature validation failed",
        ip: req.ip,
      });
      sendError(res, "Invalid webhook signature", 401);
      return;
    }

    const payload: RazorpayWebhookPayload = JSON.parse(rawBody.toString());
    await processRazorpayWebhook(payload);

    // Always respond 200 to acknowledge receipt
    sendSuccess(res, {});
  } catch (err) {
    // Log but still respond 200 to avoid webhook retries
    console.error("[Razorpay Webhook Error]", err);
    sendSuccess(res, {}, 200);
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
      securityLogger.warn("webhook_invalid_signature", {
        gateway: "STRIPE",
        reason: "Missing signature header",
        ip: req.ip,
      });
      sendError(res, "Missing Stripe signature", 400);
      return;
    }

    const rawBody = req.body as Buffer;
    const event = constructStripeEvent(rawBody, signature);
    await processStripeWebhook(event);

    sendSuccess(res, {});
  } catch (err) {
    if (err instanceof DomainError || err instanceof StripeServiceError) {
      sendError(res, err.message, err.statusCode);
      return;
    }
    console.error("[Stripe Webhook Error]", err);
    sendSuccess(res, {}, 200);
  }
}

// ---------------------------------------------------------------------------
// Admin: Initiate a Stripe refund
// ---------------------------------------------------------------------------

const adminRefundSchema = z.object({
  paymentIntentId: z.string().min(1),
});

/**
 * POST /api/payments/admin/refund
 * Admin-only: initiates a Stripe refund for a given PaymentIntent.
 */
export async function handleAdminRefund(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  try {
    const { paymentIntentId } = adminRefundSchema.parse(req.body);
    const result = await refundStripePayment(paymentIntentId);
    sendSuccess(res, result);
  } catch (err) {
    if (err instanceof ZodError) {
      sendError(
        res,
        "Validation failed",
        400,
        err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      );
      return;
    }
    if (err instanceof DomainError || err instanceof StripeServiceError) {
      sendError(res, err.message, err.statusCode);
      return;
    }
    _next(err);
  }
}
