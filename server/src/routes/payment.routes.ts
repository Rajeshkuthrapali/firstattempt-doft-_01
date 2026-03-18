import { Router, raw } from "express";
import { optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { verifyPaymentSchema } from "../types/order.types.js";
import {
  handleInitiatePayment,
  handleVerifyPayment,
  handleRazorpayWebhook,
  handleStripeWebhook,
} from "../controllers/payment.controller.js";

const router = Router();

/**
 * POST /api/payments/initiate
 * Initiates a payment for a given order. Body: `{ orderId, gateway? }`
 */
router.post("/initiate", optionalAuth, handleInitiatePayment);

/**
 * POST /api/payments/verify
 * Client-side callback: verifies Razorpay payment signature.
 */
router.post(
  "/verify",
  optionalAuth,
  validate(verifyPaymentSchema),
  handleVerifyPayment,
);

/**
 * POST /api/webhooks/razorpay
 * Razorpay server-to-server webhook (raw body for signature verification).
 */
router.post(
  "/webhooks/razorpay",
  raw({ type: "application/json" }),
  handleRazorpayWebhook,
);

/**
 * POST /api/webhooks/stripe
 * Stripe server-to-server webhook (raw body for signature verification).
 */
router.post(
  "/webhooks/stripe",
  raw({ type: "application/json" }),
  handleStripeWebhook,
);

export default router;
